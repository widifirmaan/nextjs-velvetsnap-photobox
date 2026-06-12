'use client';

import { Suspense, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Webcam from 'react-webcam';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera as CameraIcon, RefreshCcw, Check, Loader2, ArrowLeft, Monitor, RotateCcw, X } from 'lucide-react';
import styles from './page.module.css';

interface ISlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TemplateData {
  templateId: string;
  templateName: string;
  templateDesc: string;
  templatePrice: number;
  templateFull?: string;
  templateThumb?: string;
  templateData: {
    slots: number;
    color: string;
    slotsLayout?: ISlot[];
    canvasWidth?: number;
    canvasHeight?: number;
    type?: string;
    elements?: any[];
  };
}

function flipImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      ctx.scale(-1, 1);
      ctx.drawImage(img, -canvas.width, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function composeFrameImage(
  frameImageBase64: string,
  slots: ISlot[],
  captures: string[],
  adjust: { scale: number; x: number; y: number }[],
  color: string,
  width: number = 960,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const frameImg = new window.Image();
    frameImg.crossOrigin = 'anonymous';
    frameImg.onload = async () => {
      try {
        const ar = frameImg.naturalWidth / frameImg.naturalHeight;
        const cw = width;
        const ch = Math.round(width / ar);
        const canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('No context')); return; }

        ctx.fillStyle = color || '#ffffff';
        ctx.fillRect(0, 0, cw, ch);

        for (let idx = 0; idx < slots.length; idx++) {
          const slot = slots[idx];
          const src = captures[idx];
          if (!src) continue;

          const sx = (slot.x / 100) * cw;
          const sy = (slot.y / 100) * ch;
          const sw = (slot.w / 100) * cw;
          const sh = (slot.h / 100) * ch;

          const photo = await new Promise<HTMLImageElement>((res, rej) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => res(img);
            img.onerror = () => rej(new Error('Photo load failed'));
            img.src = src;
          });

          ctx.save();
          ctx.beginPath();
          ctx.rect(sx, sy, sw, sh);
          ctx.clip();

          const adj = adjust[idx] || { scale: 1, x: 0, y: 0 };
          const ia = photo.naturalWidth / photo.naturalHeight;
          const sa = sw / sh;
          let dw = sw, dh = sh, dx = sx, dy = sy;
          if (ia > sa) {
            dh = sh;
            dw = sh * ia;
            dx = sx - (dw - sw) / 2;
            dy = sy;
          } else {
            dw = sw;
            dh = sw / ia;
            dx = sx;
            dy = sy - (dh - sh) / 2;
          }

          const sc = adj.scale || 1;
          const cx2 = dx + dw / 2;
          const cy2 = dy + dh / 2;
          dw *= sc; dh *= sc;
          dx = cx2 - dw / 2;
          dy = cy2 - dh / 2;
          dx += (adj.x || 0) / 100 * sw;
          dy += (adj.y || 0) / 100 * sh;

          ctx.drawImage(photo, dx, dy, dw, dh);
          ctx.restore();
        }

        ctx.drawImage(frameImg, 0, 0, cw, ch);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (err) {
        reject(err);
      }
    };
    frameImg.onerror = () => reject(new Error('Failed to load frame'));
    frameImg.src = frameImageBase64;
  });
}

