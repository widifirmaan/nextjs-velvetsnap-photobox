'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import styles from './page.module.css';
import type { StripResult } from './types';
import HomePage from './homepage/HomePage';
import StepperFlow from './StepperFlow';

interface Branding {
  appName: string; appTagline: string; heroTitle: string; heroSubtitle: string;
  footerText: string; primaryColor: string; accentColor: string;
  showPreloader: boolean; showStrips: boolean; slideshowInterval: number;
  fontFamily: string; headingFontFamily: string;
  headingFontSize: number; bodyFontSize: number; textAlign: string;
  sessionTimer: number;
}

const defaultBranding: Branding = {
  appName: 'VelvetSnap', appTagline: 'AI-Powered Photobooth Experience',
  heroTitle: 'Abadikan Momen Spesialmu',
  heroSubtitle: 'Pilih frame, foto, edit, dan dapatkan hasil cetakan berkualitas tinggi dalam hitungan menit',
  footerText: 'VelvetSnap Photobooth Platform',
  primaryColor: '#262626', accentColor: '#C5D89D',
  showPreloader: true, showStrips: true, slideshowInterval: 3000,
  fontFamily: '', headingFontFamily: '',
  headingFontSize: 0, bodyFontSize: 0, textAlign: '',
  sessionTimer: 600,
};

