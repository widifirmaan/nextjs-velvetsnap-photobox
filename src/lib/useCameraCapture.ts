'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { COUNTDOWN_SEC } from './constants';

export interface CameraCaptureOptions {
  totalSlots: number;
  onCaptures: (caps: string[]) => void;
}

export interface CameraCaptureResult {
  stream: MediaStream | null;
  captures: string[];
  capturing: boolean;
  countdown: number | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  capture: () => void;
  retake: () => void;
  setCaptures: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useCameraCapture({ totalSlots, onCaptures }: CameraCaptureOptions): CameraCaptureResult {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captures, setCaptures] = useState<string[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then(setStream).catch(() => setStream(null));
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  const capture = useCallback(() => {
    if (!videoRef.current || capturing) return;
    setCapturing(true);
    let c = COUNTDOWN_SEC;
    setCountdown(c);
    const iv = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(iv);
        setCountdown(null);
        const canvas = document.createElement('canvas');
        const v = videoRef.current!;
        canvas.width = v.videoWidth || 640;
        canvas.height = v.videoHeight || 480;
        canvas.getContext('2d')!.drawImage(v, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCaptures((prev) => {
          const next = [...prev, dataUrl];
          if (next.length >= totalSlots) onCaptures(next);
          return next;
        });
        setTimeout(() => { setCapturing(false); if (videoRef.current) videoRef.current.srcObject = stream; }, 300);
      } else {
        setCountdown(c);
      }
    }, 1000);
  }, [capturing, totalSlots, onCaptures, stream]);

  const retake = useCallback(() => {
    setCaptures([]);
    setCountdown(null);
    setCapturing(false);
  }, []);

  return { stream, captures, capturing, countdown, videoRef, capture, retake, setCaptures };
}
