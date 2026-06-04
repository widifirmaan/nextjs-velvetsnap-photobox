'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import HomePage from '@/components/steps/homepage/HomePage';
import StepperFlow from '@/components/steps/StepperFlow';
import type { StripResult, TemplateData } from '@/components/steps/types';

export default function Home() {
  const [step, setStep] = useState(0);
  const [showPreloader, setShowPreloader] = useState(true);
  const [strips, setStrips] = useState<StripResult[]>([]);
  const [txCount, setTxCount] = useState(0);
  const [tmplCount, setTmplCount] = useState(0);
  const [allTemplates, setAllTemplates] = useState<TemplateData[]>([]);

  useEffect(() => {
    fetch('/api/transactions/strips')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length) {
          Promise.all(
            res.data.map((s: StripResult) => new Promise<void>((resolve) => {
              const img = new window.Image();
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = s.finalImage;
            }))
          ).then(() => setStrips(res.data));
        }
      })
      .catch(() => {});
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

    const timer = setTimeout(() => setShowPreloader(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (showPreloader) {
    return (
      <div className={styles.preloader}>
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
    );
  }

  return step === 0 ? (
    <div key="home" className={styles.stepTransition}><HomePage strips={strips} txCount={txCount} tmplCount={tmplCount} onStart={() => setStep(1)} /></div>
  ) : (
    <div key="flow" className={styles.stepTransition}><StepperFlow step={step} setStep={setStep} allTemplates={allTemplates} /></div>
  );
}
