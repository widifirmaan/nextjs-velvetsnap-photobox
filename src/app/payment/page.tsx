'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, CheckCircle } from 'lucide-react';
import styles from './page.module.css';

export default function PaymentPage() {
  const router = useRouter();
  const [price, setPrice] = useState(35000);
  const [paid, setPaid] = useState(false);

  const handleSimulatePayment = async () => {
    setPaid(true);
    
    try {
      const templateId = sessionStorage.getItem('photobooth_template') || 't1';
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, price, status: 'PAID' })
      });
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      router.push('/result');
    }, 2000);
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
            
            <button className="mac-button" onClick={handleSimulatePayment} style={{ width: '100%', marginTop: '24px' }}>
              Simulate Successful Payment
            </button>
          </>
        )}
      </div>
    </div>
  );
}
