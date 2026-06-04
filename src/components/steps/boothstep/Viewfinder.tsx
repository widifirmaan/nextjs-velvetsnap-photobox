'use client';

import { Camera as CameraIcon, Loader2 } from 'lucide-react';
import styles from '@/app/page.module.css';
import Webcam from 'react-webcam';

export default function Viewfinder({
  cameraType, webcamRef, deviceId, mirrored, dslrCapturing, flash, countdown,
}: {
  cameraType: string; webcamRef: React.RefObject<Webcam | null>; deviceId: string | undefined;
  mirrored: boolean; dslrCapturing: boolean; flash: boolean; countdown: number | null;
}) {
  if (cameraType === 'dslr') {
    return (
      <div className={styles.boothDslrPlaceholder}>
        <CameraIcon size={64} style={{ opacity: 0.5 }} />
        <p>Kamera DSLR terhubung via USB</p>
        {countdown !== null && <div className={styles.boothCountdown}>{countdown}</div>}
        {dslrCapturing && <div className={styles.boothCountdown}><Loader2 className="spin" size={48} /></div>}
        {flash && <div className={styles.boothFlash} />}
      </div>
    );
  }

  return (
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
  );
}
