'use client';
import { useState, useEffect, useMemo, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import { STORAGE_KEYS } from '../constants';

export interface UseCameraDevicesReturn {
  deviceId: string | undefined;
  setDeviceId: (id: string) => void;
  cameraType: 'webcam' | 'dslr';
  setCameraType: (t: 'webcam' | 'dslr') => void;
  availableCams: MediaDeviceInfo[];
  showCamMenu: boolean;
  setShowCamMenu: Dispatch<SetStateAction<boolean>>;
  camMenuRef: React.RefObject<HTMLDivElement | null>;
  isFrontCamera: boolean;
  handleSwitchCamera: (camId: string) => void;
}

export function useCameraDevices(): UseCameraDevicesReturn {
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [cameraType, setCameraType] = useState<'webcam' | 'dslr'>('webcam');
  const [availableCams, setAvailableCams] = useState<MediaDeviceInfo[]>([]);
  const [showCamMenu, setShowCamMenu] = useState(false);
  const camMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DEVICE_SETTINGS);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.cameraType === 'dslr') setCameraType('dslr');
        if (s.camera) setDeviceId(s.camera);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (cameraType !== 'webcam') return;
    let cancelled = false;
    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        const cams = devices.filter((d) => d.kind === 'videoinput');
        const sorted = [...cams].sort((a, b) => {
          const score = (l: string) => {
            const lower = l.toLowerCase();
            if (lower.includes('front') || lower.includes('facetime') || lower.includes('built-in')) return 0;
            if (lower.includes('back') || lower.includes('rear')) return 1;
            return 2;
          };
          return score(a.label) - score(b.label);
        });
        if (sorted.length) {
          const savedRaw = localStorage.getItem(STORAGE_KEYS.DEVICE_SETTINGS);
          let savedId: string | undefined;
          try { if (savedRaw) { const s = JSON.parse(savedRaw); savedId = s.camera; } } catch (e) { console.error('useCameraDevices: saved settings parse failed', e); }
          if (!savedId || !sorted.some((c) => c.deviceId === savedId)) {
            setDeviceId(sorted[0].deviceId);
            saveDeviceId(sorted[0].deviceId);
          }
        }
        setAvailableCams(sorted);
      } catch (e) { console.error('useCameraDevices: enumerateDevices failed', e); }
    })();
    return () => { cancelled = true; };
  }, [cameraType]);

  const saveDeviceId = useCallback((id: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DEVICE_SETTINGS);
      const s = raw ? JSON.parse(raw) : {};
      s.camera = id;
      localStorage.setItem(STORAGE_KEYS.DEVICE_SETTINGS, JSON.stringify(s));
    } catch (e) { console.error('useCameraDevices: saveDeviceId failed', e); }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (camMenuRef.current && !camMenuRef.current.contains(e.target as Node)) setShowCamMenu(false);
    };
    if (showCamMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCamMenu]);

  const isFrontCamera = useMemo(() => {
    if (!deviceId || !availableCams.length) return true;
    const cam = availableCams.find((c) => c.deviceId === deviceId);
    if (!cam) return true;
    const label = cam.label.toLowerCase();
    return label.includes('front') || label.includes('facetime') || label.includes('built-in');
  }, [deviceId, availableCams]);

  const handleSetDeviceId = useCallback((id: string) => {
    setDeviceId(id);
    saveDeviceId(id);
  }, [saveDeviceId]);

  const handleSwitchCamera = useCallback((camId: string) => {
    setDeviceId(camId);
    setShowCamMenu(false);
    saveDeviceId(camId);
  }, [saveDeviceId]);

  return {
    deviceId, setDeviceId: handleSetDeviceId,
    cameraType, setCameraType,
    availableCams, showCamMenu, setShowCamMenu, camMenuRef,
    isFrontCamera, handleSwitchCamera,
  };
}
