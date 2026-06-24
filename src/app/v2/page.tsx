'use client';
import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';
import styles from './page.module.css';
import StepperFlow from './StepperFlow';
import HomePage from './homepage/HomePage';

export default function V2Page() {
  const [step, setStep] = useState(-1);
  const [sessionTimer, setSessionTimer] = useState(600);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEYS.PHOTOBOOTH_SESSION);
      if (!stored) sessionStorage.setItem(STORAGE_KEYS.PHOTOBOOTH_SESSION, `session_${Date.now()}`);
    } catch {}
    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data.success && data.data?.system) {
        setSessionTimer(data.data.system.sessionTimer || 600);
      }
    }).catch(() => {});
  }, []);

  const handleRefresh = useCallback(() => {
    try { sessionStorage.removeItem(STORAGE_KEYS.PHOTOBOOTH_SESSION); } catch {}
  }, []);

  if (step === -1) {
    return (
      <div className={styles.stepPage}>
        <HomePage onStart={() => setStep(0)} />
      </div>
    );
  }

  return (
    <StepperFlow step={step} setStep={setStep} onRefresh={handleRefresh} sessionTimer={sessionTimer} />
  );
}
