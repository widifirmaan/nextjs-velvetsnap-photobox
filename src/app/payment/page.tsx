'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, CheckCircle } from 'lucide-react';
import styles from './page.module.css';

export default function PaymentPage() {
  const router = useRouter();
  const [price, setPrice] = useState(35000);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const templateId = sessionStorage.getItem('photobooth_template');
    if (templateId) {
      fetch('/api/templates')
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            const t = d.data.find((t: any) => t.templateId === templateId);
            if (t?.price) setPrice(t.price);
          }
        })
        .catch(() => {});
    }
  }, []);

  const [errMsg, setErrMsg] = useState<string | null>(null);

  const handleSimulatePayment = async () => {
    setPaid(true);
    setErrMsg(null);
    
    try {
      const templateId = sessionStorage.getItem('photobooth_template') || 't1';
      const capturesStr = sessionStorage.getItem('photobooth_captures');
      const captures = capturesStr ? JSON.parse(capturesStr) : [];
      const finalImage = sessionStorage.getItem('photobooth_composited') || '';
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, price, status: 'PAID', captures, finalImage })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrMsg(data.error || 'Unknown error');
        setPaid(false);
        return;
      }
      setTimeout(() => {
        router.push('/result');
      }, 1500);
    } catch (err: any) {
      setErrMsg(err.message || String(err));
      setPaid(false);
    }
  };

  return (
    <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className={`glass-panel ${styles.paymentCard}`}>
        <h2 className="title" style={{ fontSize: '32px' }}>Payment</h2>
        <p className="subtitle" style={{ marginBottom: '24px' }}>Scan the QRIS code to pay</p>
        
        {paid ? (
          <div className={styles.successState}>
            <CheckCircle size={80} color="var(--accent-color)" />
            <h3>Payment Successful!</h3>
            <p>Preparing your photos...</p>
          </div>
        ) : (
          <>
            <div className={styles.qrPlaceholder}>
              <QrCode size={120} color="#1d1d1f" />
            </div>
            
            <div className={styles.priceTag}>
              Rp {price.toLocaleString('id-ID')}
            </div>

            {errMsg && (
              <p style={{ color: 'var(--danger-color)', fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>
                {errMsg}
              </p>
            )}
            
            <button className="mac-button" onClick={handleSimulatePayment} style={{ width: '100%', marginTop: '24px' }}>
              Simulate Successful Payment
            </button>
          </>
        )}
      </div>
    </div>
  );
}
