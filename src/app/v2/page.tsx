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

    // Preload templates like v1: cache in sessionStorage + global promise
    const tmplPromise = fetch('/api/templates/list')
      .then(r => r.json())
      .then(data => {
        const list = data.data || data.templates || [];
        try { sessionStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(list)); } catch {}
        return list;
      })
      .catch((e) => { console.error('preload templates failed', e); return []; });
    if (typeof window !== 'undefined') (window as any).__templatePromise = tmplPromise;

    return () => { if (flipTimer.current) { clearTimeout(flipTimer.current); flipTimer.current = null; } };
  }, []);

  const handleStart = useCallback(() => {
    setStep(0);
    setFlipDir('forward');
    flipTimer.current = setTimeout(() => { setFlipDir('none'); }, 600);
  }, []);

  const handleBack = useCallback(() => {
    flipTimer.current = setTimeout(() => { setStep(-1); setFlipDir('none'); }, 600);
    setFlipDir('backward');
  }, []);

  const handleRefresh = useCallback(() => {
    try { sessionStorage.removeItem(STORAGE_KEYS.PHOTOBOOTH_SESSION); } catch {}
  }, []);

  return (
    <div className={styles.stepPage} style={{ perspective: '1600px' }}>
      {/* HomePage always mounted like v1, hidden when stepper is visible */}
      <div style={{ display: step !== -1 ? 'none' : undefined, height: '100%' }}>
        <HomePage onStart={handleStart} />
      </div>

      {/* StepperFlow mounts only when needed */}
      {step !== -1 && (
        <StepperFlow step={step} setStep={setStep} onRefresh={handleRefresh}
          sessionTimer={sessionTimer} appName={appName} onBackToHome={handleBack} />
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
