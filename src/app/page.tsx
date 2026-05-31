'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Camera, Sparkles, Star, Heart, Zap } from 'lucide-react';
import styles from './page.module.css';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80',
];

export default function Home() {
  const router = useRouter();
  const [slideIdx, setSlideIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSlideIdx((i) => (i + 1) % SAMPLE_IMAGES.length);
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* ── Hero ── */}
        <button className={`${styles.tile} ${styles.hero}`} onClick={() => router.push('/templates')}>
          <div className={styles.slideshow}>
            {SAMPLE_IMAGES.map((src, i) => (
              <div
                key={i}
                className={styles.slide}
                style={{
                  backgroundImage: `url(${src})`,
                  opacity: i === slideIdx ? 1 : 0,
                  zIndex: i === slideIdx ? 1 : 0,
                }}
              />
            ))}
            <div className={styles.heroOverlay} />
            <div className={styles.heroContent}>
              <Camera size={56} className={styles.heroIcon} />
              <span className={styles.heroTitle}>Photo Booth</span>
              <span className={styles.heroSub}>Abadikan momen spesialmu</span>
              <span className={styles.heroCta}>Mulai →</span>
            </div>
          </div>
        </button>

        {/* ── Promo ── */}
        <button className={`${styles.tile} ${styles.promo}`} onClick={() => router.push('/templates')}>
          <div className={styles.floatWrap}>
            <Sparkles size={28} className={styles.floatIcon} />
            <span className={styles.promoLabel}>Promo</span>
            <span className={styles.promoValue}>2nd Print</span>
            <span className={styles.promoValue}>FREE</span>
          </div>
        </button>

        {/* ── Gallery ── */}
        <button className={`${styles.tile} ${styles.gallery}`} onClick={() => router.push('/templates')}>
          <div className={styles.galleryGrid}>
            {SAMPLE_IMAGES.slice(0, 4).map((src, i) => (
              <div key={i} className={styles.galleryThumb} style={{ backgroundImage: `url(${src})`, animationDelay: `${i * 1.5}s` }} />
            ))}
          </div>
        </button>

        {/* ── Testimonial ── */}
        <button className={`${styles.tile} ${styles.testi}`} onClick={() => router.push('/templates')}>
          <div className={styles.pulseWrap}>
            <Heart size={24} className={styles.pulseIcon} />
            <span className={styles.testiText}>"Hasilnya keren banget!"</span>
            <span className={styles.testiAuthor}>— Andi & Rina</span>
          </div>
        </button>

        {/* ── Stat ── */}
        <button className={`${styles.tile} ${styles.stat}`} onClick={() => router.push('/admin/history')}>
          <div className={styles.shimmerWrap}>
            <Star size={24} className={styles.shimmerIcon} />
            <span className={styles.statNumber}>10K+</span>
            <span className={styles.statLabel}>Foto Tercetak</span>
          </div>
        </button>

        {/* ── Bottom strip ── */}
        <button className={`${styles.tile} ${styles.bottom}`} onClick={() => router.push('/templates')}>
          <div className={styles.bottomContent}>
            <div className={styles.bottomItem}>
              <Zap size={20} className={styles.bottomIcon} />
              <span className={styles.bottomText}>Mulai Rp 25K</span>
            </div>
            <div className={styles.bottomDivider} />
            <div className={styles.bottomItem}>
              <Camera size={20} className={styles.bottomIcon} />
              <span className={styles.bottomText}>Cetak langsung</span>
            </div>
            <div className={styles.bottomDivider} />
            <div className={styles.bottomItem}>
              <Sparkles size={20} className={styles.bottomIcon} />
              <span className={styles.bottomText}>Banyak template</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
