'use client';
import styles from '../page.module.css';

export default function AdjustSlider({ label, value, min, max, onChange, display }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; display?: string;
}) {
  return (
    <div className={styles.sliderRow}>
      <div className={styles.sliderHeader}>
        <span className={styles.sliderLabel}>{label}</span>
        <span className={styles.sliderValue}>{display || value}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.sliderInput} />
    </div>
  );
}
