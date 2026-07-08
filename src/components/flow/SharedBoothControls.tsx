// File: src/components/flow/SharedBoothControls.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { ArrowLeft, CameraIcon, RefreshCcw, FlipHorizontal, Loader2 } from 'lucide-react';

interface SharedBoothControlsProps {
  taking: boolean;
  dslrCapturing: boolean;
  busy: boolean;
  stripLoading: boolean;
  captureMode: 'auto' | 'manual';
  filledCount: number;
  slotsCount: number;
  onBack: () => void;
  handleManualCapture: () => void;
  takePhoto: (remaining: number) => void;
  setCaptureMode: (mode: 'auto' | 'manual') => void;
  setTaking: (v: boolean) => void;
  cameraType: 'webcam' | 'dslr';
  setShowCamMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showCamMenu: boolean;
  availableCams: MediaDeviceInfo[];
  deviceId: string | undefined;
  handleSwitchCamera: (camId: string) => void;
  isFrontCamera: boolean;
  mirrored: boolean;
  setMirrored: React.Dispatch<React.SetStateAction<boolean>>;
  camMenuRef: React.RefObject<HTMLDivElement | null>;
  styles: Record<string, string>;
}

// Booth controls show capture actions, mode toggles, and camera selection.
export default function SharedBoothControls({
  taking,
  dslrCapturing,
  busy,
  stripLoading,
  captureMode,
  filledCount,
  slotsCount,
  onBack,
  handleManualCapture,
  takePhoto,
  setCaptureMode,
  setTaking,
  cameraType,
  setShowCamMenu,
  showCamMenu,
  availableCams,
  deviceId,
  handleSwitchCamera,
  isFrontCamera,
  mirrored,
  setMirrored,
  camMenuRef,
  styles,
}: SharedBoothControlsProps) {
  return (
    <div className={styles.boothControls}>
      {!taking && !dslrCapturing && !busy && (
        <div className={styles.boothBtnRow}>
          <button className={styles.boothBtnSecondary} onClick={onBack} disabled={stripLoading}>
            <ArrowLeft size={16} /> Back
          </button>
          {captureMode === 'manual' ? (
            <button
              className={styles.boothBtnPrimary}
              onClick={handleManualCapture}
              disabled={filledCount >= slotsCount || busy || stripLoading}
            >
              {stripLoading ? <Loader2 className="spin" size={22} /> : <CameraIcon size={22} />} {filledCount}/{slotsCount}
            </button>
          ) : (
            <button
              className={styles.boothBtnPrimary}
              onClick={() => { setTaking(true); takePhoto(slotsCount - filledCount); }}
              disabled={filledCount >= slotsCount || busy || stripLoading}
            >
              {stripLoading ? <Loader2 className="spin" size={22} /> : <CameraIcon size={22} />} {filledCount}/{slotsCount}
            </button>
          )}
          <div className={styles.boothModeToggle}>
            <button
              className={`${styles.boothModeBtn} ${captureMode === 'manual' ? styles.boothModeActive : ''}`}
              onClick={() => setCaptureMode('manual')}
              disabled={stripLoading}
            >
              M
            </button>
            <button
              className={`${styles.boothModeBtn} ${captureMode === 'auto' ? styles.boothModeActive : ''}`}
              onClick={() => setCaptureMode('auto')}
              disabled={stripLoading}
            >
              A
            </button>
            <span
              className={styles.boothModeSlider}
              style={{ left: captureMode === 'manual' ? '2px' : '50%' }}
            />
          </div>
          {cameraType === 'webcam' && (
            // Only show webcam-specific camera switching controls when using a browser camera.
            <div ref={camMenuRef} className={styles.boothCamSwitcherGroup}>
              <div className={`${styles.boothCamDropdown} ${showCamMenu ? styles.boothCamDropdownOpen : ''}`}>
                {availableCams.length === 0 ? (
                  <div className={styles.boothCamOption} style={{ cursor: 'default', opacity: 0.5 }}>
                    No cameras found
                  </div>
                ) : (
                  availableCams.map((cam) => (
                    <button
                      key={cam.deviceId}
                      className={`${styles.boothCamOption} ${cam.deviceId === deviceId ? styles.boothCamOptionActive : ''}`}
                      onClick={() => handleSwitchCamera(cam.deviceId)}
                      disabled={stripLoading}
                    >
                      {cam.label || `Camera ${cam.deviceId.slice(0, 8)}...`}
                    </button>
                  ))
                )}
              </div>
              <button
                className={styles.boothBtnSecondary}
                onClick={() => setShowCamMenu((v) => !v)}
                disabled={stripLoading}
                title="Ganti kamera"
              >
                <RefreshCcw size={18} />
              </button>
              {isFrontCamera && (
                <button
                  className={`${styles.boothBtnSecondary} ${!mirrored ? styles.boothMirrorOff : ''}`}
                  onClick={() => setMirrored((v) => !v)}
                  disabled={stripLoading}
                  title={mirrored ? 'Mirror: ON' : 'Mirror: OFF'}
                >
                  <FlipHorizontal size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
