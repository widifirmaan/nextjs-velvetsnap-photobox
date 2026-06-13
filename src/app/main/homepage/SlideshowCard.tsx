'use client';
import styles from '@/app/main/page.module.css';
import { SAMPLE_IMAGES } from '../types';

export default function SlideshowCard({ slideIdx, images, onStart }: {
  slideIdx: number; images?: string[]; onStart: (e: React.MouseEvent) => void;
}) {
  const imgs = images?.length ? images : SAMPLE_IMAGES;
  return (
    <a className={styles.cardWedding} onClick={onStart} style={{ cursor: 'pointer' }}>
      <div className={styles.slideshow}>
        {imgs.map((src, i) => (
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
