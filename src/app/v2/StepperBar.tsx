'use client';
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

export default function StepperBar({ current, total }: { current: number; total: number }) {
  return (
    <div className={styles.newspaperHeader}>
      <div className={styles.mastheadMeta}>
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
