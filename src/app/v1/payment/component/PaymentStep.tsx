'use client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import StepperBar from '../../StepperBar';
import PaymentPending from './PaymentPending';
import { usePaymentFlow } from '@/lib/usePaymentFlow';
import styles from '@/app/main/page.module.css';

export default function PaymentStep({
  price, paid: _paid, setPaid: _setPaid, errMsg: _errMsg, setErrMsg: _setErrMsg,
  captures, templateId, compositedImage, onSuccess, onBack,
}: {
  price: number; paid: boolean; setPaid: (v: boolean) => void;
  errMsg: string | null; setErrMsg: (v: string | null) => void;
  captures: string[]; templateId: string; compositedImage: string | null;
  onSuccess: (id: string) => void; onBack: () => void;
}) {
  const f = usePaymentFlow({ price, templateId, captures, compositedImage, onSuccess });

  return (
    <div className={`${styles.stepPage} ${styles.stepPagePayment}`}>
      <StepperBar current={3} total={5} />
      <div className={styles.paymentCard}>
        {!f.paid && !f.loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <button className={styles.boothBtnSecondary} onClick={onBack}><ArrowLeft size={16} /> Back</button>
          </div>
        )}
        <h2 className={styles.stepHeading}>Payment</h2>
        <p style={{ color: '#888', marginBottom: '24px' }}>Scan the QRIS code to pay</p>
        {f.paid ? (
          <PaymentPending errMsg={f.errMsg} />
        ) : (
          <>
            <div className={styles.paymentQr}>
              <Loader2 size={48} className={styles.spinner} />
            </div>
            <div className={styles.paymentPrice}>Rp {price.toLocaleString('id-ID')}</div>
            {f.errMsg && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <p style={{ color: 'var(--danger-color)', fontSize: '13px' }}>{f.errMsg}</p>
                <button
                  className={styles.boothBtnPrimary}
                  onClick={() => window.location.reload()}
                  style={{ marginTop: 12 }}
                >
                  Retry Payment
                </button>
              </div>
            )}
            {!f.errMsg && f.snapError && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <p style={{ color: 'var(--danger-color)', fontSize: '13px' }}>Payment gateway failed to load. Check your connection.</p>
                <button
                  className={styles.boothBtnPrimary}
                  onClick={() => window.location.reload()}
                  style={{ marginTop: 12 }}
                >
                  Retry
                </button>
              </div>
            )}
            {!f.errMsg && !f.snapError && f.loading && (
              <p style={{ color: '#888', fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>
                {!f.snapLoaded ? 'Loading payment gateway...' : 'Preparing QRIS...'}
              </p>
            )}
            <div style={{ textAlign: 'center', marginTop: 24, opacity: 0.5 }}>
              <button
                onClick={f.handleBypass}
                disabled={f.paid}
                style={{
                  background: 'none', border: '1px dashed #666', borderRadius: 6,
                  padding: '4px 12px', fontSize: 11, color: '#888', cursor: 'pointer',
                }}
              >
                Bypass Payment (testing)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
