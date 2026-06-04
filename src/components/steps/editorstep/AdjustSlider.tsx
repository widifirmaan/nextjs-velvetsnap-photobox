'use client';

import styles from '@/app/page.module.css';

export default function AdjustSlider({ label, value, min, max, onChange, display }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; display?: string;
}) {
  return (
    <div className={styles.editorAdjustRow}>
      <span className={styles.editorAdjustLabel}>{label}</span>
      <input type="range" min={min} max={max} step={1}
        value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
        className={styles.editorSlider} />
      <span className={styles.editorAdjustValue}>{display ?? value}</span>
    </div>
  );
}
