'use client';
import styles from '../../page.module.css';

export default function BoothPreview({ stream, captures, countdown, shotCount, totalSlots }: {
  stream: MediaStream | null; captures: string[];
  countdown: number | null; shotCount: number; totalSlots: number;
}) {
  return (
    <div className={styles.boothPreview}>
      {countdown !== null && (
        <div className={styles.countdown}>{countdown}</div>
      )}
      {captures.length > 0 && shotCount >= totalSlots ? (
        <img src={captures[captures.length - 1]} alt="Last shot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : stream ? (
        <video autoPlay playsInline muted ref={(ref) => { if (ref) ref.srcObject = stream; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', color: '#666' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>CAMERA OFFLINE</span>
        </div>
      )}
      <div className={styles.boothOverlay} />
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-body)', fontSize: 9, color: 'rgba(255,255,255,0.6)',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        background: 'rgba(0,0,0,0.5)', padding: '2px 8px',
      }}>
        {captures.length} / {totalSlots} SHOTS
      </div>
    </div>
  );
}
