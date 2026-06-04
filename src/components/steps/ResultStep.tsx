'use client';

import { Loader2 } from 'lucide-react';
import styles from '@/app/page.module.css';
import StepperBar from './StepperBar';
import ResultActions from './resultstep/ResultActions';

export default function ResultStep({ compositedImage, onHome }: { compositedImage: string | null; onHome: () => void }) {
  return (
    <div className={`${styles.stepPage} ${styles.stepPageResult}`}>
      <StepperBar current={4} total={5} />
      <h2 className={styles.stepHeading} style={{ margin: '24px 0 8px' }}>Your Photos are Ready!</h2>
      <p style={{ color: '#888', marginBottom: '20px' }}>Download or print your photo strip.</p>
      <div className={styles.resultLayout}>
        <div className={styles.resultImage}>
          {compositedImage ? <img src={compositedImage} alt="Final strip" /> : <Loader2 className="spin" size={40} />}
        </div>
        <div className={styles.resultActions}>
          <ResultActions compositedImage={compositedImage} onHome={onHome} />
        </div>
      </div>
    </div>
  );
}
