// File: src/lib/hooks/usePaymentFlow.ts
// Description: Auto-added top comment for easier file identification.

'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { STORAGE_KEYS, MIDTRANS_SNAP_URL, UPLOAD_COMPRESS_THRESHOLD, UPLOAD_PAYMENT_MAX_DIM, SNAP_LOAD_TIMEOUT, SNAP_PAY_TIMEOUT, PAYMENT_SUCCESS_DELAY, PAYMENT_POLL_INTERVAL } from '../utils/constants';

export interface PaymentFlowOptions {
  price: number;
  templateId: string;
  captures: string[];
  compositedImage: string | null;
  onSuccess: (id: string) => void;
}

export interface PaymentFlowResult {
  loading: boolean;
  snapLoaded: boolean;
  snapError: boolean;
  paid: boolean;
  errMsg: string | null;
  handleBypass: () => Promise<void>;
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: {
        onSuccess?: (result: unknown) => void;
        onPending?: (result: unknown) => void;
        onError?: (result: unknown) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

export function usePaymentFlow({ price, templateId, captures, compositedImage, onSuccess }: PaymentFlowOptions): PaymentFlowResult {
  const [loading, setLoading] = useState(true);
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [snapError, setSnapError] = useState(false);
  const [paid, setPaid] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const autoTriggered = useRef(false);
  const snapInitRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const payTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (snapInitRef.current) return;
    snapInitRef.current = true;
    const script = document.createElement('script');
    script.src = MIDTRANS_SNAP_URL;
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    script.async = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      setSnapError(true);
    }, SNAP_LOAD_TIMEOUT);

