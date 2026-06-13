'use client';
import { useEffect, useState } from 'react';
import styles from './admin-bar-chart.module.css';

interface DataPoint {
  label: string;
  value: number;
  amount: string;
  tooltip?: string;
}

interface Props {
  data: DataPoint[];
  maxValue: number;
  height?: number;
  color?: string;
}

export default function AdminBarChart({ data, maxValue, height = 160, color }: Props) {
  const [accent, setAccent] = useState('#C5D89D');
  useEffect(() => {
    setAccent(getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#C5D89D');
  }, []);
  const barColor = color || accent;
  return (
    <div className={styles.chart} style={{ height }}>
      {data.map((point, i) => {
        const barHeight = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
        return (
          <div key={i} className={styles.barGroup}>
            <p className={styles.amount}>{point.amount}</p>
            <div
              className={styles.bar}
              style={{
                height: `${Math.max(barHeight, 4)}%`,
                background: barColor,
              }}
            >
              {point.tooltip && <span className={styles.tooltip}>{point.tooltip}</span>}
            </div>
            <p className={styles.label}>{point.label}</p>
          </div>
        );
      })}
    </div>
  );
}
