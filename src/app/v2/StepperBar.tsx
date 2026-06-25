'use client';
import { ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

const roman = ['I', 'II', 'III', 'IV', 'V'];
const labels = ['Template', 'Photo', 'Edit', 'Pay', 'Cetak'];
const taglines = [
  'Pilih bingkai foto favorit Anda',
  'Ambil foto langsung di booth',
  'Sesuaikan tata letak dan filter',
  'Selesaikan pembayaran',
  'Cetak dan simpan hasilnya',
];

export default function StepperBar({ current, total, onBack }: {
  current: number; total: number; onBack?: () => void;
}) {
  return (
    <div className={styles.newspaperHeader}>
      <div className={styles.mastheadMeta}>
        {onBack && (
          <button onClick={onBack} style={{
            background: 'none', border: '2px solid var(--np-border)', cursor: 'pointer',
            padding: '2px 6px', display: 'flex', alignItems: 'center', color: 'var(--np-text)',
            fontSize: 11, fontFamily: 'var(--font-body)', gap: 4, lineHeight: 1,
          }}>
            <ArrowLeft size={14} />
          </button>
        )}
        <span>STEP {roman[current]} OF {roman[total - 1]}</span>
        <span>{current > 0 ? `${current} DONE` : ''}</span>
        <span>{labels[current]}</span>
      </div>
      <div className={styles.mastheadRule} />
      <h1 className={styles.mastheadTitle} style={{ fontSize: 'clamp(24px,5vw,44px)', margin: '1px 0' }}>
        <span className={styles.mastheadAccent}>{roman[current]}</span>{' '}
        {labels[current]}
      </h1>
      <p className={styles.mastheadTagline} style={{ fontSize: 11 }}>{taglines[current]}</p>
      <div className={styles.mastheadRule} />
      <div className={styles.mastheadMeta} style={{ fontSize: 11 }}>
        {labels.slice(0, total).map((l, i) => (
          <span key={i} style={{
            color: i === current ? 'var(--np-accent)' : i < current ? 'var(--np-text)' : 'var(--np-text-muted)',
            fontWeight: i === current ? 700 : 400,
          }}>
            {i < current ? '✓ ' : ''}{roman[i]}. {l}
          </span>
        ))}
      </div>
    </div>
  );
}
