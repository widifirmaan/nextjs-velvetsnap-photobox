'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import styles from './page.module.css';
import type { StripResult } from './types';
import HomePage from './homepage/HomePage';
import StepperFlow from './StepperFlow';

interface Branding {
  appName: string; appTagline: string; heroSubtitle: string;
  logo: string; cardSmallHtml: string; cardPromoHtml: string;
  slideshowImages: string[];
  header: { location: string; navItems: string };
  footer: { text: string };
  system: { primaryColor: string; accentColor: string; showPreloader: boolean; showStrips: boolean; slideshowInterval: number; sessionTimer: number };
}

const defaultBranding: Branding = {
  appName: 'VelvetSnap', appTagline: 'AI-Powered Photobooth Experience',
  heroSubtitle: 'Pilih frame, foto, edit, dan dapatkan hasil cetakan berkualitas tinggi dalam hitungan menit',
  logo: '', cardSmallHtml: '', cardPromoHtml: '',
  slideshowImages: [],
  header: { location: 'Jakarta', navItems: '[{"label":"Instagram","url":"https://instagram.com"},{"label":"WhatsApp","url":"https://wa.me/628123456789"},{"label":"Templates","url":"/templates"},{"label":"Studio","url":"/strips-studio"}]' },
  footer: { text: 'VelvetSnap Photobooth Platform' },
  system: { primaryColor: '#262626', accentColor: '#C5D89D', showPreloader: true, showStrips: true, slideshowInterval: 3000, sessionTimer: 600 },
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

  const getAccountParam = () => {
    if (typeof window === 'undefined') return '';
    const id = localStorage.getItem('velvetsnap_account_id');
    return id ? `?accountId=${encodeURIComponent(id)}` : '';
  };

  const fetchSettings = useCallback((accountId?: string | null) => {
    const qp = accountId ? `?accountId=${encodeURIComponent(accountId)}` : getAccountParam();
    fetch(`/api/settings${qp}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data;
          setBranding({
            appName: d.appName || defaultBranding.appName,
            appTagline: d.appTagline || defaultBranding.appTagline,
            heroSubtitle: d.heroSubtitle || defaultBranding.heroSubtitle,
            logo: d.logo || '',
            cardSmallHtml: d.cardSmallHtml || '',
            cardPromoHtml: d.cardPromoHtml || '',
            slideshowImages: Array.isArray(d.slideshowImages) && d.slideshowImages.length ? d.slideshowImages : [],
            header: {
              location: d.header?.location || defaultBranding.header.location,
              navItems: d.header?.navItems || defaultBranding.header.navItems,
            },
            footer: {
              text: d.footer?.text || defaultBranding.footer.text,
            },
            system: {
              primaryColor: d.system?.primaryColor || defaultBranding.system.primaryColor,
              accentColor: d.system?.accentColor || defaultBranding.system.accentColor,
              showPreloader: d.system?.showPreloader ?? defaultBranding.system.showPreloader,
              showStrips: d.system?.showStrips ?? defaultBranding.system.showStrips,
              slideshowInterval: d.system?.slideshowInterval || defaultBranding.system.slideshowInterval,
              sessionTimer: d.system?.sessionTimer ?? defaultBranding.system.sessionTimer,
            },
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onRefresh = () => handleRefresh();
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) handleRefresh(); };
    const onVisible = () => { if (document.visibilityState === 'visible') handleRefresh(); };
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onRefresh);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onRefresh);
    };
  }, [handleRefresh]);

  useEffect(() => {
    const resolveAccountId = async (): Promise<string | null> => {
      const localId = localStorage.getItem('velvetsnap_account_id');
      if (localId) return localId;
      const ssId = sessionStorage.getItem('admin_account_id');
      if (ssId) return ssId;
      try {
        const r = await fetch('/api/admin/session');
        if (r.ok) {
          const data = await r.json();
          if (!data.isRoot && data.accountId) {
            localStorage.setItem('velvetsnap_account_id', data.accountId);
            return data.accountId;
          }
        }
      } catch {}
      return null;
    };

    resolveAccountId().then((accountId) => {
      const qp = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
      fetchSettings(accountId);
      fetch(`/api/transactions/strips${qp}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data?.length) setStrips(res.data);
        })
        .catch(() => {});
      fetch(`/api/transactions/count${qp}`)
        .then((r) => r.json())
        .then((res) => { if (res.success) setTxCount(res.total); })
        .catch(() => {});
      fetch(`/api/templates/list${qp}`)
        .then((r) => r.json())
        .then((res) => { if (res.success) setTmplCount(res.data.length); })
        .catch(() => {});
    });
  }, [refreshKey]);

  useEffect(() => {
    try {
      const bc = new BroadcastChannel('velvetsnap');
      bc.onmessage = (e) => { if (e.data === 'settings-updated') fetchSettings(); };
      return () => bc.close();
    } catch {}
  }, [fetchSettings]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', branding.system.accentColor);
  }, [branding.system.accentColor]);

  useEffect(() => {
    if (!branding.system.showPreloader) { setShowPreloader(false); return; }
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
  }, [branding.system.showPreloader]);

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
            {branding.logo ? (
              <img src={branding.logo} alt="" className={styles.preloaderLogo} style={{ width:64, height:64, objectFit:'contain' }} />
            ) : (
              <svg width="64" height="64" viewBox="0 0 56 56" fill="none" className={styles.preloaderLogo}>
                <rect x="4" y="12" width="48" height="34" rx="8" fill={branding.system.primaryColor} />
                <circle cx="28" cy="29" r="11" fill="#fff" />
                <circle cx="28" cy="29" r="7" fill={branding.system.primaryColor} />
                <rect x="39" y="8" width="12" height="4" rx="2" fill={branding.system.primaryColor} />
                <path d="M48 18l4-2" stroke={branding.system.primaryColor} strokeWidth="2" strokeLinecap="round" />
                <path d="M18 8l-3 4" stroke={branding.system.accentColor} strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="18" cy="6" r="1.5" fill={branding.system.accentColor} />
              </svg>
            )}
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
          <StepperFlow step={step} setStep={setStep} onRefresh={handleRefresh} sessionTimer={branding.system.sessionTimer} />
        </div>
      )}
    </>
  );
}
