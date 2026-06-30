'use client';
import { useEffect, useRef, useState } from 'react';
import styles from '@/app/v1/page.module.css';
import { SAMPLE_IMAGES } from '../types';
import type { StripResult } from '../types';
import HomeHeader from './HomeHeader';
import IntroCard from './IntroCard';
import CardSmall from './CardSmall';
import SlideshowCard from './SlideshowCard';
import PromoCard from './PromoCard';
import StripsCarousel from './StripsCarousel';
import HomeFooter from './HomeFooter';

interface Branding {
  appName: string; appTagline: string; heroSubtitle: string;
  logo: string; cardSmallHtml: string; cardPromoHtml: string;
  slideshowImages: string[];
  header: { location: string; navItems: string };
  footer: { text: string };
  system: { primaryColor: string; accentColor: string; showPreloader: boolean; showStrips: boolean; slideshowInterval: number; sessionTimer: number };
}

export default function HomePage({ strips, txCount, tmplCount, branding, onStart, onCarouselReady }: {
  strips: StripResult[]; txCount: number; tmplCount: number; branding: Branding;
  onStart: (e: React.MouseEvent) => void; onCarouselReady?: () => void;
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const smallVpRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = () => {
      smallVpRef.current = window.innerWidth < 768;
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const slideshowImages = branding.slideshowImages.length ? branding.slideshowImages : SAMPLE_IMAGES;

  useEffect(() => {
    if (!slideshowImages.length) return;
    intervalRef.current = setInterval(() => {
      setSlideIdx((i) => (i + 1) % slideshowImages.length);
    }, branding.system.slideshowInterval);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [branding.system.slideshowInterval, slideshowImages.length]);

  return (
    <div className={styles.page}>
      <HomeHeader tooltipVisible={tooltipVisible} setTooltipVisible={setTooltipVisible} branding={branding} />

      <main className={styles.main}>
        <div className={styles.colLeft}>
          <IntroCard txCount={txCount} tmplCount={tmplCount} branding={branding} onStart={onStart} />
          <div className={styles.cardSmallDesktop}>
            <CardSmall html={branding.cardSmallHtml} />
          </div>
        </div>

        <div className={styles.colCenter}>
          <SlideshowCard slideIdx={slideIdx} images={slideshowImages} onStart={onStart} />
          <PromoCard html={branding.cardPromoHtml} />
        </div>

        <div className={styles.cardSmallRow}>
          <CardSmall html={branding.cardSmallHtml} />
          <SlideshowCard slideIdx={slideIdx} images={slideshowImages} onStart={onStart} />
        </div>

        {branding.system.showStrips && <StripsCarousel strips={strips} smallVpRef={smallVpRef} onReady={onCarouselReady} />}
      </main>

      <HomeFooter branding={branding} />
    </div>
  );
}
