'use client';

import { CameraIcon, Loader2 } from 'lucide-react';
import Webcam from 'react-webcam';
import styles from '@/app/v1/page.module.css';

export default function Viewfinder({
  cameraType, countdown, flash, dslrCapturing, webcamRef, mirrored, deviceId,
  stripLoading,
}: {
  cameraType: 'webcam' | 'dslr';
  countdown: number | null;
  flash: boolean;
  dslrCapturing: boolean;
  webcamRef: React.RefObject<Webcam | null>;
  mirrored: boolean;
  deviceId: string | undefined;
  stripLoading: boolean;
}) {
  return (
    <div className={styles.boothViewfinder}>
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
