'use client';

import { Suspense, useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera as CameraIcon, RefreshCcw, Check, Loader2 } from 'lucide-react';
import styles from './page.module.css';

interface ISlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TemplateData {
  templateId: string;
  name: string;
  description: string;
  slots: number;
  price: number;
  color: string;
  frameImage?: string;
  slotsLayout?: ISlot[];
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
  
  const [step, setStep] = useState<'camera' | 'editor'>('camera');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [photoAdjust, setPhotoAdjust] = useState<{ scale: number; x: number; y: number }[]>([]);
  const [panSlot, setPanSlot] = useState<number | null>(null);
  const [panStart, setPanStart] = useState<{ mx: number; my: number; ox: number; oy: number } | null>(null);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);

  const [slotsCount, setSlotsCount] = useState<number>(3);
  const [templateName, setTemplateName] = useState<string>('Classic Strips');
  const [dbTemplate, setDbTemplate] = useState<TemplateData | null>(null);
  const [keyedFrameImage, setKeyedFrameImage] = useState<string>('');
  const [frameRatio, setFrameRatio] = useState<number>(2 / 3);

  useEffect(() => {
    const stored = localStorage.getItem('preferred_camera');
    if (stored) {
      setDeviceId(stored);
    }
  }, []);

  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const matched = data.data.find((t: any) => t.templateId === templateId);
          if (matched) {
            setDbTemplate(matched);
            setSlotsCount(matched.slots || 3);
            setTemplateName(matched.name);
            if (matched.frameImage) {
              removeGreenScreen(matched.frameImage).then((keyed) => {
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
  }, [captures.length]);

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

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCaptures(prev => [...prev, imageSrc]);
    }
  }, [webcamRef]);

  const startSession = () => {
    if (taking) return;
    setTaking(true);
    takePhoto(slotsCount);
  };

  const takePhoto = (remaining: number) => {
    if (remaining === 0) {
      setTaking(false);
      setStep('editor');
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
    router.push('/payment');
  };

  if (step === 'editor') {
    const hasTemplate = dbTemplate && dbTemplate.frameImage && dbTemplate.slotsLayout && dbTemplate.slotsLayout.length > 0;
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
                backgroundColor: dbTemplate.color || '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
              }}
            >
              {(dbTemplate.slotsLayout || []).map((slot, idx) => {
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
                src={keyedFrameImage || dbTemplate?.frameImage || ''}
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
            <h3 style={{ marginBottom: '16px' }}>Filters</h3>
            <div className={styles.filterOptions}>
              <button className={`mac-button ${selectedFilter === 'none' ? '' : 'secondary'}`} onClick={() => setSelectedFilter('none')}>Normal</button>
              <button className={`mac-button ${selectedFilter === 'grayscale' ? '' : 'secondary'}`} onClick={() => setSelectedFilter('grayscale')}>B&W</button>
              <button className={`mac-button ${selectedFilter === 'sepia' ? '' : 'secondary'}`} onClick={() => setSelectedFilter('sepia')}>Vintage</button>
            </div>
            
            {captures.length > 0 && (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Drag photo to reposition, drag corner handles to resize
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
      <h1 className="title" style={{ marginBottom: '8px' }}>Get Ready</h1>
      <p className="subtitle">
        {templateName} • {captures.length} / {slotsCount} shots
      </p>

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
        />
        
        {countdown !== null && (
          <div className={styles.countdownOverlay}>
            {countdown}
          </div>
        )}
      </div>

      <div style={{ marginTop: '32px' }}>
        {!taking && (
          <button className="mac-button" onClick={startSession} style={{ padding: '16px 32px', fontSize: '20px', borderRadius: '32px' }}>
            <CameraIcon size={24} />
            Capture
          </button>
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
