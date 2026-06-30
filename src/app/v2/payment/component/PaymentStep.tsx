'use client';
import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PaymentPending from './PaymentPending';
import { usePaymentFlow } from '@/lib/usePaymentFlow';
import styles from '../../page.module.css';

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
  const [bypassing, setBypassing] = useState(false);

  const handleBypass = async () => {
    setBypassing(true);
    try { await f.handleBypass(); } finally { setBypassing(false); }
  };

  return (
    <div className={styles.paymentLayout}>
      <div className={styles.paymentCard}>
        {!f.paid && !f.loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <button className={styles.boothBtn} onClick={onBack} style={{ padding: '8px 16px', fontSize: 11 }}><ArrowLeft size={14} /> Back</button>
          </div>
        )}
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, margin: '0 0 4px' }}>Payment</h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--np-text-muted)', marginBottom: 24 }}>Scan the QRIS code to pay</p>
        {f.paid ? (
          <PaymentPending errMsg={f.errMsg} />
        ) : (
          <>
            <div className={styles.paymentQris}>
              <Loader2 size={48} className="spin" />
            </div>
            <div className={styles.paymentPrice}>Rp {price.toLocaleString('id-ID')}</div>
            {f.errMsg && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <p style={{ color: 'var(--np-accent)', fontSize: 11, fontFamily: 'var(--font-body)' }}>{f.errMsg}</p>
                <button
                  className={styles.boothBtn}
                  onClick={() => window.location.reload()}
                  style={{ marginTop: 12 }}
                >
                  Retry Payment
                </button>
              </div>
            )}
            {!f.errMsg && f.snapError && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <p style={{ color: 'var(--np-accent)', fontSize: 11, fontFamily: 'var(--font-body)' }}>Payment gateway failed to load. Check your connection.</p>
                <button
                  className={styles.boothBtn}
                  onClick={() => window.location.reload()}
                  style={{ marginTop: 12 }}
                >
                  Retry
                </button>
              </div>
            )}
            {!f.errMsg && !f.snapError && f.loading && (
              <p style={{ color: 'var(--np-text-muted)', fontSize: 11, fontFamily: 'var(--font-body)', marginTop: 12, textAlign: 'center' }}>
                {!f.snapLoaded ? 'Loading payment gateway...' : 'Preparing QRIS...'}
              </p>
            )}
            <div style={{ textAlign: 'center', marginTop: 24, opacity: bypassing ? 1 : 0.5 }}>
              <button
                onClick={handleBypass}
                disabled={f.paid || bypassing}
                style={{
                  background: 'none', border: '1px dashed var(--np-border)', padding: '4px 12px',
                  fontSize: 11, color: 'var(--np-text-muted)', cursor: bypassing ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                {bypassing ? <Loader2 size={12} className="spin" /> : null}
                {bypassing ? 'Processing...' : 'Bypass Payment (testing)'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
