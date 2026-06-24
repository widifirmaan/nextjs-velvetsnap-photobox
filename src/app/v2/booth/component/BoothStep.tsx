'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from '../../page.module.css';
import BoothPreview from './BoothPreview';
import BoothControls from './BoothControls';
import { COUNTDOWN_SEC } from '@/lib/constants';

export default function BoothStep({ totalSlots, onCaptures, onBack }: {
  totalSlots: number; onCaptures: (caps: string[]) => void; onBack: () => void;
}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captures, setCaptures] = useState<string[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
        setTimeout(() => { setCapturing(false); videoRef.current!.srcObject = stream; }, 300);
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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px 24px' }}>
        <button className={styles.boothBtn} onClick={onBack} style={{ padding: '8px 16px', fontSize: 11 }}>
          <ArrowLeft size={14} /> BACK
        </button>
      </div>
      <div className={styles.boothLayout}>
        <BoothPreview stream={stream} captures={captures} countdown={countdown} shotCount={captures.length} totalSlots={totalSlots} />
        <BoothControls onCapture={capture} onRetake={retake} capturing={capturing} shotCount={captures.length} totalSlots={totalSlots} />
        {captures.length > 0 && (
          <div style={{ display: 'flex', gap: 6, maxWidth: 400, overflow: 'auto' }}>
            {captures.map((src, i) => (
              <img key={i} src={src} alt={`shot ${i}`}
                style={{ width: 48, height: 64, objectFit: 'cover', border: '2px solid var(--np-border)', flexShrink: 0 }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
