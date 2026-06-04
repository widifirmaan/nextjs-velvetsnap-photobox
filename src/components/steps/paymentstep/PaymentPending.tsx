'use client';

import { QrCode } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function PaymentPending({ price, errMsg, onPay }: {
  price: number; errMsg: string | null; onPay: () => void;
}) {
  return (
    <>
      <div className={styles.paymentQr}><QrCode size={120} color="#1d1d1f" /></div>
      <div className={styles.paymentPrice}>Rp {price.toLocaleString('id-ID')}</div>
      {errMsg && <p style={{ color: 'red', fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>{errMsg}</p>}
      <button className={styles.boothBtnPrimary} onClick={onPay} style={{ width: '100%', marginTop: '24px' }}>
        Simulate Successful Payment
      </button>
    </>
  );
}
