// File: src/app/(themes)/v2/booth/component/BoothStep.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { flipImage } from '@/lib/utils/canvas-utils';
import { captureDslrPhoto } from '@/lib/utils/image-utils';
import { useCameraDevices, useCountdown } from '@/lib/hooks';
import styles from '../../page.module.css';
import { TemplateData } from '../../types';
import SharedBoothPreview from '@/components/flow/SharedBoothPreview';
import SharedBoothControls from '@/components/flow/SharedBoothControls';

const Viewfinder = dynamic(() => import('@/components/flow/SharedBoothViewfinder'), { ssr: false });

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
        const dataUrl = await captureDslrPhoto();
        onAddCapture(dataUrl);
      } catch (err: unknown) { alert('Gagal mengambil foto: ' + (err instanceof Error ? err.message : 'Unknown error')); }
      finally { setDslrCapturing(false); }
    } else {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        if (mirrored) await flipImage(imageSrc).then((url) => onAddCapture(url));
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
    <div className={styles.boothStage}>
      <Viewfinder
        cameraType={cameraType}
        countdown={countdown}
        flash={flash}
        dslrCapturing={dslrCapturing}
        webcamRef={webcamRef}
        mirrored={mirrored}
        deviceId={deviceId}
        stripLoading={stripLoading}
        styles={styles}
        infoLine={`${templateName} • ${filledCount}/${slotsCount} shots`}
      />
      <SharedBoothPreview
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
        styles={styles}
      />
      <SharedBoothControls
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
        styles={styles}
      />
    </div>
  );
}
