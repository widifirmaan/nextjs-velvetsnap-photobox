'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '@/app/page.module.css';
import { SAMPLE_IMAGES } from '../types';

export default function SlideshowCard({ onStart }: { onStart: () => void }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSlideIdx((i) => (i + 1) % SAMPLE_IMAGES.length);
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

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
