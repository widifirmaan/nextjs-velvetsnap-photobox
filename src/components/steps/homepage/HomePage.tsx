'use client';

import styles from '@/app/page.module.css';
import HomeHeader from './HomeHeader';
import IntroCard from './IntroCard';
import CardSmall from './CardSmall';
import SlideshowCard from './SlideshowCard';
import PromoCard from './PromoCard';
import StripsCarousel from './StripsCarousel';
import HomeFooter from './HomeFooter';
import type { StripResult } from '../types';

export default function HomePage({ strips, txCount, tmplCount, onStart }: {
  strips: StripResult[]; txCount: number; tmplCount: number; onStart: () => void;
}) {
  return (
    <div className={styles.page}>
      <HomeHeader />
      <main className={styles.main}>
        <div className={styles.colLeft}>
          <IntroCard txCount={txCount} tmplCount={tmplCount} onStart={onStart} />
          <CardSmall />
        </div>
        <div className={styles.colCenter}>
          <SlideshowCard onStart={onStart} />
          <PromoCard />
        </div>
        <div className={styles.colRight}>
          <StripsCarousel strips={strips} />
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
