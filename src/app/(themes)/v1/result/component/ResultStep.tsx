// File: src/app/(themes)/v1/result/component/ResultStep.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import StepperBar from '../../StepperBar';
import ResultActions from '@/components/result/ResultActions';
import styles from '@/app/(themes)/v1/page.module.css';

export default function ResultStep({
  compositedImage, onHome, txId,
}: {
  compositedImage: string | null; onHome: () => void; txId?: string | null;
}) {
  return (
    <>
      <div className={styles.templateStepper}><StepperBar current={4} total={5} /></div>
      <div className={`${styles.stepPage} ${styles.stepPageResult}`}>
        <div className={styles.stepHeader}>
          <button type="button" className={styles.backBtn} onClick={onHome}>
            <ArrowLeft size={18} />
          </button>
          <h1 className={styles.stepHeading}>Cetak</h1>
        </div>
        <p className={styles.resultSub}>Your photos are ready — download or print your strip.</p>
        <div className={styles.resultLayout}>
        <div className={styles.resultImage}>
          {compositedImage ? <img src={compositedImage} alt="Final strip" /> : <Loader2 className="spin" size={40} />}
        </div>
        <div className={styles.resultCol}>
          <ResultActions
            compositedImage={compositedImage}
            onHome={onHome}
            txId={txId}
            buttonsGroupClassName={styles.resultActions}
            qrGroupClassName={styles.resultQr}
            primaryButtonClassName={styles.boothBtnPrimary}
            secondaryButtonClassName={styles.boothBtnSecondary}
            homeButtonClassName={`${styles.boothBtnSecondary} ${styles.resultHomeBtn}`}
            downloadPath="/v1/download"
            qrSectionClassName={styles.qrSection}
            qrDividerClassName={styles.qrDivider}
            qrLabelClassName={styles.qrLabel}
            qrCanvasClassName={styles.qrCanvas}
            qrUrlClassName={styles.qrUrl}
          />
        </div>
      </div>
    </div>
    </>
  );
}
