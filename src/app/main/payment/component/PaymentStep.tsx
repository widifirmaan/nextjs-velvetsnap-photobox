'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import StepperBar from '../../StepperBar';
import PaymentPending from './PaymentPending';
import styles from '@/app/main/page.module.css';

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

export default function PaymentStep({
  price, paid, setPaid, errMsg, setErrMsg,
  captcha, templateId, compositedImage, onSuccess, onBack,
}: {
  price: number; paid: boolean; setPaid: (v: boolean) => void;
  errMsg: string | null; setErrMsg: (v: string | null) => void;
  captcha: string[]; templateId: string; compositedImage: string | null;
  onSuccess: (id: string) => void; onBack: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [snapLoaded, setSnapLoaded] = useState(false);
  const autoTriggered = useRef(false);
  const snapInitRef = useRef(false);

  useEffect(() => {
    if (snapInitRef.current) return;
    snapInitRef.current = true;
    const script = document.createElement('script');
    script.src = `https://app.sandbox.midtrans.com/snap/snap.js`;
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    script.async = true;
    script.onload = () => setSnapLoaded(true);
    document.body.appendChild(script);
  }, []);

  const uploadImages = useCallback(async (): Promise<{ captures: string[]; finalImage: string }> => {
    const uploadOne = async (dataUri: string, folder: string): Promise<string> => {
      let payload = dataUri;
      if (payload.length > 3.8 * 1024 * 1024) {
        const img = await new Promise<HTMLImageElement>((res, rej) => {
          const i = new window.Image();
          i.onload = () => res(i);
          i.onerror = rej;
          i.src = payload;
        });
        const c = document.createElement('canvas');
        const maxDim = 1600;
        const sc = Math.min(1, maxDim / img.naturalWidth, maxDim / img.naturalHeight);
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

    const finalImage = compositedImage?.startsWith('data:')
      ? await uploadOne(compositedImage, 'velvetsnap/final')
      : (compositedImage || '');
    const captures = await Promise.all(
      (captcha || []).map(async (c) =>
        c.startsWith('data:') ? await uploadOne(c, 'velvetsnap/captures') : c
      )
    );
    return { captures, finalImage };
  }, [captcha, compositedImage]);

  useEffect(() => {
    if (autoTriggered.current || paid) return;
    if (!snapLoaded || !templateId || !price) return;

    autoTriggered.current = true;
    setLoading(true);
    setErrMsg(null);

    const sessionId = sessionStorage.getItem('photobooth_session') ||
      (typeof crypto !== 'undefined' && crypto.randomUUID?.()) ||
      Math.random().toString(36).substring(2);
    sessionStorage.setItem('photobooth_session', sessionId);

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

        window.snap.pay(token, {
          onSuccess: async () => {
            setPaid(true);
            if (transactionId) sessionStorage.setItem('photobooth_txId', transactionId);
            try {
              const { captures: uploadedCaptures, finalImage: uploadedFinal } = await uploadImages();
              await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId, templateId: templateId || 't1', price,
                  captures: uploadedCaptures, finalImage: uploadedFinal,
                  status: 'PAID', orderId,
                }),
              });
            } catch {}
            setTimeout(() => onSuccess(transactionId || 'ok'), 800);
          },
          onPending: () => {
            setPaid(true);
            const poll = setInterval(async () => {
              try {
                const res = await fetch('/api/midtrans/status?sessionId=' + encodeURIComponent(sessionId));
                const data = await res.json();
                if (data.success && data.data.status === 'PAID') {
                  clearInterval(poll);
                  if (data.data._id) sessionStorage.setItem('photobooth_txId', data.data._id);
                  try {
                    const { captures: uploadedCaptures, finalImage: uploadedFinal } = await uploadImages();
                    await fetch('/api/transactions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        sessionId, templateId: templateId || 't1', price,
                        captures: uploadedCaptures, finalImage: uploadedFinal,
                        status: 'PAID', orderId,
                      }),
                    });
                  } catch {}
                  onSuccess(data.data._id || 'ok');
                }
              } catch {}
            }, 3000);
          },
          onError: () => {
            setErrMsg('Payment failed. Please try again.');
            setLoading(false);
          },
          onClose: () => {
            setLoading(false);
          },
        });
      } catch (err: unknown) {
        setErrMsg(err instanceof Error ? err.message : String(err));
        setLoading(false);
        autoTriggered.current = false;
      }
    })();
  }, [snapLoaded, templateId, price, paid, uploadImages, onSuccess, setErrMsg, setPaid]);

  return (
    <div className={`${styles.stepPage} ${styles.stepPagePayment}`}>
      <StepperBar current={3} total={5} />
      <div className={styles.paymentCard}>
        {!paid && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <button className={styles.boothBtnSecondary} onClick={onBack}><ArrowLeft size={16} /> Back</button>
          </div>
        )}
        <h2 className={styles.stepHeading}>Payment</h2>
        <p style={{ color: '#888', marginBottom: '24px' }}>Scan the QRIS code to pay</p>
        {paid ? (
          <PaymentPending errMsg={errMsg} />
        ) : (
          <>
            <div className={styles.paymentQr}>
              <Loader2 size={48} className={styles.spinner} />
            </div>
            <div className={styles.paymentPrice}>Rp {price.toLocaleString('id-ID')}</div>
            {errMsg && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <p style={{ color: 'var(--danger-color)', fontSize: '13px' }}>{errMsg}</p>
                <button
                  className={styles.boothBtnPrimary}
                  onClick={() => window.location.reload()}
                  style={{ marginTop: 12 }}
                >
                  Retry Payment
                </button>
              </div>
            )}
            {!errMsg && loading && (
              <p style={{ color: '#888', fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>
                {!snapLoaded ? 'Loading payment gateway...' : 'Preparing QRIS...'}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
