'use client';
import { useEffect, useRef, useState } from 'react';
import styles from '../page.module.css';
import HomeHeader from './HomeHeader';
import HomeFooter from './HomeFooter';
import NewspaperSection from './NewspaperSection';
import V2Preloader from './V2Preloader';
import type { StripResult } from '../types';

export default function HomePage({ onStart }: { onStart: () => void }) {
  const [strips, setStrips] = useState<StripResult[]>([]);
  const [heroImage, setHeroImage] = useState('');
  const [cardHtml, setCardHtml] = useState('');
  const [appName, setAppName] = useState('');
  const [appTagline, setAppTagline] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [navItems, setNavItems] = useState<{ label: string; url: string }[]>([]);
  const [location, setLocation] = useState('');
  const [footerText, setFooterText] = useState('');
  const [loaded, setLoaded] = useState(false);
  const pendingRef = useRef(2);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(0);
  const pausedRef = useRef(false);

  /* ── Auto-scroll carousel ── */
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || !strips.length) return;
    const step = () => {
      if (!pausedRef.current) {
        el.scrollLeft += 0.8;
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
      }
      autoScrollRef.current = requestAnimationFrame(step);
    };
    autoScrollRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(autoScrollRef.current);
  }, [strips.length]);

  /* ── SECTION 1: Data Fetching ── */
  useEffect(() => {
    const tryDone = () => {
      pendingRef.current--;
      if (pendingRef.current <= 0) setLoaded(true);
    };

    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          if (data.data?.appName) setAppName(data.data.appName);
          if (data.data?.appTagline) setAppTagline(data.data.appTagline);
          if (data.data?.heroSubtitle) setHeroSubtitle(data.data.heroSubtitle);
          if (data.data?.header?.location) setLocation(data.data.header.location);
          if (data.data?.header?.navItems) {
            try { setNavItems(JSON.parse(data.data.header.navItems)); } catch {}
          }
          if (data.data?.slideshowImages?.length) {
            setHeroImage(data.data.slideshowImages[0]);
          }
          if (data.data?.cardSmallHtml) {
            setCardHtml(data.data.cardSmallHtml);
          }
          if (data.data?.footer?.text) setFooterText(data.data.footer.text);
        }
      })
      .catch(() => {})
      .finally(tryDone);

    fetch('/api/transactions/strips')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setStrips(data.data.slice(0, 10));
        }
      })
      .catch(() => {})
      .finally(tryDone);
  }, []);

  return (
    <div className={styles.homepage}>
      <V2Preloader ready={loaded} appName={appName} tagline={appTagline} />

      {/* ═══════════════════════════════════════════════
          SECTION 2: MASTHEAD — Newspaper Header
          ═══════════════════════════════════════════════ */}
      <HomeHeader appName={appName} location={location} navItems={navItems} tagline={appTagline} />

      {/* ═══════════════════════════════════════════════
          SECTION 3: LEAD STORY — 3-Column Grid
          Contains: Steps | Carousel | CTA
          ═══════════════════════════════════════════════ */}
      <NewspaperSection>
        <div className={styles.leadStoryGrid}>

          {/* ── Col 1: Photobooth Steps ── */}
          <div>
            <div className={styles.stepsList}>
              {[
                { number: 'I', title: 'Pick Frame', desc: 'Choose from our collection of vintage-inspired frames.' },
                { number: 'II', title: 'Snap & Post', desc: 'Step into the booth and capture your moment.' },
                { number: 'III', title: 'Adjust', desc: 'Fine-tune brightness, contrast, and positioning.' },
                { number: 'IV', title: 'Pay', desc: 'Secure checkout via QRIS.' },
                { number: 'V', title: 'Save & Print', desc: 'Download your strip and share with the world.' },
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

          {/* ── Col 2: Recent Photo Strips Carousel (horizontal scroll) ── */}
          <div>
            <div
              ref={carouselRef}
              className={styles.carouselViewport}
              onPointerEnter={() => { pausedRef.current = true; }}
              onPointerLeave={() => { pausedRef.current = false; }}
            >
              <div className={styles.carouselTrack}>
                {strips.length > 0 ? (
                  [...strips, ...strips].map((s, i) => (
                    <img
                      key={`${s._id}-${i}`}
                      src={s.finalImage?.replace('/image/upload/', '/image/upload/f_auto,q_auto/') || ''}
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

          {/* ── Col 3: Call-to-Action (text + byline + image + start button) ── */}
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

      {/* ═══════════════════════════════════════════════
          SECTION 4: FOOTER
          ═══════════════════════════════════════════════ */}
      <HomeFooter footerText={footerText} />

    </div>
  );
}
