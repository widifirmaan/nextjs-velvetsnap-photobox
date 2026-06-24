'use client';
import { Loader2 } from 'lucide-react';
import styles from '../../page.module.css';

export default function PaymentPending({ message }: { message?: string }) {
  return (
    <div className={styles.paymentCard}>
      <Loader2 size={32} className="spin" style={{ color: 'var(--np-accent)' }} />
      <p className={styles.paymentStatus}>{message || 'PREPARING PAYMENT...'}</p>
    </div>
  );
}
