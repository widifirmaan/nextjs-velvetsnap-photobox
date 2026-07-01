'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { flipImage } from '@/lib/canvas-utils';
import { useCameraDevices, useCountdown } from '@/lib/hooks';
import styles from '../../page.module.css';
import { TemplateData } from '../../types';
import BoothPreview from './BoothPreview';
import BoothControls from './BoothControls';

const Viewfinder = dynamic(() => import('./Viewfinder'), { ssr: false });

export default function BoothStep({
  templateName, slotsCount, filledCount, captures,
  onAddCapture, onDeleteCapture, templateData, keyedFrameImage, frameRatio,
  stripLoading, onNext, onBack,
}: {
  templateName: string; slotsCount: number; filledCount: number; captures: string[];
  onAddCapture: (url: string, slotIdx?: number) => void; onDeleteCapture: (idx: number) => void;
  templateData: TemplateData | null; keyedFrameImage: string; frameRatio: number;
  stripLoading: boolean; onNext: () => void; onBack: () => void;
}) {
  const webcamRef = useRef<any>(null);
  const [taking, setTaking] = useState(false);
  const [captureMode, setCaptureMode] = useState<'auto' | 'manual'>('manual');
  const [dslrCapturing, setDslrCapturing] = useState(false);

  const {
    deviceId, cameraType, setCameraType: _setCameraType,
    availableCams, showCamMenu, setShowCamMenu, camMenuRef,
    isFrontCamera, handleSwitchCamera,
  } = useCameraDevices();

  const { countdown, flash, busy, runCountdown, runBatchCountdown } = useCountdown();
  const [mirrored, setMirrored] = useState(true);

  useEffect(() => {
    setMirrored(isFrontCamera);
  }, [isFrontCamera]);

  const capture = useCallback(async () => {
    if (cameraType === 'dslr') {
      setDslrCapturing(true);
      try {
        const res = await fetch('/api/camera/capture', { method: 'POST' });
        const data = await res.json();
        if (data.success) onAddCapture(data.dataUrl);
        else alert('Gagal mengambil foto: ' + (data.error || 'Unknown error'));
      } catch (err: unknown) { alert('Gagal terhubung ke kamera: ' + (err instanceof Error ? err.message : 'Unknown error')); }
      finally { setDslrCapturing(false); }
    } else {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        if (mirrored) flipImage(imageSrc).then((url) => onAddCapture(url));
        else onAddCapture(imageSrc);
      }
    }
  }, [webcamRef, cameraType, mirrored, onAddCapture]);

  const handleManualCapture = useCallback(async () => {
    if (filledCount >= slotsCount || busy) return;
    await runCountdown(capture);
  }, [filledCount, slotsCount, busy, runCountdown, capture]);

  const takePhoto = useCallback((remaining: number) => {
    if (remaining === 0) { setTaking(false); return; }
    setTaking(true);
    runBatchCountdown(remaining, capture).finally(() => setTaking(false));
  }, [runBatchCountdown, capture]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
      <div style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative', display: 'flex', justifyContent: 'center' }}>
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
            templateName={templateName}
            filledCount={filledCount}
            slotsCount={slotsCount}
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
        <div className={styles.boothNewsColLeft}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, margin: 0, borderBottom: '1px solid var(--np-border)', paddingBottom: 4, color: 'var(--np-text)' }}>Booth</h1>
          <div className={styles.boothNewsColTitle}>The Gazette</div>
          <div className={styles.boothNewsColText}>VelvetSnap unveils new vintage-inspired frames for the holiday season. Early reviews praise the warm sepia tones.</div>
          <div className={styles.boothNewsColText}>Photobooth attendance up 34% this quarter as visitors rediscover analog charm in a digital age.</div>
        </div>
        <div className={styles.boothNewsColRight}>
          <div className={styles.boothNewsColTitle}>Editorial</div>
          <div className={styles.boothNewsColText}>Why photobooths matter: In an age of disappearing digital media, the printed photo strip remains a tangible keepsake.</div>
          <div className={styles.boothNewsColText}>Tips &mdash; Position yourself center-frame for best results. Natural light recommended.</div>
        </div>
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
      <div className={styles.newspaperFooter} style={{ width: '100%' }}>
        <div className={styles.mastheadMeta}>
          <span>VelvetSnap Photobooth</span>
        </div>
      </div>
    </div>
  );
}
