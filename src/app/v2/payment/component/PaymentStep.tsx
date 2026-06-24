'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from '../../page.module.css';
import PaymentPending from './PaymentPending';
import { SNAP_PAY_TIMEOUT, PAYMENT_SUCCESS_DELAY } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

export default function PaymentStep({ price, captures, sessionId, onSuccess, onBack }: {
  price: number; captures: string[]; sessionId: string;
  onSuccess: (orderId: string) => void; onBack: () => void;
}) {
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [snapLoading, setSnapLoading] = useState(true);
  const [payTimeout, setPayTimeout] = useState(false);
  const [paying, setPaying] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const payTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const payTimeoutStarted = useRef(false);

  const loadSnap = useCallback(async () => {
    setSnapLoading(true);
    try {
      const res = await fetch('/api/midtrans/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          price,
          customerName: 'Photobooth Guest',
          customerEmail: 'guest@photobooth.com',
        }),
      });
      const data = await res.json();
      if (data.snapToken) {
        setSnapLoaded(true);
        setQrUrl(data.qrUrl || null);
        if (typeof window !== 'undefined' && window.snap) {
          window.snap.pay(data.snapToken, {
            onSuccess: (r) => { handlePaySuccess(r, data.transactionId); },
            onPending: () => {},
            onError: (r) => { console.error('Snap error:', r); },
            onClose: () => { setPaying(false); },
          });
        }
      }
    } catch (e) { console.error('load snap failed', e); }
    setSnapLoading(false);
  }, [sessionId, price]);

  useEffect(() => {
    if (typeof window === 'undefined' || window.snap) { loadSnap(); return; }
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    script.onload = () => loadSnap();
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [loadSnap]);

  useEffect(() => {
    if (!payTimeoutStarted.current && snapLoaded) {
      payTimeoutStarted.current = true;
      payTimeoutRef.current = setTimeout(() => {
        setPayTimeout(true);
      }, SNAP_PAY_TIMEOUT);
    }
    return () => { if (payTimeoutRef.current) clearTimeout(payTimeoutRef.current); };
  }, [snapLoaded]);

  const handlePaySuccess = useCallback(async (result: unknown, txId?: string) => {
    if (payTimeoutRef.current) clearTimeout(payTimeoutRef.current);
    setPayTimeout(false);
    try {
      if (captures.length > 0) {
        await Promise.all(captures.map(async (dataUrl) => {
          const blob = await (await fetch(dataUrl)).blob();
          const form = new FormData();
          form.append('file', blob, `capture_${uuidv4()}.jpg`);
          await fetch('/api/upload', { method: 'POST', body: form });
        }));
      }
    } catch (e) { console.error('upload failed', e); }
    const oid = (result as Record<string, string>)?.order_id || txId || `TX_${Date.now()}`;
    setTimeout(() => onSuccess(oid), PAYMENT_SUCCESS_DELAY);
  }, [captures, onSuccess]);

  const handleBypass = useCallback(async () => {
    const now = Date.now();
    const orderIdStr = `BYPASS_${now}_${uuidv4().slice(0, 8)}`;
    setPaying(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captures, sessionId, orderId: orderIdStr }),
      });
      if (!res.ok) { setPaying(false); return; }
      const txRes = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, orderId: orderIdStr, status: 'PAID', price }),
      });
      if (!txRes.ok) { setPaying(false); return; }
      setPaying(false);
      onSuccess('bypass_' + now);
    } catch { setPaying(false); }
  }, [captures, sessionId, price, onSuccess]);

  if (snapLoading) return <PaymentPending />;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px 24px' }}>
        <button className={styles.boothBtn} onClick={onBack} style={{ padding: '8px 16px', fontSize: 11 }}>
          <ArrowLeft size={14} /> BACK
        </button>
      </div>
      <div className={styles.paymentLayout}>
        <div className={styles.paymentCard}>
          <h3>COMPLETE PAYMENT</h3>
          <div className={styles.paymentPrice}>Rp {price.toLocaleString('id-ID')}</div>
          {payTimeout ? (
            <p className={styles.paymentStatus} style={{ color: 'var(--np-accent)' }}>
              PAYMENT TIMEOUT — PLEASE TRY AGAIN
            </p>
          ) : (
            <div className={styles.paymentQris}>
              {qrUrl && <img src={qrUrl} alt="QR Code" />}
              <p className={styles.paymentStatus}>
                {paying ? 'PROCESSING...' : snapLoaded ? 'SCAN QR TO PAY' : 'LOADING...'}
              </p>
            </div>
          )}
          <button className={styles.paymentBypass} onClick={handleBypass} disabled={paying}>
            BYPASS PAYMENT (TESTING)
          </button>
        </div>
      </div>
    </div>
  );
}
