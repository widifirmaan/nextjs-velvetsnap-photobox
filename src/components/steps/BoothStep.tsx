'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Camera as CameraIcon, ArrowLeft, Check, RefreshCcw, Loader2, X, FlipHorizontal } from 'lucide-react';
import styles from '@/app/page.module.css';
import StepperBar from './StepperBar';
import { flipImage, type ISlot } from '@/lib/canvas-utils';
import Webcam from 'react-webcam';
import type { TemplateData } from './types';

export default function BoothStep({
  templateId, templateName, slotsCount, filledCount, captures,
  onAddCapture, onDeleteCapture, templateData, keyedFrameImage, frameRatio,
  onNext, onBack,
}: {
  templateId: string; templateName: string; slotsCount: number; filledCount: number; captures: string[];
  onAddCapture: (url: string) => void; onDeleteCapture: (idx: number) => void;
  templateData: TemplateData | null; keyedFrameImage: string; frameRatio: number;
  onNext: () => void; onBack: () => void;
}) {
  const webcamRef = useRef<Webcam>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [taking, setTaking] = useState(false);
  const [flash, setFlash] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mirrored, setMirrored] = useState(false);
  const [captureMode, setCaptureMode] = useState<'auto' | 'manual'>('manual');
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [cameraType, setCameraType] = useState<'webcam' | 'dslr'>('webcam');
  const [availableCams, setAvailableCams] = useState<MediaDeviceInfo[]>([]);
  const [showCamMenu, setShowCamMenu] = useState(false);
  const camMenuRef = useRef<HTMLDivElement>(null);
  const [dslrCapturing, setDslrCapturing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('velvetsnap_device_settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.cameraType === 'dslr') setCameraType('dslr');
        if (s.camera) setDeviceId(s.camera);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (cameraType !== 'webcam') return;
    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d) => d.kind === 'videoinput');
        const sorted = [...cams].sort((a, b) => {
          const score = (l: string) => {
            const lower = l.toLowerCase();
            if (lower.includes('front') || lower.includes('facetime') || lower.includes('built-in')) return 0;
            if (lower.includes('back') || lower.includes('rear')) return 1;
            return 2;
          };
          return score(a.label) - score(b.label);
        });
        setAvailableCams(sorted);
      } catch {}
    })();
  }, [cameraType]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (camMenuRef.current && !camMenuRef.current.contains(e.target as Node)) setShowCamMenu(false);
    };
    if (showCamMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCamMenu]);

  const isFrontCamera = useMemo(() => {
    if (!deviceId || !availableCams.length) return true;
    const cam = availableCams.find((c) => c.deviceId === deviceId);
    if (!cam) return true;
    const label = cam.label.toLowerCase();
    return label.includes('front') || label.includes('facetime') || label.includes('built-in');
  }, [deviceId, availableCams]);

  useEffect(() => {
    setMirrored(isFrontCamera);
  }, [isFrontCamera]);

  const handleSwitchCamera = (camId: string) => {
    setDeviceId(camId); setShowCamMenu(false);
    const cam = availableCams.find((c) => c.deviceId === camId);
    const front = cam ? (cam.label.toLowerCase().includes('front') || cam.label.toLowerCase().includes('facetime') || cam.label.toLowerCase().includes('built-in')) : true;
    setMirrored(front);
    try {
      const raw = localStorage.getItem('velvetsnap_device_settings');
      const s = raw ? JSON.parse(raw) : {};
      s.camera = camId;
      localStorage.setItem('velvetsnap_device_settings', JSON.stringify(s));
    } catch {}
  };

  const capture = useCallback(async () => {
    if (cameraType === 'dslr') {
      setDslrCapturing(true);
      try {
        const res = await fetch('/api/camera/capture', { method: 'POST' });
        const data = await res.json();
        if (data.success) onAddCapture(data.dataUrl);
        else alert('Gagal mengambil foto: ' + (data.error || 'Unknown error'));
      } catch (err: any) { alert('Gagal terhubung ke kamera: ' + err.message); }
      finally { setDslrCapturing(false); }
    } else {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        if (mirrored) flipImage(imageSrc).then(onAddCapture);
        else onAddCapture(imageSrc);
      }
    }
  }, [webcamRef, cameraType, mirrored, onAddCapture]);

  const handleManualCapture = async () => {
    if (filledCount >= slotsCount || busy) return;
    setBusy(true);
    let timer = 3;
    setCountdown(timer);
    await new Promise<void>((resolve) => {
      const iv = setInterval(() => {
        timer--;
        if (timer > 0) setCountdown(timer);
        else { clearInterval(iv); setCountdown(null); resolve(); }
      }, 1000);
    });
    setFlash(true);
    await new Promise((r) => setTimeout(r, 180));
    setFlash(false);
    await new Promise((r) => setTimeout(r, 80));
    await capture();
    await new Promise((r) => setTimeout(r, 400));
    setBusy(false);
  };

  const takePhoto = (remaining: number) => {
    if (remaining === 0) { setTaking(false); setBusy(false); return; }
    setBusy(true);
    let timer = 3;
    setCountdown(timer);
    const interval = setInterval(() => {
      timer -= 1;
      if (timer > 0) setCountdown(timer);
      else {
        clearInterval(interval); setCountdown(null);
        setFlash(true);
        setTimeout(() => {
          setFlash(false);
          setTimeout(() => {
            capture();
            setTimeout(() => takePhoto(remaining - 1), 1000);
          }, 80);
        }, 180);
      }
    }, 1000);
  };

  return (
    <div className={`${styles.stepPage} ${styles.stepPageBooth}`}>
      <StepperBar current={1} total={5} />
      <p className={styles.boothInfo}>{templateName} • {filledCount} / {slotsCount} shots</p>
      <div className={styles.boothContent}>
        <div className={styles.boothViewfinder}>
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

        {templateData?.slotsLayout && (
          <div className={styles.boothPreview}>
            <div className={styles.boothStripPreview} style={{ aspectRatio: frameRatio }}>
              {templateData.slotsLayout.map((slot: ISlot, idx: number) => {
                const src = captures[idx];
                return (
                  <div key={idx} style={{
                    position: 'absolute', left: `${slot.x}%`, top: `${slot.y}%`,
                    width: `${slot.w}%`, height: `${slot.h}%`, overflow: 'hidden',
                    background: src ? 'none' : 'rgba(0,0,0,0.06)', borderRadius: '2px',
                  }}>
                    {src && (
                      <>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <button className={styles.boothDeleteSlot} onClick={() => onDeleteCapture(idx)}><X size={14} /></button>
                      </>
                    )}
                  </div>
                );
              })}
              <img src={keyedFrameImage || templateData.frameImage || ''} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
            </div>
            {filledCount === slotsCount && (
              <button className={styles.boothProceedBtn} onClick={onNext}><Check size={16} /> Edit</button>
            )}
          </div>
        )}
      </div>

      <div className={styles.boothControls}>
        {!taking && !dslrCapturing && !busy && (
          <div className={styles.boothBtnRow}>
              <button className={styles.boothBtnSecondary} onClick={onBack}><ArrowLeft size={16} /> Back</button>
              {captureMode === 'manual' ? (
                <button className={styles.boothBtnPrimary} onClick={handleManualCapture} disabled={filledCount >= slotsCount || busy}>
                  <CameraIcon size={22} /> {filledCount}/{slotsCount}
                </button>
              ) : (
                <button className={styles.boothBtnPrimary} onClick={() => { setTaking(true); takePhoto(slotsCount - filledCount); }} disabled={filledCount >= slotsCount || busy}>
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
          )}
      </div>
    </div>
  );
}
