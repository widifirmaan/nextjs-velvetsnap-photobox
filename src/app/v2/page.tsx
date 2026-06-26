'use client';
import { useCallback, useRef, useState } from 'react';
import styles from './page.module.css';
import StepperFlow from './StepperFlow';
import HomePage from './homepage/HomePage';
import { useAppData } from '@/lib/useAppData';

export default function V2Page() {
  const [step, setStep] = useState(0);
  const [flipDir, setFlipDir] = useState<'none' | 'forward' | 'backward'>('none');
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appData = useAppData();

  const handleStart = useCallback(() => {
    setStep(1);
    setFlipDir('forward');
    flipTimer.current = setTimeout(() => { setFlipDir('none'); }, 600);
  }, []);

  const handleBack = useCallback(() => {
    flipTimer.current = setTimeout(() => { setStep(0); setFlipDir('none'); }, 600);
    setFlipDir('backward');
  }, []);

  return (
    <div className={styles.stepPage} style={{ perspective: '1600px' }}>
      <div style={{ display: step !== 0 ? 'none' : undefined, height: '100%' }}>
        <HomePage
          onStart={handleStart}
          strips={appData.strips}
          appName={appData.appName}
          appTagline={appData.appTagline}
          heroSubtitle={appData.heroSubtitle}
          heroImage={appData.heroImage}
          cardHtml={appData.cardHtml}
          navItems={appData.navItems}
          location={appData.location}
          footerText={appData.footerText}
          loaded={appData.loaded}
        />
      </div>

      {step !== 0 && (
        <StepperFlow step={step} setStep={setStep}
          sessionTimer={appData.sessionTimer} appName={appData.appName} onBackToHome={handleBack} />
      )}

      {flipDir === 'forward' && (
        <div className={styles.pageFlipOut}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--np-bg)',
            transformOrigin: 'left center', pointerEvents: 'none' }} />
      )}

      {flipDir === 'backward' && (
        <div className={styles.pageFlipBack}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--np-bg)',
            transformOrigin: 'right center', pointerEvents: 'none' }} />
      )}
    </div>
  );
}
