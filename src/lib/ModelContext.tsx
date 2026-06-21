'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

type ModelStatus = 'checking' | 'ready' | 'downloading' | 'error';

interface ModelContextValue {
  status: ModelStatus;
  progress: number;
  preload: () => Promise<void>;
  retry: () => Promise<void>;
  errorMessage: string;
}

const ModelContext = createContext<ModelContextValue>({
  status: 'checking',
  progress: 0,
  preload: async () => {},
  retry: async () => {},
  errorMessage: '',
});

import { STORAGE_KEYS } from './constants';
const STORAGE_KEY = STORAGE_KEYS.IMGLY_MODEL_READY;
const RETRY_KEY = STORAGE_KEYS.IMGLY_MODEL_RETRY;

async function clearModelCache() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RETRY_KEY);
    if (typeof indexedDB.databases === 'function') {
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        if (db.name?.includes('imgly') || db.name?.includes('onnx')) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        if (key.includes('imgly') || key.includes('onnx')) {
          await caches.delete(key);
        }
      }
    }
  } catch {}
}

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ModelStatus>('checking');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const loaded = useRef(false);

  const log = useCallback(async (level: string, message: string, data?: any) => {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, data }),
      });
    } catch {}
  }, []);

  const preload = useCallback(async (attempt = 1) => {
    if (loaded.current) return;
    loaded.current = true;
    setStatus('downloading');
    setProgress(0);
    setErrorMessage('');
    log('info', 'preload started', { attempt });

    try {
      const { removeBackground } = await import('@imgly/background-removal');

      const fileCurrents: Record<string, number> = {};
      const fileTotals: Record<string, number> = {};
      let totalBytes = 0;
      let downloadedBytes = 0;

      const onProgress = (key: string, current: number, total: number) => {
        if (key.startsWith('fetch:')) {
          const name = key.slice(6);
          if (!(name in fileTotals)) {
            fileTotals[name] = total;
            totalBytes += total;
          }
          const prev = fileCurrents[name] || 0;
          const delta = current - prev;
          if (delta > 0) {
            downloadedBytes += delta;
            fileCurrents[name] = current;
          } else if (current === total && total > 0) {
            const missing = total - prev;
            downloadedBytes += missing;
            fileCurrents[name] = current;
          }
          setProgress(Math.min(Math.round((downloadedBytes / Math.max(totalBytes, 1)) * 100), 99));
        }
      };

      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx!.fillStyle = '#00ff00';
      ctx!.fillRect(0, 0, 32, 32);

      const startedAt = Date.now();
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) { log('error', 'canvas blob failed'); reject(new Error('Canvas error')); return; }
          try {
            const url = URL.createObjectURL(blob);
            await removeBackground(url, { model: 'isnet_quint8', progress: onProgress });
            URL.revokeObjectURL(url);
            log('info', 'preload dummy inference done', { elapsed: Date.now() - startedAt });
            resolve();
          } catch (e) {
            reject(e);
          }
        }, 'image/png');
      });

      setProgress(100);
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.removeItem(RETRY_KEY);
      setStatus('ready');
      log('info', 'preload completed');
    } catch (err: any) {
      loaded.current = false;
      const msg = err?.message || 'Unknown error';
      setErrorMessage(msg);
      log('error', 'preload failed', { message: msg, attempt });

      const isCorrupt = /download|corrupt|onnx|wasm|network|fetch|abort/i.test(msg);
      if (isCorrupt) {
        await clearModelCache();
      }

      if (isCorrupt && attempt < 3) {
        localStorage.setItem(RETRY_KEY, String(attempt));
        await new Promise((r) => setTimeout(r, 1500));
        return preload(attempt + 1);
      }

      setStatus('error');
    }
  }, [log]);

  const retry = useCallback(async () => {
    loaded.current = false;
    setErrorMessage('');
    await clearModelCache();
    await new Promise((r) => setTimeout(r, 300));
    return preload();
  }, [preload]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      setStatus('ready');
      loaded.current = true;
    } else {
      setStatus('checking');
      setProgress(0);
      preload();
    }
  }, [preload]);

  return (
    <ModelContext.Provider value={{ status, progress, preload, retry, errorMessage }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  return useContext(ModelContext);
}
