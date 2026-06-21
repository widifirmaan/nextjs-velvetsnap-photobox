'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import styles from './page.module.css';

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

export default function PaymentPage() {
  const router = useRouter();
  const [price, setPrice] = useState(35000);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    const templateId = sessionStorage.getItem('photobooth_template');
    if (templateId) {
      fetch('/api/templates')
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            const t = d.data.find((t: any) => t.templateId === templateId);
            if (t?.templatePrice) setPrice(t.templatePrice);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const script = document.createElement('script');
    script.src = `https://app.sandbox.midtrans.com/snap/snap.js`;
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handlePay = async () => {
    setLoading(true);
    setErrMsg(null);
    try {
      const sessionId = sessionStorage.getItem('photobooth_session') ||
        crypto.randomUUID?.() || Math.random().toString(36).substring(2);
      if (!sessionStorage.getItem('photobooth_session')) {
        sessionStorage.setItem('photobooth_session', sessionId);
      }
      const templateId = sessionStorage.getItem('photobooth_template') || 't1';
      const capturesStr = sessionStorage.getItem('photobooth_captures');
      const captures = capturesStr ? JSON.parse(capturesStr) : [];
      const finalImage = sessionStorage.getItem('photobooth_composited') || '';

      const chargeRes = await fetch('/api/midtrans/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, templateId, price, captures, finalImage }),
      });
      const chargeData = await chargeRes.json();
      if (!chargeRes.ok || !chargeData.success) {
        throw new Error(chargeData.error || 'Failed to create payment');
      }

      const { token, orderId, transactionId } = chargeData.data;

      if (!window.snap) {
        throw new Error('Payment gateway not loaded yet. Please refresh and try again.');
      }

      window.snap.pay(token, {
        onSuccess: async () => {
          setPaid(true);
          const id = transactionId;
          if (id) sessionStorage.setItem('photobooth_txId', id);
          setTimeout(() => router.push('/result'), 1500);
        },
        onPending: () => {
          setPaid(true);
          const poll = setInterval(async () => {
            const statusRes = await fetch('/api/midtrans/status?orderId=' + encodeURIComponent(orderId));
            const statusData = await statusRes.json();
            if (statusData.success && statusData.data.status === 'PAID') {
              clearInterval(poll);
              if (statusData.data._id) sessionStorage.setItem('photobooth_txId', statusData.data._id);
              router.push('/result');
            }
          }, 3000);
        },
        onError: (result) => {
          setErrMsg(result?.status_message || 'Payment failed');
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
          if (!paid) setErrMsg('Payment cancelled.');
        },
      });
    } catch (err: any) {
      setErrMsg(err.message || String(err));
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className={`glass-panel ${styles.paymentCard}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <button className="mac-button secondary" onClick={() => router.back()} style={{ padding: '10px 20px', fontSize: '14px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <h2 className="title" style={{ fontSize: '32px' }}>Payment</h2>
        <p className="subtitle" style={{ marginBottom: '24px' }}>Scan the QRIS code to pay</p>

        {paid ? (
          <div className={styles.successState}>
            <Loader2 size={48} color="var(--accent-color)" className={styles.spinner} />
            <h3>Waiting for Payment...</h3>
            <p>Scan the QRIS code with your e-wallet app to complete payment</p>
          </div>
        ) : (
          <>
            <div className={styles.qrPlaceholder}>
              {loading ? (
                <Loader2 size={48} className={styles.spinner} />
              ) : (
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                  <rect x="10" y="10" width="40" height="40" rx="4" fill="#1d1d1f" />
                  <rect x="10" y="70" width="40" height="40" rx="4" fill="#1d1d1f" />
                  <rect x="70" y="10" width="40" height="40" rx="4" fill="#1d1d1f" />
                  <rect x="58" y="58" width="14" height="14" rx="2" fill="#1d1d1f" opacity="0.3" />
                  <rect x="58" y="48" width="4" height="4" rx="1" fill="#1d1d1f" opacity="0.3" />
                  <rect x="68" y="48" width="4" height="4" rx="1" fill="#1d1d1f" opacity="0.3" />
                  <rect x="58" y="58" width="4" height="4" rx="1" fill="#1d1d1f" opacity="0.3" />
                  <rect x="68" y="58" width="4" height="4" rx="1" fill="#1d1d1f" opacity="0.3" />
                </svg>
              )}
            </div>

            <div className={styles.priceTag}>
              Rp {price.toLocaleString('id-ID')}
            </div>

            {errMsg && !loading && (
              <p style={{ color: 'var(--danger-color)', fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>
                <AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {errMsg}
              </p>
            )}

            <button
              className="mac-button"
              onClick={handlePay}
              disabled={loading}
              style={{ width: '100%', marginTop: '24px', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Processing...' : 'Pay with QRIS'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
