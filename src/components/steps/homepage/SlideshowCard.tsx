'use client';
import styles from '@/app/page.module.css';
import { SAMPLE_IMAGES } from '../types';

export default function SlideshowCard({ slideIdx, onStart }: {
  slideIdx: number; onStart: () => void;
}) {
  return (
    <a className={styles.cardWedding} onClick={onStart} style={{ cursor: 'pointer' }}>
      <div className={styles.slideshow}>
        {SAMPLE_IMAGES.map((src, i) => (
          <div
            key={i}
            className={styles.slide}
            style={{
              backgroundImage: `url(${src})`,
              opacity: i === slideIdx ? 0.85 : 0,
            }}
          />
        ))}
      </div>
    </a>
  );
}
