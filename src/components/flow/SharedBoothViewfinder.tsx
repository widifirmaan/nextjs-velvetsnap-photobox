// File: src/components/flow/SharedBoothViewfinder.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { CameraIcon, Loader2 } from 'lucide-react';
import Webcam from 'react-webcam';
import type { RefObject } from 'react';

const infoStyle: React.CSSProperties = {
  position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
  zIndex: 15, color: '#fff', fontSize: 13, fontFamily: 'var(--font-body)',
  background: 'rgba(0,0,0,0.55)', padding: '4px 12px', borderRadius: 2,
  whiteSpace: 'nowrap', pointerEvents: 'none', textTransform: 'uppercase',
  letterSpacing: '0.04em', fontWeight: 600,
};

interface SharedBoothViewfinderProps {
  cameraType: 'webcam' | 'dslr';
  countdown: number | null;
  flash: boolean;
  dslrCapturing: boolean;
  webcamRef: RefObject<Webcam | null>;
  mirrored: boolean;
  deviceId: string | undefined;
  stripLoading: boolean;
  infoLine?: string;
  styles: Record<string, string>;
}

// Shared viewfinder displays either a live webcam stream or a DSLR placeholder.
export default function SharedBoothViewfinder({
  cameraType,
  countdown,
  flash,
  dslrCapturing,
  webcamRef,
  mirrored,
  deviceId,
  stripLoading,
  infoLine,
  styles,
}: SharedBoothViewfinderProps) {
  return (
    <div className={styles.boothViewfinder}>
      {infoLine ? <div style={infoStyle}>{infoLine}</div> : null}
      {stripLoading && (
        <div className={styles.boothCountdown}>
          <span style={{ fontSize: 18, fontWeight: 500 }}>Menyiapkan kamera...</span>
        </div>
      )}
      {cameraType === 'dslr' ? (
        // DSLR mode displays an external camera placeholder and capture countdown state.
        <div className={styles.boothDslrPlaceholder}>
          <CameraIcon size={64} style={{ opacity: 0.5 }} />
          <p>Kamera DSLR terhubung via USB</p>
          {countdown !== null && <div className={styles.boothCountdown}>{countdown}</div>}
          {dslrCapturing && <div className={styles.boothCountdown}><Loader2 className="spin" size={48} /></div>}
          {flash && <div className={styles.boothFlash} />}
        </div>
      ) : (
        <div className={styles.boothWebcamWrap}>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: 'user', deviceId: deviceId ? { exact: deviceId } : undefined }}
            className={styles.boothWebcam} style={{ transform: mirrored ? 'scaleX(-1)' : 'none' }}
          />
          <div className={styles.boothViewfinderOverlay}>
            <div className={styles.viewfinderCornerTL} />
            <div className={styles.viewfinderCornerTR} />
            <div className={styles.viewfinderCornerBL} />
            <div className={styles.viewfinderCornerBR} />
          </div>
          {flash && <div className={styles.boothFlash} />}
          {countdown !== null && <div className={styles.boothCountdown}>{countdown}</div>}
        </div>
      )}
    </div>
  );
}
