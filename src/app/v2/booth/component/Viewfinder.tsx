'use client';
import { CameraIcon, Loader2 } from 'lucide-react';
import Webcam from 'react-webcam';
import styles from '../../page.module.css';

const infoStyle: React.CSSProperties = {
  position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
  zIndex: 15, color: '#fff', fontSize: 13, fontFamily: 'var(--font-body)',
  background: 'rgba(0,0,0,0.55)', padding: '4px 12px', borderRadius: 2,
  whiteSpace: 'nowrap', pointerEvents: 'none', textTransform: 'uppercase',
  letterSpacing: '0.04em', fontWeight: 600,
};

export default function Viewfinder({
  cameraType, countdown, flash, dslrCapturing, webcamRef, mirrored, deviceId,
  stripLoading, templateName, filledCount, slotsCount,
}: {
  cameraType: 'webcam' | 'dslr';
  countdown: number | null;
  flash: boolean;
  dslrCapturing: boolean;
  webcamRef: React.RefObject<any>;
  mirrored: boolean;
  deviceId: string | undefined;
  stripLoading: boolean;
  templateName: string; filledCount: number; slotsCount: number;
}) {
  return (
    <div className={styles.boothViewfinder}>
      <div style={infoStyle}>{templateName} • {filledCount}/{slotsCount} shots</div>
      {stripLoading && (
        <div className={styles.boothCountdown}>
          <span style={{ fontSize: 18, fontWeight: 500 }}>Menyiapkan kamera...</span>
        </div>
      )}
      {cameraType === 'dslr' ? (
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
            videoConstraints={{ facingMode: "user", deviceId: deviceId ? { exact: deviceId } : undefined }}
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
