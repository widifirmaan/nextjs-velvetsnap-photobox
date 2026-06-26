'use client';
import dynamic from 'next/dynamic';
import { CameraIcon, RefreshCcw, FlipHorizontal, Check } from 'lucide-react';
import styles from '../../page.module.css';
import NewspaperSection from '../../homepage/NewspaperSection';
import { useBoothCapture } from '@/lib/useBoothCapture';
import { getAutoFormatUrl } from '@/lib/cloudinary-url';
import { TemplateData, type ISlot } from '@/app/main/types';

// @ts-ignore — react-webcam types incompatible with Next.js dynamic
const Webcam = dynamic(() => import('react-webcam'), { ssr: false }) as React.ComponentType<any>;

const LOREM = [
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
  'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.',
  'Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.',
];

export default function BoothStep({
  totalSlots, captures: initialCaptures, appName, templateData, keyedFrameImage, frameRatio, stripLoading,
  onCaptures, onNext,
}: {
  totalSlots: number;
  captures: string[];
  appName?: string;
  templateData: TemplateData | null;
  keyedFrameImage: string;
  frameRatio: number;
  stripLoading: boolean;
  onCaptures: (caps: string[]) => void;
  onNext?: () => void;
}) {
  const {
    webcamRef, fileRefs, captures, mirrored, setMirrored,
    captureMode, setCaptureMode,
    countdown, flash, busy,
    deviceId, availableCams, showCamMenu, setShowCamMenu, camMenuRef,
    isFrontCamera, handleSwitchCamera,
    handleCapture, handleUpload, isDone,
  } = useBoothCapture({ totalSlots, captures: initialCaptures, onCaptures });

  const slots = templateData?.templateData?.slotsLayout || [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <NewspaperSection>
        <div className={styles.boothNewspaperGrid}>
          {/* Column 1 — Lorem Ipsum Article */}
          <div className={styles.boothArticleCol}>
            <div className={styles.boothArticleHeadline}>
              PHOTO BOOTH SESSION
            </div>
            <div className={styles.boothByline}>By The {appName || 'VelvetSnap'} Times • Vol. II</div>
            {LOREM.map((p, i) => (
              <p key={i} className={styles.boothArticleText}>{p}</p>
            ))}
          </div>

          {/* Column 2 — Viewfinder + Capture */}
          <div className={styles.boothViewfinderCol}>
            <div className={styles.boothViewfinderBox}>
              {countdown !== null && (
                <div className={styles.countdown}>{countdown}</div>
              )}
              {flash && <div className={styles.boothFlash} />}
              {isDone ? (
                <img src={captures[captures.length - 1]} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: 'user', deviceId: deviceId ? { exact: deviceId } : undefined }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: mirrored ? 'scaleX(-1)' : 'none' }}
                />
              )}
              <div className={styles.boothViewfinderOverlay} />
            </div>

            <div className={styles.boothBtnRow}>
              <div ref={camMenuRef} style={{ position: 'relative' }}>
                <button className={styles.boothBtn} onClick={() => setShowCamMenu((v) => !v)}
                  disabled={busy || stripLoading} style={{ width: '100%' }}>
                  <RefreshCcw size={14} /> CAMERA
                </button>
                {showCamMenu && (
                  <div className={styles.boothCamDropdown}>
                    {availableCams.map((cam) => (
                      <button key={cam.deviceId}
                        className={`${styles.boothCamOption} ${cam.deviceId === deviceId ? styles.boothCamOptionActive : ''}`}
                        onClick={() => handleSwitchCamera(cam.deviceId)}>
                        {cam.label || `Camera ${cam.deviceId.slice(0, 8)}...`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.boothModeToggle}>
                <button className={`${styles.boothModeBtn} ${captureMode === 'manual' ? styles.boothModeBtnActive : ''}`}
                  onClick={() => setCaptureMode('manual')} disabled={stripLoading}>M</button>
                <button className={`${styles.boothModeBtn} ${captureMode === 'auto' ? styles.boothModeBtnActive : ''}`}
                  onClick={() => setCaptureMode('auto')} disabled={stripLoading}>A</button>
              </div>
              <button className={`${styles.boothBtn} ${styles.boothBtnPrimary}`}
                onClick={handleCapture} disabled={busy || isDone || stripLoading}>
                <CameraIcon size={16} />
                {busy ? `${countdown || ''}` : `CAPTURE ${captures.length + 1}/${totalSlots}`}
              </button>
              {isFrontCamera && (
                <button className={styles.boothBtn} onClick={() => setMirrored((v) => !v)} disabled={stripLoading}>
                  <FlipHorizontal size={14} /> {mirrored ? 'MIRROR' : 'FLIP'}
                </button>
              )}
            </div>

          </div>

          {/* Column 3 — Strip Preview (merged 2 rows) */}
          <div className={styles.boothStripCol}>
            {slots.length > 0 ? (
              <div className={styles.boothStripPreview} style={{ aspectRatio: frameRatio || 1 / 3 }}>
                {slots.map((slot: ISlot, idx: number) => {
                  const src = captures[idx];
                  return (
                    <div key={idx} style={{
                      position: 'absolute', left: `${slot.x}%`, top: `${slot.y}%`,
                      width: `${slot.w}%`, height: `${slot.h}%`, overflow: 'hidden',
                      background: src ? 'none' : 'rgba(0,0,0,0.03)',
                    }}>
                      {src ? (
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      ) : (
                      <button className={styles.boothSlotUpload} onClick={() => fileRefs.current[idx]?.click()}
                        style={{ width: '100%', height: '100%', flexDirection: 'column', gap: 2 }} disabled={stripLoading}>
                        <span style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>+</span>
                        <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>UPLOAD</span>
                        <input ref={(el) => { fileRefs.current[idx] = el; }}
                          type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={(e) => handleUpload(idx, e)} />
                      </button>
                      )}
                    </div>
                  );
                })}
                {keyedFrameImage && (
                  <img src={getAutoFormatUrl(keyedFrameImage)} alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
                )}
              </div>
              ) : (
                <div className={styles.boothStripPlaceholder}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--np-text-muted)' }}>
                    No Template Selected
                  </div>
                </div>
              )}
              {isDone && onNext && (
                <button className={`${styles.boothBtn} ${styles.boothBtnPrimary}`}
                  onClick={onNext} style={{ marginTop: 12, width: '100%' }}>
                  <Check size={16} /> EDIT PHOTO
                </button>
              )}
            </div>
        </div>
      </NewspaperSection>

      <div className={styles.newspaperFooter}>
        <div className={styles.mastheadMeta}>
          <span>Powered by {appName || 'VelvetSnap'}</span>
          <span>{captures.length} / {totalSlots} shots</span>
        </div>
      </div>
    </div>
  );
}
