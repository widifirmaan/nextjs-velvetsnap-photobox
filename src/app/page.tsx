'use client';

import { useCallback, useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import styles from './page.module.css';
import type { StripResult, TemplateData } from '@/components/steps/types';
import HomePage from '@/components/steps/homepage/HomePage';
import StepperFlow from '@/components/steps/StepperFlow';

export default function Home() {
  const [step, setStep] = useState(0);
  const [showPreloader, setShowPreloader] = useState(true);
  const [preloaderFade, setPreloaderFade] = useState(false);
  const [strips, setStrips] = useState<StripResult[]>([]);
  const [txCount, setTxCount] = useState(0);
  const [tmplCount, setTmplCount] = useState(0);
  const [allTemplates, setAllTemplates] = useState<TemplateData[]>([]);
  const [btnMorph, setBtnMorph] = useState<{
    x: number; y: number; w: number; h: number; phase: 'pill' | 'circle' | 'expand';
  } | null>(null);

  useEffect(() => {
    fetch('/api/transactions/strips')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length) {
          setStrips(res.data);
          const img = new window.Image();
          img.onload = () => {
            setPreloaderFade(true);
            setTimeout(() => setShowPreloader(false), 500);
          };
          img.onerror = () => {
            setPreloaderFade(true);
            setTimeout(() => setShowPreloader(false), 500);
          };
          img.src = res.data[0].finalImage;
        } else {
          setPreloaderFade(true);
          setTimeout(() => setShowPreloader(false), 500);
        }
      })
      .catch(() => { setPreloaderFade(true); setTimeout(() => setShowPreloader(false), 500); });
    fetch('/api/transactions')
      .then((r) => r.json())
      .then((res) => { if (res.success) setTxCount(res.pagination.total); })
      .catch(() => {});
    fetch('/api/templates')
      .then((r) => r.json())
      .then((res) => { if (res.success) setTmplCount(res.data.length); })
      .catch(() => {});
    fetch('/api/templates/thumbnails')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length) {
          const active = res.data.filter((t: TemplateData) => t.isActive !== false);
          setAllTemplates(active);
          active.forEach((t: TemplateData) => {
            if (t.frameImage) { const img = new window.Image(); img.src = t.frameImage; }
          });
        }
      })
      .catch(() => {});

    const timer = setTimeout(() => { setPreloaderFade(true); setTimeout(() => setShowPreloader(false), 500); }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setBtnMorph({ x: rect.left, y: rect.top, w: rect.width, h: rect.height, phase: 'pill' });

    requestAnimationFrame(() => {
      setBtnMorph((prev) => prev ? { ...prev, phase: 'circle' } : prev);
    });

    setTimeout(() => {
      setBtnMorph((prev) => prev ? { ...prev, phase: 'expand' } : prev);
      setStep(1);
    }, 500);
    setTimeout(() => setBtnMorph(null), 1300);
  }, []);

  return (
    <>
      {showPreloader && (
        <div className={`${styles.preloader} ${preloaderFade ? styles.preloaderHidden : ''}`}>
          <div className={styles.preloaderInner}>
            <svg width="64" height="64" viewBox="0 0 56 56" fill="none" className={styles.preloaderLogo}>
              <rect x="4" y="12" width="48" height="34" rx="8" fill="#262626" />
              <circle cx="28" cy="29" r="11" fill="#fff" />
              <circle cx="28" cy="29" r="7" fill="#262626" />
              <rect x="39" y="8" width="12" height="4" rx="2" fill="#262626" />
              <path d="M48 18l4-2" stroke="#262626" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 8l-3 4" stroke="#262626" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="6" r="1.5" fill="#262626" />
            </svg>
            <span className={styles.preloaderTitle}>VelvetSnap</span>
            <span className={styles.preloaderSub}>Photo Booth Jakarta</span>
            <div className={styles.preloaderSpinner} />
          </div>
        </div>
      )}

      {btnMorph && (
        <div
          className={`${styles.btnMorph} ${styles[`btnMorph_${btnMorph.phase}`]}`}
          style={{
            left: btnMorph.x,
            top: btnMorph.y,
            width: btnMorph.phase === 'pill' ? btnMorph.w : btnMorph.h,
            height: btnMorph.h,
          }}

        >
          <span className={`${styles.btnMorphText} ${btnMorph.phase !== 'pill' ? styles.btnMorphTextHidden : ''}`}>
            Mulai Sekarang
          </span>
          <Camera className={styles.btnMorphIcon} size={btnMorph.phase === 'pill' ? 14 : 20} />
        </div>
      )}

      {step === 0 ? (
        <div key="home" className={styles.stepTransition}><HomePage strips={strips} txCount={txCount} tmplCount={tmplCount} onStart={handleStart} /></div>
      ) : (
        <div key="flow" className={btnMorph?.phase === 'expand' ? styles.stepZoomIn : styles.stepTransition}>
          <StepperFlow step={step} setStep={setStep} allTemplates={allTemplates} />
        </div>
      )}
    </>
  );
}
