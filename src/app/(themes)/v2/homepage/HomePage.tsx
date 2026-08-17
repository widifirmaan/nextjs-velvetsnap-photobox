// File: src/app/(themes)/v2/homepage/HomePage.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import { useEffect, useRef } from 'react';
import styles from '../page.module.css';
import HomeHeader from './HomeHeader';
import HomeFooter from './HomeFooter';
import NewspaperSection from './NewspaperSection';
import V2Preloader from './V2Preloader';
import type { StripResult } from '../types';
import { getOptimizedUrl } from '@/lib/utils/cloudinary-url';

export default function HomePage({
  onStart, strips, appName, appTagline, heroSubtitle, heroImage,
  cardHtml, minPrice, navItems, location, footerText, loaded,
}: {
  onStart: () => void;
  strips: StripResult[];
  appName: string;
  appTagline: string;
  heroSubtitle: string;
  heroImage: string;
  cardHtml: string;
  minPrice: number;
  navItems: { label: string; url: string }[];
  location: string;
  footerText: string;
  loaded: boolean;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  /* ── Auto-scroll carousel ── */
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || !strips.length) return;
    let raf: number;
    const step = () => {
      if (!pausedRef.current) {
        el.scrollLeft += 0.8;
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [strips.length]);

  return (
    <div className={styles.homepage}>
      <V2Preloader ready={loaded} appName={appName} tagline={appTagline} />

      <HomeHeader appName={appName} location={location} navItems={navItems} tagline={appTagline} minPrice={minPrice} />

      <NewspaperSection>
        <div className={styles.leadStoryGrid}>

          {/* Col 1: Photobooth Steps */}
          <div>
            <div className={styles.stepsList}>
              {[
                { number: 'I', title: 'Pick Frame', desc: 'Browse our vintage-inspired collection and pick the perfect frame — from classic monochrome to bold modern prints that set the mood for your session.' },
                { number: 'II', title: 'Pose & Snap', desc: 'Step into the booth, strike a pose, and capture your moment. A lively countdown keeps the energy high while each shot freezes the fun in time.' },
                { number: 'III', title: 'Adjust', desc: 'Take full control before you print — fine-tune brightness, contrast, and positioning so every frame looks exactly the way you imagined.' },
                { number: 'IV', title: 'Pay', desc: 'Check out securely in seconds with a wide range of payment methods, so you can pick whatever works best for you without the hassle.' },
                { number: 'V', title: 'Save & Print', desc: 'Download your finished photo strip and print it on the spot — then share the memories with family and friends, in print and online.' },
              ].map((s) => (
                <div key={s.number} className={styles.stepItem}>
                  <div className={styles.stepNumber}>{s.number}</div>
                  <div className={styles.stepContent}>
                    <div className={styles.stepTitle}>{s.title}</div>
                    <div className={styles.stepDesc}>{s.desc}</div>
                  </div>
                </div>
              ))}
              {cardHtml && (
                <div className={styles.cardSmallWidget} dangerouslySetInnerHTML={{ __html: cardHtml }} />
              )}
            </div>
          </div>

          {/* Col 2: Recent Photo Strips Carousel */}
          <div>
            <div
              ref={carouselRef}
              className={styles.carouselViewport}
              onPointerEnter={() => { pausedRef.current = true; }}
              onPointerLeave={() => { pausedRef.current = false; }}
              onTouchStart={() => { pausedRef.current = true; }}
              onTouchEnd={() => { pausedRef.current = false; }}
            >
              <div className={styles.carouselTrack}>
                {strips.length > 0 ? (
                  [...strips, ...strips].map((s, i) => (
                    <img
                      key={`${s._id}-${i}`}
                      src={getOptimizedUrl(s.finalImage || '', 150, 400)}
                      alt=""
                      className={styles.carouselSlide}
                      draggable={false}
                    />
                  ))
                ) : (
                  <div className={styles.carouselEmpty}>
                    <div className={styles.carouselSpinner} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Col 3: Call-to-Action */}
          <div>
            <p className={styles.leadStoryBody}>
              {heroSubtitle || 'Step into our studio at the press of a button. The booth handles the rest — from countdown to composition, delivery to download.'}
            </p>
            <div className={styles.leadStoryByline}>By {appName || 'VelvetSnap'} Staff</div>
            {heroImage && (
              <img src={heroImage} alt="" className={styles.leadStoryVintageImage} draggable={false} />
            )}
            <button className={styles.leadStoryBtn} onClick={onStart}>
              START SHOOT →
            </button>
          </div>

        </div>
      </NewspaperSection>

      <HomeFooter footerText={footerText} />
    </div>
  );
}
