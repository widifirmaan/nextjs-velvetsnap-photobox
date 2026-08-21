// File: src/lib/hooks/usePaymentFlow.ts
// Description: Auto-added top comment for easier file identification.

'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { STORAGE_KEYS, MIDTRANS_SNAP_URL, UPLOAD_COMPRESS_THRESHOLD, UPLOAD_PAYMENT_MAX_DIM, SNAP_LOAD_TIMEOUT, SNAP_PAY_TIMEOUT, PAYMENT_SUCCESS_DELAY, PAYMENT_POLL_INTERVAL } from '../utils/constants';

export interface PaymentFlowOptions {
  price: number;
  templateId: string;
  captures: string[];
  videos: string[];
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

export function usePaymentFlow({ price, templateId, captures, videos, compositedImage, onSuccess }: PaymentFlowOptions): PaymentFlowResult {
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

  const uploadImages = useCallback(async (): Promise<{ captures: string[]; videos: string[]; finalImage: string }> => {
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

    const blobToDataUri = async (blobUrl: string): Promise<string> => {
      const blob = await fetch(blobUrl).then((r) => r.blob());
      return await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.onerror = () => rej(new Error('Failed to read video blob'));
        reader.readAsDataURL(blob);
      });
    };

    const finalImage = compositedImage
      ? await uploadOne(compositedImage, 'velvetsnap/final')
      : '';
    const uploadedCaptures = await Promise.all(
      (captures || []).map(async (c) =>
        c.startsWith('data:') ? await uploadOne(c, 'velvetsnap/captures') : c
      )
    );
    const uploadedVideos = await Promise.all(
      (videos || []).map(async (v) => {
        if (!v) return '';
        if (v.startsWith('data:')) return await uploadOne(v, 'velvetsnap/videos');
        const dataUri = await blobToDataUri(v);
        return await uploadOne(dataUri, 'velvetsnap/videos');
      })
    );
    return { captures: uploadedCaptures, videos: uploadedVideos, finalImage };
  }, [captures, videos, compositedImage]);

  const uploadImagesFn = useRef(uploadImages);
  uploadImagesFn.current = uploadImages;

  const saveTx = useCallback(async (sessionId: string, orderId: string, status: 'PAID' | 'PENDING', photos?: { captures: string[]; videos: string[]; finalImage: string }) => {
    const body: Record<string, unknown> = {
      sessionId,
      templateId: templateId || 't1',
      price,
      status,
      orderId,
    };
    if (photos) {
      body.captures = photos.captures;
      body.videos = photos.videos;
      body.finalImage = photos.finalImage;
    }
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to save transaction');
    return data;
  }, [templateId, price]);

  const uploadWithRetry = useCallback(async (): Promise<{ captures: string[]; videos: string[]; finalImage: string }> => {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await uploadImagesFn.current();
      } catch (e) {
        lastError = e;
        if (attempt < 3) await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
    throw lastError;
  }, []);

  const reportError = useCallback((message: string, err: unknown) => {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(message, err);
    try {
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: 'error', message, data: { detail } }),
      }).catch(() => {});
    } catch {}
  }, []);

  // Save the transaction, upload photos/videos and continue to the result step
  // without going through Midtrans (used for free strips and bypass).
  const finalizeOrder = useCallback(async (prefix: string) => {
    const now = Date.now();
    const sessionId = sessionStorage.getItem(STORAGE_KEYS.PHOTOBOOTH_SESSION) ||
      (typeof crypto !== 'undefined' && crypto.randomUUID?.()) ||
      Math.random().toString(36).substring(2);
    sessionStorage.setItem(STORAGE_KEYS.PHOTOBOOTH_SESSION, sessionId);
    const orderId = prefix + '_' + now + '_' + Math.random().toString(36).slice(2, 6);
    try {
      await saveTx(sessionId, orderId, 'PAID');
    } catch (e) {
      reportError('Save transaction (pre-upload) failed', e);
    }
    try {
      const photos = await uploadWithRetry();
      const saved = await saveTx(sessionId, orderId, 'PAID', photos);
      const txId = saved.data?._id || prefix.toLowerCase() + '_' + now;
      if (saved.data?._id) {
        sessionStorage.setItem(STORAGE_KEYS.PHOTOBOOTH_TX_ID, saved.data._id);
      }
      setPaid(true);
      setTimeout(() => onSuccess(txId), PAYMENT_SUCCESS_DELAY);
    } catch (e) {
      reportError(prefix === 'FREE' ? 'Free strip upload failed' : 'Bypass upload failed', e);
      setErrMsg('Foto gagal diunggah. Hubungi admin.');
      autoTriggered.current = false;
    }
  }, [saveTx, uploadWithRetry, reportError, onSuccess]);

  useEffect(() => {
    if (autoTriggered.current || paid) return;
    if (!templateId) return;
    // Free strip (random price can be Rp 0): skip Midtrans entirely.
    if (price === 0) {
      autoTriggered.current = true;
      setLoading(true);
      setErrMsg(null);
      void finalizeOrder('FREE');
      return;
    }
    if (!snapLoaded || !price) return;
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
              await saveTx(sessionId, orderId, 'PENDING');
            } catch (e) {
              reportError('Save transaction (pre-upload) failed', e);
            }
            try {
              const photos = await uploadWithRetry();
              await saveTx(sessionId, orderId, 'PENDING', photos);
            } catch (e) {
              reportError('Payment photo upload failed', e);
              setErrMsg('Pembayaran sukses, tetapi foto gagal diunggah. Hubungi admin.');
            }
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
                    await saveTx(sessionId, orderId, 'PENDING');
                  } catch (e) {
                    reportError('Save transaction (poll, pre-upload) failed', e);
                  }
                  try {
                    const photos = await uploadWithRetry();
                    await saveTx(sessionId, orderId, 'PENDING', photos);
                  } catch (e) {
                    reportError('Payment poll photo upload failed', e);
                    setErrMsg('Pembayaran sukses, tetapi foto gagal diunggah. Hubungi admin.');
                  }
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
  }, [snapLoaded, templateId, price, paid, onSuccess, finalizeOrder]);

  const handleBypass = useCallback(async () => {
    if (paid) return;
    setErrMsg(null);
    await finalizeOrder('BYPASS');
  }, [paid, finalizeOrder]);

  return { loading, snapLoaded, snapError, paid, errMsg, handleBypass };
}
