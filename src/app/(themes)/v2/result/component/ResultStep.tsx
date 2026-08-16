// File: src/app/(themes)/v2/result/component/ResultStep.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import { Loader2 } from 'lucide-react';
import ResultActions from '@/components/result/ResultActions';
import styles from '../../page.module.css';

export default function ResultStep({ compositedImage, onHome, txId }: {
  compositedImage: string | null; onHome: () => void; txId?: string | null;
}) {
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
          <h2 className={styles.resultHeading} style={{ fontFamily: 'var(--font-heading)', fontSize: 22, margin: 0, textAlign: 'center', flexShrink: 0 }}>Your Photos are Ready!</h2>
          <ResultActions
            compositedImage={compositedImage}
            onHome={onHome}
            txId={txId}
            downloadPath="/v2/download"
            qrSize={140}
            buttonsGroupClassName={styles.resultButtons}
            qrGroupClassName={styles.resultQr}
            qrSectionClassName={styles.qrSection}
            qrDividerClassName={styles.qrDivider}
            qrLabelClassName={styles.qrLabel}
            qrCanvasClassName={styles.qrCanvas}
            qrUrlClassName={styles.qrUrl}
            primaryButtonClassName={`${styles.boothBtn} ${styles.boothBtnPrimary}`}
            secondaryButtonClassName={styles.boothBtn}
            homeButtonClassName={styles.boothBtn}
          />
        </div>
      </div>
    </div>
  );
}
