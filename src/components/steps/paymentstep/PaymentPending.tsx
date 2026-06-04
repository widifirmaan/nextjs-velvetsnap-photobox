'use client';
import { CheckCircle } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function PaymentPending() {
  return (
    <div className={styles.paymentSuccess}>
      <CheckCircle size={80} color="#262626" />
      <h3>Payment Successful!</h3>
      <p>Preparing your photos...</p>
    </div>
  );
}
