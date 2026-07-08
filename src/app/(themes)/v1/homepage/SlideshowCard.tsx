// File: src/app/(themes)/v1/homepage/SlideshowCard.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import { useMemo } from 'react';
import styles from '@/app/(themes)/v1/page.module.css';
import { SAMPLE_IMAGES } from '../types';

export default function SlideshowCard({ slideIdx, images, onStart }: {
  slideIdx: number; images?: string[]; onStart: (e: React.MouseEvent) => void;
}) {
  const imgs = images?.length ? images : SAMPLE_IMAGES;
  const loaded = useMemo(() => {
    const set = new Set<number>();
    for (let offset = 0; offset < Math.min(3, imgs.length); offset++) {
      set.add((slideIdx + offset) % imgs.length);
    }
    return set;
  }, [slideIdx, imgs.length]);
  return (
    <a className={styles.cardWedding} onClick={onStart} style={{ cursor: 'pointer' }}>
      <div className={styles.slideshow}>
        {imgs.map((src, i) => (
          <div
            key={i}
            className={styles.slide}
            style={{
              backgroundImage: loaded.has(i) ? `url(${src})` : undefined,
              opacity: i === slideIdx ? 0.85 : 0,
            }}
          />
        ))}
      </div>
    </a>
  );
}
