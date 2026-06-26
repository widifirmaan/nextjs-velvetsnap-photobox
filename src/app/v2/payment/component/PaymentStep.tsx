'use client';
import { ArrowLeft } from 'lucide-react';
import styles from '../../page.module.css';
import PaymentPending from './PaymentPending';
import { usePaymentFlow } from '@/lib/usePaymentFlow';

export default function PaymentStep({ price, captures, onSuccess, onBack }: {
  price: number; captures: string[];
  onSuccess: (orderId: string) => void; onBack: () => void;
}) {
  const f = usePaymentFlow({ price, templateId: 't1', captures, compositedImage: null, onSuccess });

  if (!f.snapLoaded && !f.snapError) return <PaymentPending />;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px 24px' }}>
        <button className={styles.boothBtn} onClick={onBack} style={{ padding: '8px 16px', fontSize: 11 }}>
          <ArrowLeft size={14} /> BACK
        </button>
      </div>
      <div className={styles.paymentLayout}>
        <div className={styles.paymentCard}>
          <h3>Complete Payment</h3>
          <div className={styles.paymentPrice}>Rp {price.toLocaleString('id-ID')}</div>
          {f.paid ? (
            <p className={styles.paymentStatus}>PAYMENT CONFIRMED</p>
          ) : f.errMsg ? (
            <p className={styles.paymentStatus} style={{ color: 'var(--np-accent)' }}>
              {f.errMsg}
            </p>
          ) : f.snapError ? (
            <p className={styles.paymentStatus} style={{ color: 'var(--np-accent)' }}>
              PAYMENT GATEWAY FAILED TO LOAD
            </p>
          ) : (
            <div className={styles.paymentQris}>
              <p className={styles.paymentStatus}>
                {!f.snapLoaded ? 'LOADING GATEWAY...' : 'AWAITING PAYMENT...'}
              </p>
            </div>
          )}
          <button className={styles.paymentBypass} onClick={f.handleBypass} disabled={f.paid}>
            BYPASS PAYMENT (TESTING)
          </button>
        </div>
      </div>
    </div>
  );
}
