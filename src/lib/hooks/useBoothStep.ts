// File: src/lib/hooks/useBoothStep.ts
// Description: Auto-added top comment for easier file identification.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCameraDevices, useCountdown } from '@/lib/hooks';

export function useBoothStep(
  onAddCapture: (url: string, slotIdx?: number) => void,
  filledCount: number,
  slotsCount: number,
) {
  const webcamRef = useRef<any>(null);
  const [taking, setTaking] = useState(false);
  const [captureMode, setCaptureMode] = useState<'auto' | 'manual'>('manual');
  const [dslrCapturing, setDslrCapturing] = useState(false);
  const [mirrored, setMirrored] = useState(true);

  const {
    deviceId,
    cameraType,
    setCameraType: _setCameraType,
    availableCams,
    showCamMenu,
    setShowCamMenu,
    camMenuRef,
    isFrontCamera,
    handleSwitchCamera,
  } = useCameraDevices();

  const { countdown, flash, busy, runCountdown, runBatchCountdown } = useCountdown();

  useEffect(() => {
    setMirrored(isFrontCamera);
  }, [isFrontCamera]);

  const capture = useCallback(async () => {
    if (cameraType === 'dslr') {
      setDslrCapturing(true);
      try {
        const response = await fetch('/api/camera/capture', { method: 'POST' });
        const data = await response.json();
        if (data.success) onAddCapture(data.dataUrl);
        else window.alert('Gagal mengambil foto: ' + (data.error || 'Unknown error'));
      } catch (error: unknown) {
        window.alert('Gagal terhubung ke kamera: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setDslrCapturing(false);
      }
    } else {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        if (mirrored) {
          const { flipImageHorizontal } = await import('@/lib/utils/image-utils');
          flipImageHorizontal(imageSrc).then(onAddCapture);
        } else {
          onAddCapture(imageSrc);
        }
      }
    }
  }, [cameraType, mirrored, onAddCapture]);

  const handleManualCapture = useCallback(async () => {
    if (filledCount >= slotsCount || busy) return;
    await runCountdown(capture);
  }, [filledCount, slotsCount, busy, runCountdown, capture]);

  const takePhoto = useCallback(
    (remaining: number) => {
      if (remaining === 0) {
        setTaking(false);
        return;
      }
      setTaking(true);
      runBatchCountdown(remaining, capture).finally(() => setTaking(false));
    },
    [runBatchCountdown, capture]
  );

  return {
    webcamRef,
    taking,
    setTaking,
    captureMode,
    setCaptureMode,
    dslrCapturing,
    countdown,
    flash,
    busy,
    availableCams,
    showCamMenu,
    setShowCamMenu,
    cameraType,
    deviceId,
    camMenuRef,
    isFrontCamera,
    handleSwitchCamera,
    mirrored,
    setMirrored,
    handleManualCapture,
    takePhoto,
  } as const;
}
