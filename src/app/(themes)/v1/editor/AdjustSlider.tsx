// File: src/app/(themes)/v1/editor/AdjustSlider.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import type { ReactNode } from 'react';
import styles from '@/app/(themes)/v1/page.module.css';

export default function AdjustSlider({ label, icon, value, min, max, onChange, display }: {
  label: string; icon?: ReactNode; value: number; min: number; max: number;
  onChange: (v: number) => void; display?: string;
}) {
  return (
    <div className={styles.sliderRow}>
      <div className={styles.sliderHeader}>
        <span className={styles.sliderLabel} title={label}>{icon}</span>
        <span className={styles.sliderValue}>{display || value}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.sliderInput} />
    </div>
  );
}
