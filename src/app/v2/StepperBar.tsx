'use client';
import styles from './page.module.css';
import Masthead from './Masthead';

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
    <Masthead
      top={<>
        <span>STEP {roman[current]} OF {roman[total - 1]}</span>
        <span>{current > 0 ? `${current} DONE` : ''}</span>
        <span>{labels[current]}</span>
      </>}
      title={<><span className={styles.mastheadAccent}>{roman[current]}</span> {labels[current]}</>}
      tagline={taglines[current]}
      bottom={<div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        {labels.slice(0, total).map((l, i) => (
          <span key={i} style={{
            color: i === current ? 'var(--np-accent)' : i < current ? 'var(--np-text)' : 'var(--np-text-muted)',
            fontWeight: i === current ? 700 : 400,
            display: 'inline-flex', alignItems: 'center', gap: 2,
          }}>
            {i < current ? <span style={{ lineHeight: 1 }}>✓</span> : ''}{roman[i]}. {l}
          </span>
        ))}
      </div>}
      onBack={onBack}
    />
  );
}
