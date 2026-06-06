'use client';
import { ArrowLeft, QrCode } from 'lucide-react';
import StepperBar from '../../StepperBar';
import PaymentPending from './PaymentPending';
import styles from '@/app/main/page.module.css';

export default function PaymentStep({
  price, paid, setPaid, errMsg, setErrMsg,
  captcha, templateId, compositedImage, onSuccess, onBack,
}: {
  price: number; paid: boolean; setPaid: (v: boolean) => void;
  errMsg: string | null; setErrMsg: (v: string | null) => void;
  captcha: string[]; templateId: string; compositedImage: string | null;
  onSuccess: (id: string) => void; onBack: () => void;
}) {
  const handlePay = async () => {
    setPaid(true); setErrMsg(null);
    try {
      const finalImage = compositedImage || '';
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, price, status: 'PAID', captures: captcha, finalImage }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrMsg(data.error || 'Unknown error'); setPaid(false); return;
      }
      setTimeout(() => onSuccess(data.data?._id || data._id || 'ok'), 800);
    } catch (err: any) {
      setErrMsg(err.message || String(err)); setPaid(false);
    }
  };

  return (
    <div className={`${styles.stepPage} ${styles.stepPagePayment}`}>
      <StepperBar current={3} total={5} />
      <div className={styles.paymentCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <button className={styles.boothBtnSecondary} onClick={onBack}><ArrowLeft size={16} /> Back</button>
        </div>
        <h2 className={styles.stepHeading}>Payment</h2>
        <p style={{ color: '#888', marginBottom: '24px' }}>Scan the QRIS code to pay</p>
        {paid ? (
          <PaymentPending />
        ) : (
          <>
            <div className={styles.paymentQr}><QrCode size={120} color="#1d1d1f" /></div>
            <div className={styles.paymentPrice}>Rp {price.toLocaleString('id-ID')}</div>
            {errMsg && <p style={{ color: 'red', fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>{errMsg}</p>}
            <button className={styles.boothBtnPrimary} onClick={handlePay} style={{ width: '100%', marginTop: '24px' }}>
              Simulate Successful Payment
            </button>
          </>
        )}
      </div>
    </div>
  );
}
