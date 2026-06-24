'use client';
import { Camera, RefreshCw } from 'lucide-react';
import styles from '../../page.module.css';

export default function BoothControls({ onCapture, onRetake, capturing, shotCount, totalSlots }: {
  onCapture: () => void; onRetake: () => void;
  capturing: boolean; shotCount: number; totalSlots: number;
}) {
  const isDone = shotCount >= totalSlots;

  return (
    <div className={styles.boothControls}>
      {!isDone ? (
        <button className={`${styles.boothBtn} ${styles.boothBtnPrimary}`} onClick={onCapture} disabled={capturing}>
          <Camera size={16} />
          {capturing ? 'CAPTURING...' : `CAPTURE (${shotCount + 1}/${totalSlots})`}
        </button>
      ) : null}
      {shotCount > 0 && (
        <button className={styles.boothBtn} onClick={onRetake}>
          <RefreshCw size={14} /> RETAKE
        </button>
      )}
    </div>
  );
}
