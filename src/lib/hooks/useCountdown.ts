'use client';
import { useState, useRef, useCallback } from 'react';
import { COUNTDOWN_SEC } from '../constants';

export interface UseCountdownReturn {
  countdown: number | null;
  flash: boolean;
  busy: boolean;
  runCountdown: (onFire: () => void | Promise<void>) => Promise<void>;
  runBatchCountdown: (count: number, onFire: () => void | Promise<void>) => Promise<void>;
  cancel: () => void;
}

export function useCountdown(): UseCountdownReturn {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [busy, setBusy] = useState(false);
  const cancelledRef = useRef(false);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setCountdown(null);
    setBusy(false);
  }, []);

  const runSingle = useCallback(async (onFire: () => void | Promise<void>): Promise<void> => {
    setBusy(true);
    cancelledRef.current = false;
    let timer = COUNTDOWN_SEC;
    setCountdown(timer);
    await new Promise<void>((resolve) => {
      const iv = setInterval(() => {
        if (cancelledRef.current) {
          clearInterval(iv);
          setCountdown(null);
          resolve();
          return;
        }
        timer--;
        if (timer > 0) setCountdown(timer);
        else {
          clearInterval(iv);
          setCountdown(null);
          resolve();
        }
      }, 1000);
    });
    if (cancelledRef.current) { setBusy(false); return; }
    setFlash(true);
    await new Promise((r) => setTimeout(r, 180));
    setFlash(false);
    await new Promise((r) => setTimeout(r, 80));
    await onFire();
    await new Promise((r) => setTimeout(r, 400));
    setBusy(false);
  }, []);

  const runCountdown = useCallback(async (onFire: () => void | Promise<void>) => {
    await runSingle(onFire);
  }, [runSingle]);

  const runBatchCountdown = useCallback(async (count: number, onFire: () => void | Promise<void>) => {
    for (let i = 0; i < count; i++) {
      if (cancelledRef.current) break;
      await runSingle(onFire);
    }
  }, [runSingle]);

  return { countdown, flash, busy, runCountdown, runBatchCountdown, cancel };
}