    script.onload = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = null;
      setSnapLoaded(true);
    };
    script.onerror = (_e) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = null;
      setSnapError(true);
    };
    document.body.appendChild(script);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (pollRef.current) clearInterval(pollRef.current);
      if (payTimeoutRef.current) clearTimeout(payTimeoutRef.current);
      snapInitRef.current = false;
    };
  }, []);

  const uploadImages = useCallback(async (): Promise<{ captures: string[]; finalImage: string }> => {
    const uploadOne = async (dataUri: string, folder: string): Promise<string> => {
      let payload = dataUri;
      if (payload.length > UPLOAD_COMPRESS_THRESHOLD) {
        const img = await new Promise<HTMLImageElement>((res, rej) => {
          const i = new window.Image();
          i.onload = () => res(i);
          i.onerror = rej;
          i.src = payload;
        });
        const c = document.createElement('canvas');
        const sc = Math.min(1, UPLOAD_PAYMENT_MAX_DIM / img.naturalWidth, UPLOAD_PAYMENT_MAX_DIM / img.naturalHeight);
        c.width = Math.round(img.naturalWidth * sc);
        c.height = Math.round(img.naturalHeight * sc);
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        payload = c.toDataURL('image/jpeg', 0.75);
      }
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUri: payload, folder }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');
      return data.url;
    };

    const finalImage = compositedImage
      ? await uploadOne(compositedImage, 'velvetsnap/final')
      : '';
    const uploadedCaptures = await Promise.all(
      (captures || []).map(async (c) =>
        c.startsWith('data:') ? await uploadOne(c, 'velvetsnap/captures') : c
      )
    );
    return { captures: uploadedCaptures, finalImage };
  }, [captures, compositedImage]);

  const uploadImagesFn = useRef(uploadImages);
  uploadImagesFn.current = uploadImages;

  useEffect(() => {
    if (autoTriggered.current || paid) return;
    if (!snapLoaded || !templateId || !price) return;
    autoTriggered.current = true;
    setLoading(true);
    setErrMsg(null);

    const sessionId = sessionStorage.getItem(STORAGE_KEYS.PHOTOBOOTH_SESSION) ||
      (typeof crypto !== 'undefined' && crypto.randomUUID?.()) ||
      Math.random().toString(36).substring(2);
    sessionStorage.setItem(STORAGE_KEYS.PHOTOBOOTH_SESSION, sessionId);

    (async () => {
      try {
        const chargeRes = await fetch('/api/midtrans/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, templateId: templateId || 't1', price }),
        });
        const chargeData = await chargeRes.json();
        if (!chargeRes.ok || !chargeData.success) {
          throw new Error(chargeData.error || 'Failed to create payment');
        }

        const { token, transactionId, orderId } = chargeData.data;

        if (!window.snap) {
          throw new Error('Payment gateway not loaded');
        }

        payTimeoutRef.current = setTimeout(() => {
          setErrMsg('Payment popup may be blocked or timed out. Please try again.');
          setLoading(false);
          autoTriggered.current = false;
          payTimeoutRef.current = null;
        }, SNAP_PAY_TIMEOUT);

        window.snap.pay(token, {
          onSuccess: async () => {
            if (payTimeoutRef.current) clearTimeout(payTimeoutRef.current);
            payTimeoutRef.current = null;
            setPaid(true);
            if (transactionId) sessionStorage.setItem(STORAGE_KEYS.PHOTOBOOTH_TX_ID, transactionId);
            try {
              const { captures: uploadedCaptures, finalImage: uploadedFinal } = await uploadImagesFn.current();
              await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId, templateId: templateId || 't1', price,
                  captures: uploadedCaptures, finalImage: uploadedFinal,
                  status: 'PAID', orderId,
                }),
              });
            } catch (e) { console.error('Payment upload failed', e); }
            setTimeout(() => onSuccess(transactionId || 'ok'), PAYMENT_SUCCESS_DELAY);
          },
          onPending: () => {
            if (payTimeoutRef.current) clearTimeout(payTimeoutRef.current);
            payTimeoutRef.current = null;
            setPaid(true);
            pollRef.current = setInterval(async () => {
              try {
                const res = await fetch('/api/midtrans/status?sessionId=' + encodeURIComponent(sessionId));
                const data = await res.json();
                if (data.success && data.data.status === 'PAID') {
                  if (pollRef.current) clearInterval(pollRef.current);
                  pollRef.current = null;
                  if (data.data._id) sessionStorage.setItem(STORAGE_KEYS.PHOTOBOOTH_TX_ID, data.data._id);
                  try {
                    const { captures: uploadedCaptures, finalImage: uploadedFinal } = await uploadImagesFn.current();
                    await fetch('/api/transactions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        sessionId, templateId: templateId || 't1', price,
                        captures: uploadedCaptures, finalImage: uploadedFinal,
                        status: 'PAID', orderId,
                      }),
                    });
                  } catch (e) { console.error('Payment upload failed', e); }
                  onSuccess(data.data._id || 'ok');
                }
              } catch (e) { console.error('Payment poll error', e); }
            }, PAYMENT_POLL_INTERVAL);
          },
          onError: () => {
            if (payTimeoutRef.current) clearTimeout(payTimeoutRef.current);
            payTimeoutRef.current = null;
            setErrMsg('Payment failed. Please try again.');
            setLoading(false);
          },
          onClose: () => {
            if (payTimeoutRef.current) clearTimeout(payTimeoutRef.current);
            payTimeoutRef.current = null;
            setLoading(false);
          },
        });
      } catch (err: unknown) {
        setErrMsg(err instanceof Error ? err.message : String(err));
        setLoading(false);
        autoTriggered.current = false;
      }
    })();
    return () => {
      if (payTimeoutRef.current) clearTimeout(payTimeoutRef.current);
      payTimeoutRef.current = null;
    };
  }, [snapLoaded, templateId, price, paid, onSuccess]);

  const handleBypass = useCallback(async () => {
    if (paid) return;
    setErrMsg(null);
    const now = Date.now();
    const sessionId = sessionStorage.getItem(STORAGE_KEYS.PHOTOBOOTH_SESSION) ||
      (typeof crypto !== 'undefined' && crypto.randomUUID?.()) ||
      Math.random().toString(36).substring(2);
    sessionStorage.setItem(STORAGE_KEYS.PHOTOBOOTH_SESSION, sessionId);
    const orderId = 'BYPASS_' + now + '_' + Math.random().toString(36).slice(2, 6);
    let uploadedCaptures: string[] = [];
    let uploadedFinal = '';
    try {
      const result = await uploadImagesFn.current();
      uploadedCaptures = result.captures;
      uploadedFinal = result.finalImage;
    } catch (e) { console.error('Bypass upload failed (ok to proceed)', e); }
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId, templateId: templateId || 't1', price,
          captures: uploadedCaptures, finalImage: uploadedFinal,
          status: 'PAID', orderId,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?._id) {
        sessionStorage.setItem(STORAGE_KEYS.PHOTOBOOTH_TX_ID, data.data._id);
      }
      setPaid(true);
      setTimeout(() => onSuccess('bypass_' + now), PAYMENT_SUCCESS_DELAY);
    } catch (e) {
      console.error('Bypass failed', e);
      setErrMsg('Bypass failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  }, [paid, templateId, price, onSuccess]);

  return { loading, snapLoaded, snapError, paid, errMsg, handleBypass };
}
