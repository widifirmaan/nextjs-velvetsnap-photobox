'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';
import styles from './page.module.css';
import StepperFlow from './StepperFlow';
import HomePage from './homepage/HomePage';

export default function V2Page() {
  const [step, setStep] = useState(-1);
  const [sessionTimer, setSessionTimer] = useState(600);
  const [appName, setAppName] = useState('VelvetSnap');
  const [flipDir, setFlipDir] = useState<'none' | 'forward' | 'backward'>('none');
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayStep = useRef(-1);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEYS.PHOTOBOOTH_SESSION);
      if (!stored) sessionStorage.setItem(STORAGE_KEYS.PHOTOBOOTH_SESSION, `session_${Date.now()}`);
    } catch {}
    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data.success && data.data) {
        if (data.data.system) setSessionTimer(data.data.system.sessionTimer || 600);
        if (data.data.appName) setAppName(data.data.appName);
      }
    }).catch(() => {});
    return () => { if (flipTimer.current) { clearTimeout(flipTimer.current); flipTimer.current = null; } };
  }, []);

  const handleStart = useCallback(() => {
    overlayStep.current = -1;
    setStep(0);
    setFlipDir('forward');
    flipTimer.current = setTimeout(() => { setFlipDir('none'); }, 800);
  }, []);

  const handleBack = useCallback(() => {
    overlayStep.current = step;
    setStep(-1);
    setFlipDir('backward');
    flipTimer.current = setTimeout(() => { setFlipDir('none'); }, 800);
  }, [step]);

  const handleRefresh = useCallback(() => {
    try { sessionStorage.removeItem(STORAGE_KEYS.PHOTOBOOTH_SESSION); } catch {}
  }, []);

  const showStepper = flipDir === 'forward' || (flipDir === 'none' && step >= 0);

  return (
    <div className={styles.stepPage} style={{ perspective: '1600px' }}>
      {showStepper ? (
        <StepperFlow step={step} setStep={setStep} onRefresh={handleRefresh}
          sessionTimer={sessionTimer} appName={appName} onBackToHome={handleBack} />
      ) : (
        <HomePage onStart={handleStart} />
      )}

      {/* Overlay for forward flip — HomePage flips out to left */}
      {flipDir === 'forward' && (
        <div className={styles.pageFlipOut}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--np-bg)', transformOrigin: 'left center' }}>
          <HomePage onStart={() => {}} />
        </div>
      )}

      {/* Overlay for backward flip — StepperFlow flips out to right */}
      {flipDir === 'backward' && (
        <div className={styles.pageFlipBack}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--np-bg)', transformOrigin: 'right center' }}>
          <StepperFlow step={overlayStep.current} setStep={setStep} onRefresh={handleRefresh}
            sessionTimer={sessionTimer} appName={appName} onBackToHome={handleBack} />
        </div>
      )}
    </div>
  );
}
