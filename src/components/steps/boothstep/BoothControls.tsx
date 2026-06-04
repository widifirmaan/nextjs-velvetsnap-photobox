'use client';

import { ArrowLeft, Camera as CameraIcon, RefreshCcw, FlipHorizontal } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function BoothControls({
  captureMode, setCaptureMode, filledCount, slotsCount, busy,
  handleManualCapture, takePhoto, cameraType, camMenuRef, showCamMenu,
  availableCams, deviceId, handleSwitchCamera, isFrontCamera, mirrored, setMirrored,
  onBack, taking, dslrCapturing,
}: {
  captureMode: string; setCaptureMode: (v: 'auto' | 'manual') => void;
  filledCount: number; slotsCount: number; busy: boolean;
  handleManualCapture: () => void; takePhoto: (n: number) => void;
  cameraType: string; camMenuRef: React.RefObject<HTMLDivElement>;
  showCamMenu: boolean; availableCams: MediaDeviceInfo[];
  deviceId: string | undefined; handleSwitchCamera: (id: string) => void;
  isFrontCamera: boolean; mirrored: boolean; setMirrored: (v: boolean | ((p: boolean) => boolean)) => void;
  onBack: () => void; taking: boolean; dslrCapturing: boolean;
}) {
  if (taking || dslrCapturing || busy) return null;

  return (
    <div className={styles.boothControls}>
      <div className={styles.boothBtnRow}>
        <button className={styles.boothBtnSecondary} onClick={onBack}><ArrowLeft size={16} /> Back</button>
        {captureMode === 'manual' ? (
          <button className={styles.boothBtnPrimary} onClick={handleManualCapture} disabled={filledCount >= slotsCount || busy}>
            <CameraIcon size={22} /> {filledCount}/{slotsCount}
          </button>
        ) : (
          <button className={styles.boothBtnPrimary} onClick={() => { takePhoto(slotsCount - filledCount); }} disabled={filledCount >= slotsCount || busy}>
            <CameraIcon size={22} /> {filledCount}/{slotsCount}
          </button>
        )}
        <div className={styles.boothModeToggle}>
          <button className={`${styles.boothModeBtn} ${captureMode === 'manual' ? styles.boothModeActive : ''}`}
            onClick={() => setCaptureMode('manual')}>M</button>
          <button className={`${styles.boothModeBtn} ${captureMode === 'auto' ? styles.boothModeActive : ''}`}
            onClick={() => setCaptureMode('auto')}>A</button>
          <span className={styles.boothModeSlider} style={{ left: captureMode === 'manual' ? '2px' : '50%' }} />
        </div>
        {cameraType === 'webcam' && (
          <div ref={camMenuRef} className={styles.boothCamSwitcherGroup}>
            <div className={`${styles.boothCamDropdown} ${showCamMenu ? styles.boothCamDropdownOpen : ''}`}>
              {availableCams.length === 0 ? (
                <div className={styles.boothCamOption} style={{ cursor: 'default', opacity: 0.5 }}>No cameras found</div>
              ) : (
                availableCams.map((cam) => (
                  <button key={cam.deviceId}
                    className={`${styles.boothCamOption} ${cam.deviceId === deviceId ? styles.boothCamOptionActive : ''}`}
                    onClick={() => handleSwitchCamera(cam.deviceId)}>{cam.label || `Camera ${cam.deviceId.slice(0, 8)}...`}</button>
                ))
              )}
            </div>
            <button className={styles.boothBtnSecondary} onClick={() => setShowCamMenu((v) => !v)} title="Ganti kamera">
              <RefreshCcw size={18} />
            </button>
            {isFrontCamera && (
              <button className={`${styles.boothBtnSecondary} ${!mirrored ? styles.boothMirrorOff : ''}`}
                onClick={() => setMirrored((v) => !v)} title={mirrored ? 'Mirror: ON' : 'Mirror: OFF'}>
                <FlipHorizontal size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
