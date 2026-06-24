'use client';
import styles from './page.module.css';

const labels = ['TEMPLATE', 'PHOTO', 'EDIT', 'PAY', 'PRINT'];

export default function StepperBar({ current, total }: { current: number; total: number }) {
  return (
    <div className={styles.stepperBar}>
      {labels.slice(0, total).map((label, i) => (
        <div key={i} className={`${styles.stepDot} ${i === current ? styles.stepDotActive : ''} ${i < current ? styles.stepDotDone : ''}`}>
          {i < current ? <span>✓</span> : <span className={styles.stepDotNumber}>{i + 1}</span>}
          {label}
        </div>
      ))}
    </div>
  );
}
