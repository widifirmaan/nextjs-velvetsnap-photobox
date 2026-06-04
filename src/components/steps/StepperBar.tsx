'use client';

import { Check } from 'lucide-react';
import styles from '@/app/page.module.css';
import { STEP_LABELS } from './types';

export function SlotDots({ count }: { count: number }) {
  return (
    <span className={styles.slotDots}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={styles.slotDot} />
      ))}
    </span>
  );
}

export default function StepperBar({ current, total }: { current: number; total: number }) {
  return (
    <div className={styles.boothStepper}>
      {STEP_LABELS.slice(0, total).map((label, i) => (
        <div key={i} className={styles.boothStepItem}>
          {i > 0 && <div className={`${styles.boothStepLine} ${i <= current ? styles.boothStepLineDone : ''}`} />}
          <div className={`${styles.boothStepDot} ${i === current ? styles.boothStepActive : ''} ${i < current ? styles.boothStepDone : ''}`}>
            {i < current ? <Check size={14} /> : i + 1}
          </div>
          <span className={`${styles.boothStepLabel} ${i === current ? styles.boothStepLabelActive : ''} ${i < current ? styles.boothStepLabelDone : ''}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