export default function Home() {
  const [step, setStep] = useState(0);
  const [showPreloader, setShowPreloader] = useState(true);
  const [preloaderFade, setPreloaderFade] = useState(false);
  const [carouselReady, setCarouselReady] = useState(false);
  const [strips, setStrips] = useState<StripResult[]>([]);
  const [txCount, setTxCount] = useState(0);
  const [tmplCount, setTmplCount] = useState(0);
  const [branding, setBranding] = useState<Branding>(defaultBranding);
  const [refreshKey, setRefreshKey] = useState(0);
  const [morphOrigin, setMorphOrigin] = useState<{x: number; y: number} | null>(null);
  const [btnMorph, setBtnMorph] = useState<{
    x: number; y: number; w: number; h: number; phase: 'pill' | 'circle' | 'expand';
  } | null>(null);
  const [clipStage, setClipStage] = useState<'init' | 'expand' | null>(null);

  const handleRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data;
          setBranding({
            appName: d.appName || defaultBranding.appName,
            appTagline: d.appTagline || defaultBranding.appTagline,
            heroTitle: d.heroTitle || defaultBranding.heroTitle,
            heroSubtitle: d.heroSubtitle || defaultBranding.heroSubtitle,
            footerText: d.footerText || defaultBranding.footerText,
            primaryColor: d.primaryColor || defaultBranding.primaryColor,
            accentColor: d.accentColor || defaultBranding.accentColor,
            showPreloader: d.showPreloader ?? defaultBranding.showPreloader,
            showStrips: d.showStrips ?? defaultBranding.showStrips,
            slideshowInterval: d.slideshowInterval || defaultBranding.slideshowInterval,
            fontFamily: d.fontFamily ?? defaultBranding.fontFamily,
            headingFontFamily: d.headingFontFamily ?? defaultBranding.headingFontFamily,
            headingFontSize: d.headingFontSize ?? defaultBranding.headingFontSize,
            bodyFontSize: d.bodyFontSize ?? defaultBranding.bodyFontSize,
            textAlign: d.textAlign ?? defaultBranding.textAlign,
            sessionTimer: d.sessionTimer ?? defaultBranding.sessionTimer,
          });
        }
      })
      .catch(() => {});
    fetch('/api/transactions/strips')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length) setStrips(res.data);
      })
      .catch(() => {});
    fetch('/api/transactions/count')
      .then((r) => r.json())
      .then((res) => { if (res.success) setTxCount(res.total); })
      .catch(() => {});
    fetch('/api/templates/list')
      .then((r) => r.json())
      .then((res) => { if (res.success) setTmplCount(res.data.length); })
      .catch(() => {});
  }, [refreshKey]);

  useEffect(() => {
    if (!branding.showPreloader) { setShowPreloader(false); return; }
    const skipPreloader = sessionStorage.getItem('skipPreloader');
    if (skipPreloader) {
      setShowPreloader(false);
      sessionStorage.removeItem('skipPreloader');
    } else {
      const timer = setTimeout(() => {
        setPreloaderFade(true);
        setTimeout(() => setShowPreloader(false), 500);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [branding.showPreloader]);

  useEffect(() => {
    if (!carouselReady) return;
    const t = setTimeout(() => {
      setPreloaderFade(true);
      setTimeout(() => setShowPreloader(false), 500);
    }, 300);
    return () => clearTimeout(t);
  }, [carouselReady]);

  const handleStart = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    setMorphOrigin({ x: cx, y: cy });
    setBtnMorph({ x: rect.left, y: rect.top, w: rect.width, h: rect.height, phase: 'pill' });

    requestAnimationFrame(() => {
      setBtnMorph((prev) => prev ? { ...prev, phase: 'circle' } : prev);
    });

    setTimeout(() => {
      setBtnMorph((prev) => prev ? { ...prev, phase: 'expand' } : prev);
      setStep(1);
      setClipStage('init');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setClipStage('expand');
        });
      });
    }, 900);
    setTimeout(() => { setBtnMorph(null); setClipStage(null); }, 2000);
  }, []);

  const clipStyle = morphOrigin && clipStage ? {
    clipPath: `circle(${clipStage === 'init' ? '0px' : '150%'} at ${morphOrigin.x}px ${morphOrigin.y}px)`,
    transition: clipStage === 'expand' ? 'clip-path 0.9s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
  } as React.CSSProperties : undefined;

  return (
    <>
      {showPreloader && (
        <div className={`${styles.preloader} ${preloaderFade ? styles.preloaderHidden : ''}`}>
          <div className={styles.preloaderInner}>
            <svg width="64" height="64" viewBox="0 0 56 56" fill="none" className={styles.preloaderLogo}>
              <rect x="4" y="12" width="48" height="34" rx="8" fill={branding.primaryColor} />
              <circle cx="28" cy="29" r="11" fill="#fff" />
              <circle cx="28" cy="29" r="7" fill={branding.primaryColor} />
              <rect x="39" y="8" width="12" height="4" rx="2" fill={branding.primaryColor} />
              <path d="M48 18l4-2" stroke={branding.primaryColor} strokeWidth="2" strokeLinecap="round" />
              <path d="M18 8l-3 4" stroke={branding.accentColor} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="6" r="1.5" fill={branding.accentColor} />
            </svg>
            <span className={styles.preloaderTitle}>{branding.appName}</span>
            <span className={styles.preloaderSub}>{branding.appTagline}</span>
            <div className={styles.preloaderSpinner} />
            <span className={styles.preloaderWait}>Mohon tunggu...</span>
          </div>
        </div>
      )}

      {btnMorph && (
        <>
          <div
            className={`${styles.btnGhost} ${btnMorph.phase !== 'pill' ? styles.btnGhostHidden : ''}`}
            style={{
              left: btnMorph.x,
              top: btnMorph.y,
              width: btnMorph.w,
              height: btnMorph.h,
            }}
          >
            Mulai Sekarang
          </div>
          <div
            className={`${styles.btnMorph} ${styles[`btnMorph_${btnMorph.phase}`]}`}
            style={{
              left: btnMorph.phase === 'pill' ? btnMorph.x : btnMorph.x + (btnMorph.w - btnMorph.h) / 2,
              top: btnMorph.y,
              width: btnMorph.phase === 'pill' ? btnMorph.w : btnMorph.h,
              height: btnMorph.h,
            }}
          >
            <span className={styles.btnMorphText}>
              Mulai Sekarang
            </span>
            <Camera className={styles.btnMorphIcon} size={btnMorph.phase === 'pill' ? 14 : 20} />
          </div>
        </>
      )}

      <div className={styles.stepTransition} style={{ display: step !== 0 ? 'none' : undefined }}>
        <HomePage strips={strips} txCount={txCount} tmplCount={tmplCount} branding={branding} onStart={handleStart} onCarouselReady={() => setCarouselReady(true)} />
      </div>
      {step !== 0 && (
        <div key="flow" style={clipStyle} className={clipStage ? styles.clipReveal : styles.stepContent}>
          <StepperFlow step={step} setStep={setStep} onRefresh={handleRefresh} sessionTimer={branding.sessionTimer} />
        </div>
      )}
    </>
  );
}
