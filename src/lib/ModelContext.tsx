'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

type ModelStatus = 'checking' | 'ready' | 'downloading' | 'error';

interface ModelContextValue {
  status: ModelStatus;
  preload: () => Promise<void>;
  retry: () => Promise<void>;
  errorMessage: string;
}

const ModelContext = createContext<ModelContextValue>({
  status: 'checking',
  preload: async () => {},
  retry: async () => {},
  errorMessage: '',
});

const STORAGE_KEY = 'imgly_model_ready';
const RETRY_KEY = 'imgly_model_retry';

const ric = (cb: () => void) => {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(cb, { timeout: 5000 });
  } else {
    setTimeout(cb, 1000);
  }
};
const cic = (id: any) => {
  if ('cancelIdleCallback' in window) {
    (window as any).cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

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
  const [errorMessage, setErrorMessage] = useState('');
  const loaded = useRef(false);

  const preload = useCallback(async (attempt = 1) => {
    if (loaded.current) return;
    loaded.current = true;
    setStatus('downloading');
    setErrorMessage('');

    try {
      const { removeBackground } = await import('@imgly/background-removal');

      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx!.fillStyle = '#00ff00';
      ctx!.fillRect(0, 0, 32, 32);

      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) { reject(new Error('Canvas error')); return; }
          try {
            const url = URL.createObjectURL(blob);
            await removeBackground(url);
            URL.revokeObjectURL(url);
            resolve();
          } catch (e) {
            reject(e);
          }
        }, 'image/png');
      });

      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.removeItem(RETRY_KEY);
      setStatus('ready');
    } catch (err: any) {
      loaded.current = false;
      const msg = err?.message || 'Unknown error';
      setErrorMessage(msg);

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
  }, []);

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
      const idle = ric(() => preload());
      return () => cic(idle);
    }
  }, [preload]);

  return (
    <ModelContext.Provider value={{ status, preload, retry, errorMessage }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  return useContext(ModelContext);
}
