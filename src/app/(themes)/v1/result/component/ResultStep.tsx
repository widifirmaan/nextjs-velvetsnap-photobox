// File: src/app/(themes)/v1/result/component/ResultStep.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import { Loader2 } from 'lucide-react';
import StepperBar from '../../StepperBar';
import ResultActions from '@/components/result/ResultActions';
import styles from '@/app/(themes)/v1/page.module.css';

export default function ResultStep({
  compositedImage, onHome, txId,
}: {
  compositedImage: string | null; onHome: () => void; txId?: string | null;
}) {
  return (
    <div className={`${styles.stepPage} ${styles.stepPageResult}`}>
      <StepperBar current={4} total={5} />
      <h2 className={styles.stepHeading} style={{ margin: '24px 0 8px' }}>Your Photos are Ready!</h2>
      <p style={{ color: '#888', marginBottom: '20px' }}>Download or print your photo strip.</p>
      <div className={styles.resultLayout}>
        <div className={styles.resultImage}>
          {compositedImage ? <img src={compositedImage} alt="Final strip" /> : <Loader2 className="spin" size={40} />}
        </div>
        <ResultActions
          compositedImage={compositedImage}
          onHome={onHome}
          txId={txId}
          wrapperClassName={styles.resultActions}
          primaryButtonClassName={styles.boothBtnPrimary}
          secondaryButtonClassName={styles.boothBtnSecondary}
          homeButtonClassName={`${styles.boothBtnSecondary} ${styles.resultHomeBtn}`}
          qrSectionClassName={styles.qrSection}
          qrDividerClassName={styles.qrDivider}
          qrLabelClassName={styles.qrLabel}
          qrCanvasClassName={styles.qrCanvas}
          qrUrlClassName={styles.qrUrl}
        />
      </div>
    </div>
  );
}
