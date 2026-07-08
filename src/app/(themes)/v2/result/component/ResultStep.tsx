// File: src/app/(themes)/v2/result/component/ResultStep.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import ResultActions from '@/components/result/ResultActions';
import styles from '../../page.module.css';

export default function ResultStep({ compositedImage, onHome, txId }: {
  compositedImage: string | null; onHome: () => void; txId?: string | null;
}) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const downloadUrl = txId ? `${window.location.origin}/download/${txId}` : null;

  useEffect(() => {
    if (!qrRef.current || !downloadUrl) return;
    import('qrcode').then((QRCode) => {
      QRCode.toCanvas(qrRef.current!, downloadUrl, {
        width: 140, margin: 2,
        color: { dark: '#1d1d1f', light: '#ffffff' },
      });
    });
  }, [downloadUrl]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className={styles.resultLayout}>
        <div className={styles.resultPreview}>
          <div className={styles.resultImage}>
            {compositedImage ? (
              <img src={compositedImage} alt="Final strip" />
            ) : (
              <Loader2 className="spin" size={32} style={{ color: 'var(--np-accent)' }} />
            )}
          </div>
        </div>
        <div className={styles.resultSidebar}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, margin: 0, textAlign: 'center', flexShrink: 0 }}>Your Photos are Ready!</h2>
          <ResultActions
            compositedImage={compositedImage}
            onHome={onHome}
            txId={txId}
            primaryButtonClassName={`${styles.boothBtn} ${styles.boothBtnPrimary}`}
            secondaryButtonClassName={styles.boothBtn}
            homeButtonClassName={styles.boothBtn}
          />
        </div>
      </div>
      <div className={styles.newspaperFooter}>
        <div className={styles.mastheadMeta}>
          <span>VelvetSnap Photobooth</span>
        </div>
      </div>
    </div>
  );
}
