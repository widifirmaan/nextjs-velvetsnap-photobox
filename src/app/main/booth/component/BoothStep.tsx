'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { flipImage } from '@/lib/canvas-utils';
import { useCameraDevices, useCountdown } from '@/lib/hooks';
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
  const [taking, setTaking] = useState(false);
  const [captureMode, setCaptureMode] = useState<'auto' | 'manual'>('manual');
  const [dslrCapturing, setDslrCapturing] = useState(false);

  const {
    deviceId, cameraType, setCameraType,
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
