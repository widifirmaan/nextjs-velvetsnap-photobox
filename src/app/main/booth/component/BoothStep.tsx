'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { flipImage } from '@/lib/canvas-utils';
import Webcam from 'react-webcam';
import StepperBar from '../../StepperBar';
import { TemplateData } from '../../types';
import Viewfinder from './Viewfinder';
import BoothPreview from './BoothPreview';
import BoothControls from './BoothControls';
import styles from '@/app/main/page.module.css';

export default function BoothStep({
  templateId, templateName, slotsCount, filledCount, captures,
  onAddCapture, onDeleteCapture, templateData, keyedFrameImage, frameRatio,
  stripLoading, onNext, onBack,
}: {
  templateId: string; templateName: string; slotsCount: number; filledCount: number; captures: string[];
  onAddCapture: (url: string, slotIdx?: number) => void; onDeleteCapture: (idx: number) => void;
  templateData: TemplateData | null; keyedFrameImage: string; frameRatio: number;
  stripLoading: boolean; onNext: () => void; onBack: () => void;
}) {
  const webcamRef = useRef<Webcam>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [taking, setTaking] = useState(false);
  const [flash, setFlash] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mirrored, setMirrored] = useState(false);
  const [captureMode, setCaptureMode] = useState<'auto' | 'manual'>('manual');
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [cameraType, setCameraType] = useState<'webcam' | 'dslr'>('webcam');
  const [availableCams, setAvailableCams] = useState<MediaDeviceInfo[]>([]);
  const [showCamMenu, setShowCamMenu] = useState(false);
  const camMenuRef = useRef<HTMLDivElement>(null);
  const [dslrCapturing, setDslrCapturing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('velvetsnap_device_settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.cameraType === 'dslr') setCameraType('dslr');
        if (s.camera) setDeviceId(s.camera);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (cameraType !== 'webcam') return;
    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
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
          const savedId = (() => { try { const r = localStorage.getItem('velvetsnap_device_settings'); if (r) { const s = JSON.parse(r); return s.camera; } } catch {} return null; })();
          if (!savedId || !sorted.some((c) => c.deviceId === savedId)) {
            handleSwitchCamera(sorted[0].deviceId);
          }
        }
        setAvailableCams(sorted);
      } catch {}
    })();
  }, [cameraType]);

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

  useEffect(() => {
    setMirrored(isFrontCamera);
  }, [isFrontCamera]);

  const handleSwitchCamera = (camId: string) => {
    setDeviceId(camId); setShowCamMenu(false);
    const cam = availableCams.find((c) => c.deviceId === camId);
    const front = cam ? (cam.label.toLowerCase().includes('front') || cam.label.toLowerCase().includes('facetime') || cam.label.toLowerCase().includes('built-in')) : true;
    setMirrored(front);
    try {
      const raw = localStorage.getItem('velvetsnap_device_settings');
      const s = raw ? JSON.parse(raw) : {};
      s.camera = camId;
      localStorage.setItem('velvetsnap_device_settings', JSON.stringify(s));
    } catch {}
  };

  const capture = useCallback(async () => {
    if (cameraType === 'dslr') {
      setDslrCapturing(true);
      try {
        const res = await fetch('/api/camera/capture', { method: 'POST' });
        const data = await res.json();
        if (data.success) onAddCapture(data.dataUrl);
        else alert('Gagal mengambil foto: ' + (data.error || 'Unknown error'));
      } catch (err: any) { alert('Gagal terhubung ke kamera: ' + err.message); }
      finally { setDslrCapturing(false); }
    } else {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        if (mirrored) flipImage(imageSrc).then(onAddCapture);
        else onAddCapture(imageSrc);
      }
    }
  }, [webcamRef, cameraType, mirrored, onAddCapture]);

  const handleManualCapture = async () => {
    if (filledCount >= slotsCount || busy) return;
    setBusy(true);
    let timer = 3;
    setCountdown(timer);
    await new Promise<void>((resolve) => {
      const iv = setInterval(() => {
        timer--;
        if (timer > 0) setCountdown(timer);
        else { clearInterval(iv); setCountdown(null); resolve(); }
      }, 1000);
    });
    setFlash(true);
    await new Promise((r) => setTimeout(r, 180));
    setFlash(false);
    await new Promise((r) => setTimeout(r, 80));
    await capture();
    await new Promise((r) => setTimeout(r, 400));
    setBusy(false);
  };

  const takePhoto = (remaining: number) => {
    if (remaining === 0) { setTaking(false); setBusy(false); return; }
    setBusy(true);
    let timer = 3;
    setCountdown(timer);
    const interval = setInterval(() => {
      timer -= 1;
      if (timer > 0) setCountdown(timer);
      else {
        clearInterval(interval); setCountdown(null);
        setFlash(true);
        setTimeout(() => {
          setFlash(false);
          setTimeout(() => {
            capture();
            setTimeout(() => takePhoto(remaining - 1), 1000);
          }, 80);
        }, 180);
      }
    }, 1000);
  };

  return (
    <div className={`${styles.stepPage} ${styles.stepPageBooth}`}>
      <StepperBar current={1} total={5} />
      <p className={styles.boothInfo}>{templateName} • {filledCount} / {slotsCount} shots</p>
      <div className={styles.boothContent}>
        <Viewfinder
          cameraType={cameraType}
          countdown={countdown}
          flash={flash}
          dslrCapturing={dslrCapturing}
          webcamRef={webcamRef}
          mirrored={mirrored}
          deviceId={deviceId}
          stripLoading={stripLoading}
        />
        <BoothPreview
          templateData={templateData}
          captures={captures}
          keyedFrameImage={keyedFrameImage}
          frameRatio={frameRatio}
          filledCount={filledCount}
          slotsCount={slotsCount}
          stripLoading={stripLoading}
          onAddCapture={onAddCapture}
          onDeleteCapture={onDeleteCapture}
          onNext={onNext}
        />
      </div>
      <BoothControls
        taking={taking}
        dslrCapturing={dslrCapturing}
        busy={busy}
        stripLoading={stripLoading}
        captureMode={captureMode}
        filledCount={filledCount}
        slotsCount={slotsCount}
        onBack={onBack}
        handleManualCapture={handleManualCapture}
        takePhoto={takePhoto}
        setCaptureMode={setCaptureMode}
        setTaking={setTaking}
        cameraType={cameraType}
        setShowCamMenu={setShowCamMenu}
        showCamMenu={showCamMenu}
        availableCams={availableCams}
        deviceId={deviceId}
        handleSwitchCamera={handleSwitchCamera}
        isFrontCamera={isFrontCamera}
        mirrored={mirrored}
        setMirrored={setMirrored}
        camMenuRef={camMenuRef}
      />
    </div>
  );
}
