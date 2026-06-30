'use client';
import { Loader2, AlertCircle } from 'lucide-react';
import styles from '../../page.module.css';

export default function PaymentPending({ errMsg }: { errMsg?: string | null }) {
  return (
    <div className={styles.paymentCard} style={{ alignItems: 'center', textAlign: 'center', padding: 24 }}>
      <Loader2 size={32} className="spin" style={{ color: 'var(--np-accent)' }} />
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, margin: '12px 0 4px', color: 'var(--np-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Waiting for Payment...
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--np-text-muted)' }}>
        Scan the QRIS code with your e-wallet app to complete payment
      </p>
      {errMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <AlertCircle size={14} color="var(--np-accent)" />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--np-accent)' }}>{errMsg}</p>
        </div>
      )}
    </div>
  );
}