function removeGreenScreen(base64: string): Promise<string> {
  return new Promise((resolve) => {
    if (!base64) { resolve(''); return; }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_W = 1000;
      const scale = MAX_W / (img.naturalWidth || img.width);
      canvas.width = MAX_W;
      canvas.height = Math.round((img.naturalHeight || img.height) * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(base64); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      let imgData;
      try { imgData = ctx.getImageData(0, 0, canvas.width, canvas.height); }
      catch { resolve(base64); return; }
      const d = imgData.data;
      const targetR = 0, targetG = 191, targetB = 99;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const dr = r - targetR, dg = g - targetG, db = b - targetB;
        if (dr * dr + dg * dg + db * db < 1600) { d[i + 3] = 0; }
      }
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

const TEMPLATE_CONFIGS: Record<string, { name: string; slots: number }> = {
  t1: { name: 'Classic Strips', slots: 3 },
  t2: { name: 'Retro Film', slots: 4 },
  t3: { name: 'Newspaper', slots: 1 }
};

function BoothContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template') || 't1';
  
  const webcamRef = useRef<Webcam>(null);
  const [captures, setCaptures] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [taking, setTaking] = useState(false);
  const [mirrored, setMirrored] = useState(true);
  const [captureMode, setCaptureMode] = useState<'auto' | 'manual'>('manual');
  
  const [step, setStep] = useState<'camera' | 'editor'>('camera');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [photoAdjust, setPhotoAdjust] = useState<{ scale: number; x: number; y: number }[]>([]);
  const [panSlot, setPanSlot] = useState<number | null>(null);
  const [panStart, setPanStart] = useState<{ mx: number; my: number; ox: number; oy: number } | null>(null);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [cameraType, setCameraType] = useState<'webcam' | 'dslr'>('webcam');
  const [availableCams, setAvailableCams] = useState<MediaDeviceInfo[]>([]);
  const [showCamMenu, setShowCamMenu] = useState(false);
  const camMenuRef = useRef<HTMLDivElement>(null);

  const [slotsCount, setSlotsCount] = useState<number>(3);
  const [templateName, setTemplateName] = useState<string>('Classic Strips');
  const [dbTemplate, setDbTemplate] = useState<TemplateData | null>(null);
  const [keyedFrameImage, setKeyedFrameImage] = useState<string>('');
  const [frameRatio, setFrameRatio] = useState<number>(2 / 3);

  const filledCount = useMemo(() => captures.filter((c) => c !== '').length, [captures]);

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
      if (camMenuRef.current && !camMenuRef.current.contains(e.target as Node)) {
        setShowCamMenu(false);
      }
    };
    if (showCamMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCamMenu]);

  const handleSwitchCamera = (camId: string) => {
    setDeviceId(camId);
    setShowCamMenu(false);
    try {
      const raw = localStorage.getItem('velvetsnap_device_settings');
      const s = raw ? JSON.parse(raw) : {};
      s.camera = camId;
      localStorage.setItem('velvetsnap_device_settings', JSON.stringify(s));
    } catch {}
  };

  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const matched = data.data.find((t: any) => t.templateId === templateId);
          if (matched) {
            setDbTemplate(matched);
            setSlotsCount(matched.templateData?.slots || 3);
            setTemplateName(matched.templateName);
            if (matched.templateThumb || matched.templateFull) {
              removeGreenScreen(matched.templateThumb || matched.templateFull, 400).then((keyed) => {
                setKeyedFrameImage(keyed);
                const img = new window.Image();
                img.onload = () => setFrameRatio(img.naturalWidth / img.naturalHeight);
                img.src = keyed;
              });
            }
          } else {
            const staticConf = TEMPLATE_CONFIGS[templateId as keyof typeof TEMPLATE_CONFIGS];
            if (staticConf) {
              setSlotsCount(staticConf.slots);
              setTemplateName(staticConf.name);
            }
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load template info:', err);
        const staticConf = TEMPLATE_CONFIGS[templateId as keyof typeof TEMPLATE_CONFIGS];
        if (staticConf) {
          setSlotsCount(staticConf.slots);
          setTemplateName(staticConf.name);
        }
      });
  }, [templateId]);

  useEffect(() => {
    setPhotoAdjust(captures.map(() => ({ scale: 1, x: 0, y: 0 })));
  }, [captures]);

  useEffect(() => {
    if (panSlot === null) return;
    const onMove = (e: MouseEvent) => {
      if (panSlot === null || !panStart) return;
      const dx = (e.clientX - panStart.mx) / 4;
      const dy = (e.clientY - panStart.my) / 4;
      setPhotoAdjust((prev) => {
        const next = prev.map((a) => ({ ...a }));
        next[panSlot] = { scale: next[panSlot]?.scale || 1, x: panStart.ox + dx, y: panStart.oy + dy };
        return next;
      });
    };
    const onUp = () => { setPanSlot(null); setPanStart(null); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [panSlot, panStart]);

  const [dslrCapturing, setDslrCapturing] = useState(false);

  const addCapture = useCallback((url: string) => {
    setCaptures((prev) => {
      const idx = prev.findIndex((c) => c === '');
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = url;
        return next;
      }
      return [...prev, url];
    });
  }, []);

  const capture = useCallback(async () => {
    if (cameraType === 'dslr') {
      setDslrCapturing(true);
      try {
        const res = await fetch('/api/camera/capture', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          addCapture(data.dataUrl);
        } else {
          alert('Gagal mengambil foto: ' + (data.error || 'Unknown error'));
        }
      } catch (err: any) {
        alert('Gagal terhubung ke kamera: ' + err.message);
      } finally {
        setDslrCapturing(false);
      }
    } else {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        if (mirrored) {
          flipImage(imageSrc).then((flipped) => {
            addCapture(flipped);
          });
        } else {
          addCapture(imageSrc);
        }
      }
    }
  }, [webcamRef, cameraType, mirrored, addCapture]);

  const startSession = () => {
    if (taking) return;
    setTaking(true);
    takePhoto(slotsCount - filledCount);
  };

  const handleManualCapture = async () => {
    if (filledCount >= slotsCount) return;
    const prevLen = captures.length;
    let timer = 3;
    setCountdown(timer);
    await new Promise<void>((resolve) => {
      const iv = setInterval(() => {
        timer--;
        if (timer > 0) {
          setCountdown(timer);
        } else {
          clearInterval(iv);
          setCountdown(null);
          resolve();
        }
      }, 1000);
    });
    await capture();
  };

  const handleDeleteCapture = (idx: number) => {
    setCaptures((prev) => {
      const next = [...prev];
      next[idx] = '';
      return next;
    });
  };

  const takePhoto = (remaining: number) => {
    if (remaining === 0) {
      setTaking(false);
      return;
    }
    
    let timer = 3;
    setCountdown(timer);
    
    const interval = setInterval(() => {
      timer -= 1;
      if (timer > 0) {
        setCountdown(timer);
      } else {
        clearInterval(interval);
        setCountdown(null);
        setTimeout(() => {
          capture();
          setTimeout(() => takePhoto(remaining - 1), 1000);
        }, 100);
      }
    }, 1000);
  };

  const handleRetake = () => {
    setCaptures([]);
    setStep('camera');
  };

  const proceedToPayment = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('photobooth_captures', JSON.stringify(captures));
      sessionStorage.setItem('photobooth_template', templateId);
      sessionStorage.setItem('photobooth_filter', selectedFilter);
      sessionStorage.setItem('photobooth_adjust', JSON.stringify(photoAdjust));
    }
    // Generate composited image via Canvas (reliable, no DOM issues)
    const frameSrc = keyedFrameImage || dbTemplate?.templateFull || '';
    if (frameSrc && dbTemplate?.templateData?.slotsLayout && dbTemplate?.templateData?.slotsLayout.length > 0) {
      composeFrameImage(
        frameSrc,
        dbTemplate.templateData.slotsLayout,
        captures,
        photoAdjust,
        dbTemplate.templateData.color || '#ffffff',
        dbTemplate.templateData.canvasWidth || 1000,
      ).then((dataUrl) => {
        sessionStorage.setItem('photobooth_composited', dataUrl);
        router.push('/payment');
      }).catch(() => router.push('/payment'));
    } else {
      router.push('/payment');
    }
  };

  if (step === 'editor') {
    const hasTemplate = dbTemplate && dbTemplate.templateFull && dbTemplate.templateData?.slotsLayout && dbTemplate.templateData.slotsLayout.length > 0;
    return (
      <div className="page-container">
        <h1 className="title">Edit Photos</h1>
        
        <div className={styles.editorWorkspace}>
          {hasTemplate ? (
            <div
              className={styles.framePreview}
              style={{
                position: 'relative',
                width: '320px',
                aspectRatio: frameRatio,
                backgroundColor: dbTemplate.templateData.color || '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
              }}
            >
              {(dbTemplate.templateData?.slotsLayout || []).map((slot, idx) => {
                const src = captures[idx];
                if (!src) return null;
                return (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      width: `${slot.w}%`,
                      height: `${slot.h}%`,
                      overflow: 'hidden',
                      zIndex: 1,
                    }}
                  >
                    <div className={styles.slotImageWrapper}>
                      <div
                        style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
                        onMouseDown={(e) => {
                          if (e.button !== 0) return;
                          const target = e.target as HTMLElement;
                          if (target.closest('[data-slider]')) return;
                          e.preventDefault();
                          const a = photoAdjust[idx] || { scale: 1, x: 0, y: 0 };
                          setPanSlot(idx);
                          setPanStart({ mx: e.clientX, my: e.clientY, ox: a.x, oy: a.y });
                        }}
                      >
                        <img
                          src={src}
                          className={styles[selectedFilter]}
                          alt={`Slot ${idx}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: `scale(${photoAdjust[idx]?.scale || 1}) translate(${photoAdjust[idx]?.x || 0}%, ${photoAdjust[idx]?.y || 0}%)`,
                            transformOrigin: 'center',
                            pointerEvents: 'none',
                          }}
                        />
                        <div className={styles.sliderOverlay}>
                          <input
                            data-slider
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.05"
                            value={photoAdjust[idx]?.scale || 1}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              setPhotoAdjust((prev) => {
                                const next = prev.map((a) => ({ ...a }));
                                next[idx] = { ...next[idx], scale: v };
                                return next;
                              });
                            }}
                            className={styles.photoSlider}
                          />
                          <span className={styles.sliderLabel}>{(photoAdjust[idx]?.scale || 1).toFixed(1)}x</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <img
                src={keyedFrameImage || dbTemplate?.templateFull || ''}
                alt="Frame"
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '100%', height: '100%',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
            </div>
          ) : (
            <div className={styles.previewContainer}>
              {captures.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`shot ${i}`}
                    className={`${styles.photoFrame} ${styles[selectedFilter]}`}
                    style={{ transform: `scale(${photoAdjust[i]?.scale || 1})` }}
                  />
              ))}
            </div>
          )}
          
          <div className={`glass-panel ${styles.sidebar}`}>
            <button className="mac-button secondary" onClick={() => router.push('/templates')} style={{ padding: '10px 20px', fontSize: '14px', marginBottom: '16px', alignSelf: 'flex-start' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <h3 style={{ marginBottom: '16px' }}>Filters</h3>
            <div className={styles.filterOptions}>
              <button className={`mac-button ${selectedFilter === 'none' ? '' : 'secondary'}`} onClick={() => setSelectedFilter('none')}>Normal</button>
              <button className={`mac-button ${selectedFilter === 'grayscale' ? '' : 'secondary'}`} onClick={() => setSelectedFilter('grayscale')}>B&W</button>
              <button className={`mac-button ${selectedFilter === 'sepia' ? '' : 'secondary'}`} onClick={() => setSelectedFilter('sepia')}>Vintage</button>
            </div>
            
            {captures.length > 0 && (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Drag photo to reposition
              </p>
            )}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="mac-button secondary" onClick={handleRetake}>
                <RefreshCcw size={18} /> Retake All
              </button>
              <button className="mac-button" onClick={proceedToPayment}>
                <Check size={18} /> Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ alignItems: 'center' }}>
      {/* ── Stepper ── */}
      <div className={styles.stepper}>
        <div className={`${styles.stepItem} ${styles.stepDone}`}>
          <span className={styles.stepNum}><Check size={14} /></span>
          <span className={styles.stepLabel}>Template</span>
        </div>
        <div className={`${styles.stepLine} ${styles.stepLineDone}`} />
        <div className={`${styles.stepItem} ${step === 'camera' ? styles.stepActive : styles.stepDone}`}>
          <span className={styles.stepNum}><CameraIcon size={14} /></span>
          <span className={styles.stepLabel}>Photo</span>
        </div>
        <div className={`${styles.stepLine} ${step !== 'camera' ? styles.stepLineDone : ''}`} />
        <div className={`${styles.stepItem} ${step === 'camera' ? '' : styles.stepActive}`}>
          <span className={styles.stepNum}><Check size={14} /></span>
          <span className={styles.stepLabel}>Edit</span>
        </div>
        <div className={`${styles.stepLine} ${step !== 'camera' ? styles.stepLineDone : ''}`} />
        <div className={styles.stepItem}>
          <span className={styles.stepNum}><CameraIcon size={14} /></span>
          <span className={styles.stepLabel}>Pay</span>
        </div>
      </div>

      <p className="subtitle" style={{ marginTop: 0 }}>
        {templateName} • {filledCount} / {slotsCount} shots
        {cameraType === 'dslr' && ' • DSLR Mode'}
      </p>

      <div className={styles.viewfinderRow}>
        {cameraType === 'dslr' ? (
          <div className={styles.cameraWrapper} style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#2d2d2d', minHeight: '300px', flexDirection: 'column', gap: '16px'
          }}>
            <CameraIcon size={64} style={{ opacity: 0.5 }} />
            <p style={{ color: '#fff', opacity: 0.6, fontSize: '14px' }}>
              Kamera DSLR terhubung via USB — klik Capture untuk mengambil foto
            </p>
            {countdown !== null && (
              <div className={styles.countdownOverlay}>{countdown}</div>
            )}
            {dslrCapturing && (
              <div className={styles.countdownOverlay}>
                <Loader2 className="spin" size={48} />
              </div>
            )}
          </div>
        ) : (
          <div className={styles.cameraWrapper}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ 
                facingMode: "user",
                deviceId: deviceId ? { exact: deviceId } : undefined
              }}
              className={styles.webcam}
              style={{ transform: mirrored ? 'scaleX(-1)' : 'none' }}
            />
            
            {countdown !== null && (
              <div className={styles.countdownOverlay}>
                {countdown}
              </div>
            )}
          </div>
        )}

        {dbTemplate && dbTemplate.templateFull && dbTemplate.templateData?.slotsLayout && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div className={styles.liveStrip} style={{ aspectRatio: frameRatio }}>
            {(dbTemplate.templateData?.slotsLayout || []).map((slot, idx) => {
              const src = captures[idx];
              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                    width: `${slot.w}%`,
                    height: `${slot.h}%`,
                    overflow: 'hidden',
                    background: src ? 'none' : 'rgba(0,0,0,0.06)',
                    borderRadius: '2px',
                  }}
                >
                  {src && (
                    <>
                      <img
                        src={src}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <button
                        className={styles.deleteSlot}
                        onClick={() => handleDeleteCapture(idx)}
                        aria-label="Hapus foto"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
            <img
              src={keyedFrameImage || dbTemplate.templateFull}
              alt=""
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            />
          </div>
          {filledCount === slotsCount && (
            <button className="mac-button" onClick={() => setStep('editor')} style={{ marginTop: '8px', padding: '10px 24px', fontSize: '14px', width: '100%' }}>
              <Check size={16} /> Edit
            </button>
          )}
        </div>
      )}
      </div>

      <div className={styles.captureBtnWrap}>
        {!taking && !dslrCapturing && (
          <div className={styles.btnRow}>
            <button className="mac-button secondary" onClick={() => router.push('/templates')} style={{ padding: '10px 20px', fontSize: '14px' }}>
              <ArrowLeft size={16} /> Back
            </button>
            {captureMode === 'manual' ? (
              <button className="mac-button" onClick={handleManualCapture} style={{ padding: '16px 32px', fontSize: '20px', borderRadius: '32px' }}>
                <CameraIcon size={24} />
                Capture ({filledCount}/{slotsCount})
              </button>
            ) : (
              <button className="mac-button" onClick={startSession} style={{ padding: '16px 32px', fontSize: '20px', borderRadius: '32px' }}>
                <CameraIcon size={24} />
                {cameraType === 'dslr' ? 'Shoot (Camera Shutter)' : 'Capture'}
              </button>
            )}
            <div className={styles.modeToggle} title={captureMode === 'auto' ? 'Auto' : 'Manual'}>
              <button
                className={`${styles.modeToggleBtn} ${captureMode === 'manual' ? styles.modeToggleActive : ''}`}
                onClick={() => setCaptureMode('manual')}
              >
                M
              </button>
              <button
                className={`${styles.modeToggleBtn} ${captureMode === 'auto' ? styles.modeToggleActive : ''}`}
                onClick={() => setCaptureMode('auto')}
              >
                A
              </button>
              <span className={styles.modeToggleSlider} style={{ left: captureMode === 'manual' ? '2px' : '50%' }} />
            </div>
            {cameraType === 'webcam' && (
              <>
                <div ref={camMenuRef} style={{ position: 'relative' }}>
                  <button
                    className="mac-button secondary"
                    onClick={() => setShowCamMenu((v) => !v)}
                    style={{ padding: '10px 14px', fontSize: '14px' }}
                    title="Ganti kamera"
                  >
                    <RotateCcw size={18} />
                  </button>
                  {showCamMenu && (
                    <div className={styles.camDropdown}>
                      {availableCams.map((cam) => (
                        <button
                          key={cam.deviceId}
                          className={`${styles.camOption} ${cam.deviceId === deviceId ? styles.camOptionActive : ''}`}
                          onClick={() => handleSwitchCamera(cam.deviceId)}
                        >
                          {cam.label || `Camera ${cam.deviceId.slice(0, 8)}...`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className={`mac-button secondary ${mirrored ? '' : styles.mirrorOff}`}
                  onClick={() => setMirrored((v) => !v)}
                  style={{ padding: '10px 14px', fontSize: '14px' }}
                  title={mirrored ? 'Mirror: ON' : 'Mirror: OFF'}
                >
                  <span style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1 }}>⇔</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BoothPage() {
  return (
    <Suspense fallback={<div className="page-container"><p style={{ textAlign: 'center' }}>Loading booth...</p></div>}>
      <BoothContent />
    </Suspense>
  );
}
