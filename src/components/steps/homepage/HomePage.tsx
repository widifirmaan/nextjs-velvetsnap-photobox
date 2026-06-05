'use client';
import { useEffect, useRef, useState } from 'react';
import styles from '@/app/page.module.css';
import { SAMPLE_IMAGES } from '../types';
import type { StripResult } from '../types';
import HomeHeader from './HomeHeader';
import IntroCard from './IntroCard';
import CardSmall from './CardSmall';
import SlideshowCard from './SlideshowCard';
import PromoCard from './PromoCard';
import StripsCarousel from './StripsCarousel';
import HomeFooter from './HomeFooter';

export default function HomePage({ strips, txCount, tmplCount, onStart }: {
  strips: StripResult[]; txCount: number; tmplCount: number; onStart: (e: React.MouseEvent) => void;
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [smallViewport, setSmallViewport] = useState(false);
  const smallVpRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = () => {
      const v = window.innerWidth < 768;
      setSmallViewport(v);
      smallVpRef.current = v;
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSlideIdx((i) => (i + 1) % SAMPLE_IMAGES.length);
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div className={styles.page}>
      <HomeHeader tooltipVisible={tooltipVisible} setTooltipVisible={setTooltipVisible} />

      <main className={styles.main}>
        <div className={styles.colLeft}>
          <IntroCard txCount={txCount} tmplCount={tmplCount} onStart={onStart} />
          <CardSmall />
        </div>

        <div className={styles.colCenter}>
          <SlideshowCard slideIdx={slideIdx} onStart={onStart} />
          <PromoCard />
        </div>

        <StripsCarousel strips={strips} smallVpRef={smallVpRef} />
      </main>

      <HomeFooter />
    </div>
  );
}
