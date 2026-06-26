'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flipImage } from './canvas-utils';
import { compressImage } from './image-utils';
import { useCameraDevices, useCountdown } from './hooks';

export interface BoothCaptureOptions {
  totalSlots: number;
  captures?: string[];
  onCaptures: (caps: string[]) => void;
}

export interface BoothCaptureResult {
  webcamRef: React.RefObject<any>;
  fileRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  captures: string[];
  mirrored: boolean;
  setMirrored: React.Dispatch<React.SetStateAction<boolean>>;
  captureMode: 'manual' | 'auto';
  setCaptureMode: React.Dispatch<React.SetStateAction<'manual' | 'auto'>>;
  countdown: number | null;
  flash: boolean;
  busy: boolean;
  deviceId: string | undefined;
  availableCams: MediaDeviceInfo[];
  showCamMenu: boolean;
  setShowCamMenu: React.Dispatch<React.SetStateAction<boolean>>;
  camMenuRef: React.RefObject<HTMLDivElement | null>;
  isFrontCamera: boolean;
  handleSwitchCamera: (camId: string) => void;
  handleCapture: () => Promise<void>;
  handleUpload: (idx: number, e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  retake: () => void;
  isDone: boolean;
}

export function useBoothCapture({ totalSlots, captures: initialCaptures, onCaptures }: BoothCaptureOptions): BoothCaptureResult {
  const [captures, setCaptures] = useState<string[]>(initialCaptures || []);
  const [mirrored, setMirrored] = useState(true);
  const [captureMode, setCaptureMode] = useState<'manual' | 'auto'>('manual');
  const webcamRef = useRef<any>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const completedRef = useRef(
    initialCaptures ? initialCaptures.length >= totalSlots && initialCaptures.every(Boolean) : false
  );

  const { deviceId, availableCams, showCamMenu, setShowCamMenu, camMenuRef, isFrontCamera, handleSwitchCamera } = useCameraDevices();
  const { countdown, flash, busy, runCountdown, runBatchCountdown } = useCountdown();

  const isDone = captures.length >= totalSlots;

  useEffect(() => {
    setMirrored(isFrontCamera);
  }, [isFrontCamera]);

  useEffect(() => {
    if (captures.length >= totalSlots && captures.every(Boolean)) {
      if (!completedRef.current) {
        completedRef.current = true;
        onCaptures(captures);
      }
    } else {
      completedRef.current = false;
    }
  }, [captures, totalSlots, onCaptures]);

  const addCapture = useCallback((url: string) => {
    setCaptures((prev) => [...prev, url]);
  }, []);

  const doCapture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const url = mirrored ? await flipImage(imageSrc) : imageSrc;
      addCapture(url);
    }
  }, [mirrored, addCapture]);

  const handleCapture = useCallback(async () => {
    if (busy || isDone) return;
    if (captureMode === 'auto') {
      const remaining = totalSlots - captures.length;
      if (remaining > 0) await runBatchCountdown(remaining, doCapture);
    } else {
      await runCountdown(doCapture);
    }
  }, [busy, isDone, captureMode, totalSlots, captures.length, runBatchCountdown, runCountdown, doCapture]);

  const handleUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      if (dataUrl) {
        const compressed = await compressImage(dataUrl);
        setCaptures((prev) => {
          const next = [...prev];
          next[idx] = compressed;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const retake = useCallback(() => {
    completedRef.current = false;
    setCaptures([]);
  }, []);

  return {
    webcamRef, fileRefs, captures, mirrored, setMirrored,
    captureMode, setCaptureMode,
    countdown, flash, busy,
    deviceId, availableCams, showCamMenu, setShowCamMenu, camMenuRef,
    isFrontCamera, handleSwitchCamera,
    handleCapture, handleUpload, retake, isDone,
  };
}
