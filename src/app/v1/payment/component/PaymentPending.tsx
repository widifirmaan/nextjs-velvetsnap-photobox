'use client';
import { Loader2, AlertCircle } from 'lucide-react';
import styles from '@/app/v1/page.module.css';

export default function PaymentPending({ errMsg }: { errMsg?: string | null }) {
  return (
    <div className={styles.paymentSuccess}>
      <Loader2 size={48} color="#262626" className={styles.spinner} />
      <h3>Waiting for Payment...</h3>
      <p>Scan the QRIS code with your e-wallet app to complete payment</p>
      {errMsg && (
        <p style={{ color: 'var(--danger-color)', fontSize: '13px', marginTop: '8px' }}>
          <AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {errMsg}
        </p>
      )}
    </div>
  );
}
