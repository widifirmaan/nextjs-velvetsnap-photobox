'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Sparkles, Heart, MapPin, ExternalLink, MessageCircle } from 'lucide-react';
import styles from './page.module.css';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80',
];

interface StripResult {
  _id: string;
  sessionId: string;
  finalImage: string;
}

export default function Home() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [strips, setStrips] = useState<StripResult[]>([]);
  const [txCount, setTxCount] = useState(0);
  const [tmplCount, setTmplCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLImageElement | null)[]>([]);
  const stripWidthRef = useRef(0);

  const tripled = [...strips, ...strips, ...strips];

  useEffect(() => {
    fetch('/api/transactions/strips')
      .then((r) => r.json())
      .then((res) => { if (res.success) setStrips(res.data); })
      .catch(() => {});
    fetch('/api/transactions')
      .then((r) => r.json())
      .then((res) => { if (res.success) setTxCount(res.pagination.total); })
      .catch(() => {});
    fetch('/api/templates')
      .then((r) => r.json())
      .then((res) => { if (res.success) setTmplCount(res.data.length); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSlideIdx((i) => (i + 1) % SAMPLE_IMAGES.length);
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const updateTransforms = useCallback(() => {
    const c = trackRef.current;
    if (!c) return;
    const cx = c.scrollLeft + c.clientWidth / 2;

    slideRefs.current.forEach((el) => {
      if (!el) return;
      const ecx = el.offsetLeft + el.offsetWidth / 2;
      const dist = (ecx - cx) / (c.clientWidth * 0.5);
      const abs = Math.abs(dist);
      const sign = Math.sign(dist);

      let rotY, scale, zIdx;
      if (abs < 0.5) {
        rotY = sign * abs * 10;
        scale = 1 - abs * 0.12;
        zIdx = 50;
      } else if (abs < 1) {
        const t = (abs - 0.5) / 0.5;
        rotY = sign * 5;
        scale = 0.88 - t * 0.15;
        zIdx = 40 - t * 15;
      } else {
        rotY = sign * 5;
        scale = 0.73;
        zIdx = 15;
      }

      el.style.transform = `perspective(700px) rotateY(${rotY}deg) scale(${scale})`;
      el.style.zIndex = Math.round(zIdx).toString();
      el.style.opacity = String(Math.max(0.1, 1 - abs * 0.55));
    });
  }, []);

  useEffect(() => {
    const c = trackRef.current;
    if (!c || !strips.length) return;
    const oneSet = c.scrollWidth / 3;
    c.scrollLeft = oneSet;
    const onScroll = () => requestAnimationFrame(updateTransforms);
    c.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(updateTransforms);
    return () => c.removeEventListener('scroll', onScroll);
  }, [updateTransforms, strips.length]);

  const autoRef = useRef<number>(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const startAutoScroll = useCallback(() => {
    const c = trackRef.current;
    if (!c) return;
    const step = () => {
      const oneSet = c.scrollWidth / 3;
      c.scrollLeft += 0.8;
      if (c.scrollLeft >= oneSet * 2) c.scrollLeft -= oneSet;
      else if (c.scrollLeft < oneSet) c.scrollLeft += oneSet;
      autoRef.current = requestAnimationFrame(step);
    };
    autoRef.current = requestAnimationFrame(step);
  }, []);

  const stopAutoScroll = useCallback(() => {
    cancelAnimationFrame(autoRef.current);
    clearTimeout(resumeTimer.current);
  }, []);

  const handleUserInteract = useCallback(() => {
    stopAutoScroll();
  }, [stopAutoScroll]);

  const scheduleResume = useCallback(() => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(startAutoScroll, 3000);
  }, [startAutoScroll]);

  useEffect(() => {
    startAutoScroll();
    return () => { cancelAnimationFrame(autoRef.current); clearTimeout(resumeTimer.current); };
  }, [startAutoScroll]);

  return (
    <div className={styles.page}>
      {/* ── Header / Navigation ── */}
      <header className={styles.header}>
        <div
          className={styles.location}
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
        >
          <MapPin size={16} />
          <span>Jakarta</span>
          <div className={`${styles.tooltip} ${tooltipVisible ? styles.tooltipVisible : ''}`}>
            <div className={styles.tooltipImage}>
              <div className={styles.tooltipPlaceholder}>📍 VelvetSnap Booth</div>
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          <a href="https://instagram.com" target="_blank" rel="noopener" className={styles.navLink}>
            <Camera size={16} /> Instagram
          </a>
          <span className={styles.navSep} />
          <a href="https://wa.me/628123456789" target="_blank" rel="noopener" className={styles.navLink}>
            <MessageCircle size={16} /> WhatsApp
          </a>
          <span className={styles.navSep} />
          <a href="/templates" className={styles.navLink}>
            Templates
          </a>
          <span className={styles.navSep} />
          <a href="/strips-studio" className={styles.navLink}>
            <Sparkles size={14} /> Studio
          </a>
        </nav>
      </header>

      {/* ── Main content: 3 columns ── */}
      <main className={styles.main}>
        {/* Left column — 2 cards stacked */}
        <div className={styles.colLeft}>
          <div className={styles.introCard}>
            <div className={styles.introContent}>
              <div className={styles.logoWrap}>
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className={styles.logo}>
                  <rect x="4" y="12" width="48" height="34" rx="8" fill="var(--mn-text)" />
                  <circle cx="28" cy="29" r="11" fill="var(--mn-card)" />
                  <circle cx="28" cy="29" r="7" fill="var(--mn-text)" />
                  <rect x="39" y="8" width="12" height="4" rx="2" fill="var(--mn-text)" />
                  <path d="M48 18l4-2" stroke="var(--mn-text)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M18 8l-3 4" stroke="var(--accent-color)" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="18" cy="6" r="1.5" fill="var(--accent-color)" />
                </svg>
                <div className={styles.logoText}>
                  <h1 className={styles.logoTitle}>VelvetSnap</h1>
                  <span className={styles.logoSub}>Photo Booth Jakarta</span>
                </div>
              </div>
              <p className={styles.introDesc}>
                Cetak langsung, template kustom, hasil siap dalam hitungan detik.
              </p>
              <div className={styles.introStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNum}>{txCount || 0}+</span>
                  <span className={styles.statLabel}>Tercetak</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <span className={styles.statNum}>{tmplCount || 0}+</span>
                  <span className={styles.statLabel}>Template</span>
                </div>
              </div>
              <a href="/templates" className={styles.introCta}>
                Mulai Sekarang <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <a href="/strips-studio" className={styles.cardSmall}>
            <div className={styles.cardSmallIcon}>
              <Sparkles size={22} />
            </div>
            <div className={styles.cardSmallBody}>
              <span className={styles.cardSmallTag}>Fitur</span>
              <h3 className={styles.cardSmallTitle}>Kustom Template</h3>
              <p className={styles.cardSmallDesc}>Desain template fotomu sendiri</p>
            </div>
          </a>
        </div>

        {/* Center column — 2 cards stacked */}
        <div className={styles.colCenter}>
          <a href="/templates" className={styles.cardWedding}>
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

          <div className={styles.cardPromo}>
            <Heart size={22} />
            <div className={styles.cardPromoContent}>
              <span className={styles.promoLabel}>Promo</span>
              <span className={styles.promoValue}>Cetak ke-2 GRATIS</span>
            </div>
          </div>
        </div>

        {/* Right column — Strips scroll */}
        <div className={styles.colRight}>
          {strips.length > 0 ? (
            <div
              ref={trackRef}
              className={styles.fanTrack}
              onPointerDown={() => handleUserInteract()}
              onPointerUp={() => scheduleResume()}
              onPointerLeave={() => scheduleResume()}
            >
                {tripled.map((s, i) => (
                  <img
                    key={`${s._id}-${i}`}
                    ref={(el) => { slideRefs.current[i] = el; }}
                    src={s.finalImage}
                    alt=""
                    className={styles.fanSlide}
                    draggable={false}
                  />
                ))}
              </div>
          ) : (
            <div className={styles.rightEmpty}>
              <Camera size={32} />
              <span>Belum ada hasil strip</span>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <nav className={styles.nav}>
          <a href="https://instagram.com" target="_blank" rel="noopener" className={styles.navLink}>
            <Camera size={16} /> Instagram
          </a>
          <span className={styles.navSep} />
          <a href="https://wa.me/628123456789" target="_blank" rel="noopener" className={styles.navLink}>
            <MessageCircle size={16} /> WhatsApp
          </a>
          <span className={styles.navSep} />
          <a href="/templates" className={styles.navLink}>
            Templates
          </a>
          <span className={styles.navSep} />
          <a href="/strips-studio" className={styles.navLink}>
            <Sparkles size={14} /> Studio
          </a>
        </nav>
        <p className={styles.footerText}>
          Abadikan momen spesialmu bersama VelvetSnap ✨
        </p>
      </footer>
    </div>
  );
}
