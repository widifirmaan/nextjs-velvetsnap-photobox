'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  Camera as CameraIcon, Sparkles, Heart, MapPin, ExternalLink, MessageCircle,
  LayoutTemplate, Loader2, ArrowLeft, Check, RefreshCcw, X, QrCode, CheckCircle,
  Download, Printer, Home as HomeIcon
} from 'lucide-react';
import styles from './page.module.css';
import { flipImage, composeFrameImage, removeGreenScreen, type ISlot } from '@/lib/canvas-utils';
import Webcam from 'react-webcam';

/* ── Shared Interfaces ── */

interface TemplateData {
  _id: string;
  templateId: string;
  name: string;
  description: string;
  slots: number;
  price: number;
  color: string;
  isActive: boolean;
  frameImage?: string;
  slotsLayout?: ISlot[];
}

interface StripResult {
  _id: string;
  sessionId: string;
  finalImage: string;
}

/* ── Constants ── */

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80',
];

const TEMPLATE_CONFIGS: Record<string, { name: string; slots: number }> = {
  t1: { name: 'Classic Strips', slots: 3 },
  t2: { name: 'Retro Film', slots: 4 },
  t3: { name: 'Newspaper', slots: 1 },
};

const STEP_LABELS = ['Template', 'Photo', 'Edit', 'Pay', 'Cetak'];

/* ── Mini Components ── */

function SlotDots({ count }: { count: number }) {
  return (
    <span className={styles.slotDots}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={styles.slotDot} />
      ))}
    </span>
  );
}

function StepperBar({ current, total }: { current: number; total: number }) {
  return (
    <div className={styles.boothStepper}>
      {STEP_LABELS.slice(0, total).map((label, i) => (
        <div key={i} className={styles.boothStepItem}>
          {i > 0 && <div className={`${styles.boothStepLine} ${i <= current ? styles.boothStepLineDone : ''}`} />}
          <div className={`${styles.boothStepDot} ${i === current ? styles.boothStepActive : ''} ${i < current ? styles.boothStepDone : ''}`}>
            {i < current ? <Check size={14} /> : i + 1}
          </div>
          <span className={`${styles.boothStepLabel} ${i === current ? styles.boothStepLabelActive : ''} ${i < current ? styles.boothStepLabelDone : ''}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Main Page ── */

export default function Home() {
  const [step, setStep] = useState(0);
  const [showPreloader, setShowPreloader] = useState(true);
  const [strips, setStrips] = useState<StripResult[]>([]);
  const [txCount, setTxCount] = useState(0);
  const [tmplCount, setTmplCount] = useState(0);
  const [allTemplates, setAllTemplates] = useState<TemplateData[]>([]);

  // initial fetch & preload everything
  useEffect(() => {
    fetch('/api/transactions/strips')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length) {
          Promise.all(
            res.data.map((s: StripResult) => new Promise<void>((resolve) => {
              const img = new window.Image();
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = s.finalImage;
            }))
          ).then(() => setStrips(res.data));
        }
      })
      .catch(() => {});
    fetch('/api/transactions')
      .then((r) => r.json())
      .then((res) => { if (res.success) setTxCount(res.pagination.total); })
      .catch(() => {});
    fetch('/api/templates')
      .then((r) => r.json())
      .then((res) => { if (res.success) setTmplCount(res.data.length); })
      .catch(() => {});
    fetch('/api/templates/thumbnails')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length) {
          const active = res.data.filter((t: TemplateData) => t.isActive !== false);
          setAllTemplates(active);
          active.forEach((t: TemplateData) => {
            if (t.frameImage) { const img = new window.Image(); img.src = t.frameImage; }
          });
        }
      })
      .catch(() => {});

    const timer = setTimeout(() => setShowPreloader(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (showPreloader) {
    return (
      <div className={styles.preloader}>
        <div className={styles.preloaderInner}>
          <svg width="64" height="64" viewBox="0 0 56 56" fill="none" className={styles.preloaderLogo}>
            <rect x="4" y="12" width="48" height="34" rx="8" fill="#262626" />
            <circle cx="28" cy="29" r="11" fill="#fff" />
            <circle cx="28" cy="29" r="7" fill="#262626" />
            <rect x="39" y="8" width="12" height="4" rx="2" fill="#262626" />
            <path d="M48 18l4-2" stroke="#262626" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 8l-3 4" stroke="#262626" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="18" cy="6" r="1.5" fill="#262626" />
          </svg>
          <span className={styles.preloaderTitle}>VelvetSnap</span>
          <span className={styles.preloaderSub}>Photo Booth Jakarta</span>
          <div className={styles.preloaderSpinner} />
        </div>
      </div>
    );
  }

  return step === 0 ? (
    <div key="home" className={styles.stepTransition}><HomePage strips={strips} txCount={txCount} tmplCount={tmplCount} onStart={() => setStep(1)} /></div>
  ) : (
    <div key="flow" className={styles.stepTransition}><StepperFlow step={step} setStep={setStep} allTemplates={allTemplates} /></div>
  );
}

/* ════════════════════════════════════════
   HOME PAGE (step 0)
   ════════════════════════════════════════ */

function HomePage({ strips, txCount, tmplCount, onStart }: {
  strips: StripResult[]; txCount: number; tmplCount: number; onStart: () => void;
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [smallViewport, setSmallViewport] = useState(false);
  const smallVpRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLImageElement | null)[]>([]);

  const tripled = [...strips.slice(0, 10), ...strips.slice(0, 10), ...strips.slice(0, 10)];

  useEffect(() => {
    const check = () => {
      const v = window.innerWidth < 768;
      setSmallViewport(v);
      smallVpRef.current = v;
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSlideIdx((i) => (i + 1) % SAMPLE_IMAGES.length);
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const updateTransforms = useCallback(() => {
    const c = trackRef.current;
    if (!c) return;
    const oneSet = c.scrollWidth / 3;
    if (c.scrollLeft >= oneSet * 2) c.scrollLeft -= oneSet;
    else if (c.scrollLeft < oneSet) c.scrollLeft += oneSet;
    if (smallVpRef.current) {
      slideRefs.current.forEach((el) => {
        if (!el) return;
        el.style.transform = '';
        el.style.zIndex = '';
        el.style.opacity = '1';
      });
      return;
    }
    const cx = c.scrollLeft + c.clientWidth / 2;
    slideRefs.current.forEach((el) => {
      if (!el) return;
      const ecx = el.offsetLeft + el.offsetWidth / 2;
      const dist = (ecx - cx) / (c.clientWidth * 0.5);
      const abs = Math.abs(dist);
      const sign = Math.sign(dist);
      let rotY: number, scale: number, zIdx: number;
      if (abs < 0.5) {
        rotY = sign * abs * 10;
        scale = 1 - abs * 0.12;
        zIdx = 50;
      } else if (abs < 1) {
        const t = (abs - 0.5) / 0.5;
        rotY = sign * 5;
        scale = 0.94 - t * 0.21;
        zIdx = 50 - t * 35;
      } else {
        rotY = sign * 5;
        scale = 0.73;
        zIdx = 15;
      }
      el.style.transform = `perspective(700px) rotateY(${rotY}deg) scale(${scale})`;
      el.style.zIndex = Math.round(zIdx).toString();
      el.style.opacity = String(Math.max(0.1, 1 - abs * 0.55));
    });
  }, []);

  useEffect(() => {
    if (!strips.length) return;
    const c = trackRef.current;
    if (!c) return;
    slideRefs.current = strips.slice(0, 10).map(() => null);
    requestAnimationFrame(() => {
      if (c.scrollWidth > c.clientWidth) c.scrollLeft = c.scrollWidth / 3;
      const onScroll = () => requestAnimationFrame(updateTransforms);
      c.addEventListener('scroll', onScroll, { passive: true });
      updateTransforms();
      return () => c.removeEventListener('scroll', onScroll);
    });
  }, [updateTransforms, strips]);

  const autoRef = useRef(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleUserInteract = useCallback(() => {
    cancelAnimationFrame(autoRef.current);
    clearTimeout(resumeTimer.current);
  }, []);

  const scheduleResume = useCallback(() => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      const c = trackRef.current;
      if (!c || c.scrollWidth <= c.clientWidth) return;
      const step = () => {
        const oneSet = c.scrollWidth / 3;
        c.scrollLeft += 0.8;
        if (c.scrollLeft >= oneSet * 2) c.scrollLeft -= oneSet;
        else if (c.scrollLeft < oneSet) c.scrollLeft += oneSet;
        autoRef.current = requestAnimationFrame(step);
      };
      autoRef.current = requestAnimationFrame(step);
    }, 3000);
  }, []);

  const startAutoScroll = useCallback(() => {
    const c = trackRef.current;
    if (!c || c.scrollWidth <= c.clientWidth) return;
    const step = () => {
      const oneSet = c.scrollWidth / 3;
      c.scrollLeft += 0.8;
      if (c.scrollLeft >= oneSet * 2) c.scrollLeft -= oneSet;
      else if (c.scrollLeft < oneSet) c.scrollLeft += oneSet;
      autoRef.current = requestAnimationFrame(step);
    };
    autoRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    if (!strips.length) return;
    const t = setTimeout(startAutoScroll, 100);
    return () => { clearTimeout(t); cancelAnimationFrame(autoRef.current); clearTimeout(resumeTimer.current); };
  }, [startAutoScroll, strips.length]);

  return (
    <div className={styles.page}>
      {/* ── Header / Navigation ── */}
      <header className={styles.header}>
        <div
          className={styles.location}
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
        >
          <MapPin size={16} />
          <span>Jakarta</span>
          <div className={`${styles.tooltip} ${tooltipVisible ? styles.tooltipVisible : ''}`}>
            <div className={styles.tooltipImage}>
              <div className={styles.tooltipPlaceholder}>📍 VelvetSnap Booth</div>
            </div>
          </div>
        </div>
        <nav className={styles.nav}>
          <a href="https://instagram.com" target="_blank" rel="noopener" className={styles.navLink}>
            <CameraIcon size={16} /> Instagram
          </a>
          <span className={styles.navSep} />
          <a href="https://wa.me/628123456789" target="_blank" rel="noopener" className={styles.navLink}>
            <MessageCircle size={16} /> WhatsApp
          </a>
          <span className={styles.navSep} />
          <a href="/templates" className={styles.navLink}>Templates</a>
          <span className={styles.navSep} />
          <a href="/strips-studio" className={styles.navLink}>
            <Sparkles size={14} /> Studio
          </a>
        </nav>
      </header>

      {/* ── Main content: 3 columns ── */}
      <main className={styles.main}>
        <div className={styles.colLeft}>
          <div className={styles.introCard}>
            <div className={styles.introContent}>
              <div className={styles.logoWrap}>
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className={styles.logo}>
                  <rect x="4" y="12" width="48" height="34" rx="8" fill="var(--mn-text)" />
                  <circle cx="28" cy="29" r="11" fill="var(--mn-card)" />
                  <circle cx="28" cy="29" r="7" fill="var(--mn-text)" />
                  <rect x="39" y="8" width="12" height="4" rx="2" fill="var(--mn-text)" />
                  <path d="M48 18l4-2" stroke="var(--mn-text)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M18 8l-3 4" stroke="var(--accent-color)" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="18" cy="6" r="1.5" fill="var(--accent-color)" />
                </svg>
                <div className={styles.logoText}>
                  <h1 className={styles.logoTitle}>VelvetSnap</h1>
                  <span className={styles.logoSub}>Photo Booth Jakarta</span>
                </div>
              </div>
              <p className={styles.introDesc}>
                Cetak langsung, template kustom, hasil siap dalam hitungan detik.
              </p>
              <div className={styles.introStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNum}>{txCount || 0}+</span>
                  <span className={styles.statLabel}>Tercetak</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <span className={styles.statNum}>{tmplCount || 0}+</span>
                  <span className={styles.statLabel}>Template</span>
                </div>
              </div>
              <button className={styles.introCta} onClick={onStart}>
                Mulai Sekarang <ExternalLink size={14} />
              </button>
            </div>
          </div>
          <a href="/strips-studio" className={styles.cardSmall}>
            <div className={styles.cardSmallIcon}>
              <Sparkles size={22} />
            </div>
            <div className={styles.cardSmallBody}>
              <span className={styles.cardSmallTag}>Fitur</span>
              <h3 className={styles.cardSmallTitle}>Kustom Template</h3>
              <p className={styles.cardSmallDesc}>Desain template fotomu sendiri</p>
            </div>
          </a>
        </div>

        <div className={styles.colCenter}>
          <a className={styles.cardWedding} onClick={onStart} style={{ cursor: 'pointer' }}>
            <div className={styles.slideshow}>
              {SAMPLE_IMAGES.map((src, i) => (
                <div
                  key={i}
                  className={styles.slide}
                  style={{
                    backgroundImage: `url(${src})`,
                    opacity: i === slideIdx ? 0.85 : 0,
                  }}
                />
              ))}
            </div>
          </a>
          <div className={styles.cardPromo}>
            <Heart size={22} />
            <div className={styles.cardPromoContent}>
              <span className={styles.promoLabel}>Promo</span>
              <span className={styles.promoValue}>Cetak ke-2 GRATIS</span>
            </div>
          </div>
        </div>

        <div className={styles.colRight}>
          {strips.length > 0 ? (
            <div
              ref={trackRef}
              className={styles.fanTrack}
              onPointerDown={handleUserInteract}
              onPointerUp={scheduleResume}
              onPointerLeave={scheduleResume}
            >
              {tripled.map((s, i) => (
                <img
                  key={`${s._id}-${i}`}
                  ref={(el) => { slideRefs.current[i] = el; }}
                  src={s.finalImage}
                  alt=""
                  className={styles.fanSlide}
                  draggable={false}
                />
              ))}
            </div>
          ) : (
            <div className={styles.rightEmpty}>
              <CameraIcon size={32} />
              <span>Belum ada hasil strip</span>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <nav className={styles.nav}>
          <a href="https://instagram.com" target="_blank" rel="noopener" className={styles.navLink}>
            <CameraIcon size={16} /> Instagram
          </a>
          <span className={styles.navSep} />
          <a href="https://wa.me/628123456789" target="_blank" rel="noopener" className={styles.navLink}>
            <MessageCircle size={16} /> WhatsApp
          </a>
          <span className={styles.navSep} />
          <a href="/templates" className={styles.navLink}>Templates</a>
          <span className={styles.navSep} />
          <a href="/strips-studio" className={styles.navLink}>
            <Sparkles size={14} /> Studio
          </a>
        </nav>
        <p className={styles.footerText}>
          Abadikan momen spesialmu bersama VelvetSnap ✨
        </p>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════
   STEPPER FLOW (steps 1-5)
   ════════════════════════════════════════ */

function StepperFlow({ step, setStep, allTemplates }: {
  step: number; setStep: (s: number) => void; allTemplates: TemplateData[];
}) {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [captures, setCaptures] = useState<string[]>([]);
  const [photoAdjust, setPhotoAdjust] = useState<{ scale: number; x: number; y: number }[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [keyedFrameImage, setKeyedFrameImage] = useState('');
  const [frameRatio, setFrameRatio] = useState(2 / 3);
  const [compositedImage, setCompositedImage] = useState<string | null>(null);
  const [price, setPrice] = useState(35000);
  const [paid, setPaid] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const stepIndex = step - 1;

  const handleSelectTemplate = useCallback((id: string) => {
    setTemplateId(id);
    setStep(2);
  }, [setStep]);

  useEffect(() => {
    if (!templateId) return;
    fetch('/api/templates')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const matched = data.data.find((t: any) => t.templateId === templateId);
          if (matched) {
            setTemplateData(matched);
            setPrice(matched.price || 35000);
            if (matched.frameImage) {
              removeGreenScreen(matched.frameImage).then((keyed) => {
                setKeyedFrameImage(keyed);
                const img = new window.Image();
                img.onload = () => setFrameRatio(img.naturalWidth / img.naturalHeight);
                img.src = keyed;
              });
            }
          } else {
            const fallback = TEMPLATE_CONFIGS[templateId];
            if (fallback) {
              setTemplateData({ templateId, name: fallback.name, slots: fallback.slots, price: 35000, color: '#ffffff' } as TemplateData);
            }
          }
        }
      })
      .catch(() => {});
  }, [templateId]);

  const handleAddCapture = useCallback((url: string) => {
    setCaptures((prev) => {
      const idx = prev.findIndex((c) => c === '');
      if (idx !== -1) { const n = [...prev]; n[idx] = url; return n; }
      return [...prev, url];
    });
  }, []);

  const handleDeleteCapture = (idx: number) => {
    setCaptures((prev) => { const n = [...prev]; n[idx] = ''; return n; });
  };

  useEffect(() => {
    setPhotoAdjust(captures.map(() => ({ scale: 1, x: 0, y: 0 })));
  }, [captures]);

  useEffect(() => {
    if (!captures.length || !templateData?.slotsLayout?.length) return;
    const frameSrc = keyedFrameImage || templateData.frameImage || '';
    if (!frameSrc) return;
    composeFrameImage(frameSrc, templateData.slotsLayout, captures, photoAdjust, templateData.color || '#ffffff')
      .then(setCompositedImage)
      .catch(() => {});
  }, [captures, photoAdjust, templateData, keyedFrameImage]);

  const slotsCount = templateData?.slots || TEMPLATE_CONFIGS[templateId || '']?.slots || 3;
  const filledCount = useMemo(() => captures.filter((c) => c !== '').length, [captures]);

  const startOver = () => { setStep(0); setCaptures([]); setTemplateId(null); setTemplateData(null); setCompositedImage(null); setPaid(false); setErrMsg(null); };

  /* ── Render: Template Picker (Step 1) ── */
  if (step === 1) return <div className={styles.stepTransition}><TemplateStep templates={allTemplates} onSelect={handleSelectTemplate} onBack={() => setStep(0)} /></div>;

  /* ── Render: Booth (Step 2) ── */
  if (step === 2) return (
    <div className={styles.stepTransition}>
    <BoothStep
      templateId={templateId || 't1'}
      templateName={templateData?.name || TEMPLATE_CONFIGS[templateId || '']?.name || ''}
      slotsCount={slotsCount}
      filledCount={filledCount}
      captures={captures}
      onAddCapture={handleAddCapture}
      onDeleteCapture={handleDeleteCapture}
      templateData={templateData}
      keyedFrameImage={keyedFrameImage}
      frameRatio={frameRatio}
      onNext={() => setStep(3)}
      onBack={() => { setStep(1); setCaptures([]); }}
    />
    </div>
  );

  /* ── Render: Editor (Step 3) ── */
  if (step === 3) return (
    <div className={styles.stepTransition}>
    <EditorStep
      captures={captures}
      templateData={templateData}
      keyedFrameImage={keyedFrameImage}
      frameRatio={frameRatio}
      photoAdjust={photoAdjust}
      setPhotoAdjust={setPhotoAdjust}
      selectedFilter={selectedFilter}
      setSelectedFilter={setSelectedFilter}
      onNext={() => setStep(4)}
      onBack={() => setStep(2)}
    />
    </div>
  );

  /* ── Render: Payment (Step 4) ── */
  if (step === 4) return (
    <div className={styles.stepTransition}>
    <PaymentStep
      price={price}
      paid={paid}
      setPaid={setPaid}
      errMsg={errMsg}
      setErrMsg={setErrMsg}
      captcha={captures}
      templateId={templateId || 't1'}
      compositedImage={compositedImage}
      onSuccess={(id) => { setTxId(id); setStep(5); }}
      onBack={() => setStep(3)}
    />
    </div>
  );

  /* ── Render: Result (Step 5) ── */
  if (step === 5) return (
    <div className={styles.stepTransition}>
      <ResultStep
        compositedImage={compositedImage}
        onHome={startOver}
      />
    </div>
  );

  return null;
}

/* ════════════════════════════════════════
   STEP 1: TEMPLATE PICKER
   ════════════════════════════════════════ */

function TemplateStep({ templates, onSelect, onBack }: {
  templates: TemplateData[]; onSelect: (id: string) => void; onBack: () => void;
}) {
  return (
    <div className={`${styles.stepPage} ${styles.stepPageTemplates}`}>
      <StepperBar current={0} total={5} />
      <div className={styles.stepHeader}>
        <button className={styles.backBtn} onClick={onBack}><ArrowLeft size={18} /></button>
        <h1 className={styles.stepHeading}>Pilih Frame</h1>
      </div>
      {templates.length === 0 ? (
        <p className={styles.stepEmpty}>Tidak ada template.</p>
      ) : (
        <div className={styles.templateGrid}>
          {templates.map((t) => (
            <button key={t._id} className={styles.templateCard} onClick={() => onSelect(t.templateId)}>
              <div className={styles.templateCardThumb}>
                {t.frameImage ? <img src={t.frameImage} alt={t.name} loading="lazy" /> : <LayoutTemplate size={48} style={{ color: t.color }} />}
              </div>
              <div className={styles.templateCardBody}>
                <div className={styles.templateCardName}>{t.name}</div>
                <div className={styles.templateCardMeta}>
                  <span className={styles.templateCardPrice}>Rp{(t.price || 0).toLocaleString('id-ID')}</span>
                  <SlotDots count={t.slots} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   STEP 2: PHOTO BOOTH
   ════════════════════════════════════════ */

function BoothStep({
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
  const [mirrored, setMirrored] = useState(true);
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

  const handleSwitchCamera = (camId: string) => {
    setDeviceId(camId); setShowCamMenu(false);
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
              <button className={styles.boothProceedBtn} onClick={onNext}><Check size={16} /> Proses & Lanjut ke Edit</button>
            )}
          </div>
        )}
      </div>

      <div className={styles.boothControls}>
        {!taking && !dslrCapturing && !busy && (
          <div className={styles.boothBtnRow}>
            <button className={styles.boothBtnSecondary} onClick={onBack}><ArrowLeft size={16} /> Back</button>
            {captureMode === 'manual' ? (
              <button className={styles.boothBtnPrimary} onClick={handleManualCapture}>
                <CameraIcon size={24} /> Capture ({filledCount}/{slotsCount})
              </button>
            ) : (
              <button className={styles.boothBtnPrimary} onClick={() => { setTaking(true); takePhoto(slotsCount - filledCount); }}>
                <CameraIcon size={24} /> Capture
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
              <>
                <div ref={camMenuRef} style={{ position: 'relative' }}>
                  <button className={styles.boothBtnSecondary} onClick={() => setShowCamMenu((v) => !v)} title="Ganti kamera">
                    <RefreshCcw size={18} />
                  </button>
                  {showCamMenu && (
                    <div className={styles.boothCamDropdown}>
                      {availableCams.map((cam) => (
                        <button key={cam.deviceId}
                          className={`${styles.boothCamOption} ${cam.deviceId === deviceId ? styles.boothCamOptionActive : ''}`}
                          onClick={() => handleSwitchCamera(cam.deviceId)}>{cam.label || `Camera ${cam.deviceId.slice(0, 8)}...`}</button>
                      ))}
                    </div>
                  )}
                </div>
                <button className={`${styles.boothBtnSecondary} ${!mirrored ? styles.boothMirrorOff : ''}`}
                  onClick={() => setMirrored((v) => !v)} title={mirrored ? 'Mirror: ON' : 'Mirror: OFF'}>
                  <span style={{ fontSize: '16px', fontWeight: 700 }}>⇔</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   STEP 3: EDITOR
   ════════════════════════════════════════ */

function EditorStep({
  captures, templateData, keyedFrameImage, frameRatio,
  photoAdjust, setPhotoAdjust, selectedFilter, setSelectedFilter,
  onNext, onBack,
}: {
  captures: string[]; templateData: TemplateData | null; keyedFrameImage: string; frameRatio: number;
  photoAdjust: { scale: number; x: number; y: number }[];
  setPhotoAdjust: React.Dispatch<React.SetStateAction<{ scale: number; x: number; y: number }[]>>;
  selectedFilter: string; setSelectedFilter: (v: string) => void;
  onNext: () => void; onBack: () => void;
}) {
  const [panSlot, setPanSlot] = useState<number | null>(null);
  const [panStart, setPanStart] = useState<{ mx: number; my: number; ox: number; oy: number } | null>(null);

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
  }, [panSlot, panStart, setPhotoAdjust]);

  const handleRetake = () => onBack();

  const hasTemplate = templateData && templateData.frameImage && templateData.slotsLayout && templateData.slotsLayout.length > 0;

  return (
    <div className={`${styles.stepPage} ${styles.stepPageEditor}`}>
      <StepperBar current={2} total={5} />
      <div className={styles.editorLayout}>
        <div className={styles.editorPreview}>
          {hasTemplate ? (
            <div className={styles.editorFrame} style={{ width: '320px', aspectRatio: frameRatio, backgroundColor: templateData?.color || '#fff' }}>
              {(templateData?.slotsLayout || []).map((slot, idx) => {
                const src = captures[idx];
                if (!src) return null;
                return (
                  <div key={idx} style={{
                    position: 'absolute', left: `${slot.x}%`, top: `${slot.y}%`,
                    width: `${slot.w}%`, height: `${slot.h}%`, overflow: 'hidden', zIndex: 1,
                  }}>
                    <div
                      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', cursor: 'grab' }}
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
                      <img src={src} alt={`Slot ${idx}`}
                        className={selectedFilter === 'grayscale' ? styles.filterGray : selectedFilter === 'sepia' ? styles.filterSepia : ''}
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          transform: `scale(${photoAdjust[idx]?.scale || 1}) translate(${photoAdjust[idx]?.x || 0}%, ${photoAdjust[idx]?.y || 0}%)`,
                          transformOrigin: 'center', pointerEvents: 'none',
                        }} />
                      <div className={styles.editorSliderOverlay}>
                        <input data-slider type="range" min="0.5" max="3" step="0.05"
                          value={photoAdjust[idx]?.scale || 1}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            setPhotoAdjust((prev) => {
                              const next = prev.map((a) => ({ ...a }));
                              next[idx] = { ...next[idx], scale: v };
                              return next;
                            });
                          }} className={styles.editorSlider} />
                        <span className={styles.editorSliderLabel}>{(photoAdjust[idx]?.scale || 1).toFixed(1)}x</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <img src={keyedFrameImage || templateData?.frameImage || ''} alt="Frame"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }} />
            </div>
          ) : (
            <div className={styles.editorSimplePreview}>
              {captures.map((src, i) => (
                <img key={i} src={src} alt={`shot ${i}`}
                  className={selectedFilter === 'grayscale' ? styles.filterGray : selectedFilter === 'sepia' ? styles.filterSepia : ''}
                  style={{ transform: `scale(${photoAdjust[i]?.scale || 1})` }} />
              ))}
            </div>
          )}
        </div>
        <div className={styles.editorSidebar}>
          <button className={styles.boothBtnSecondary} onClick={handleRetake} style={{ alignSelf: 'flex-start' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h3>Filters</h3>
          <div className={styles.editorFilters}>
            {['none', 'grayscale', 'sepia'].map((f) => (
              <button key={f}
                className={`${styles.boothBtnSecondary} ${selectedFilter === f ? styles.boothBtnPrimary : ''}`}
                onClick={() => setSelectedFilter(f)}>
                {f === 'none' ? 'Normal' : f === 'grayscale' ? 'B&W' : 'Vintage'}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#888', lineHeight: '1.5' }}>Drag photo to reposition</p>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className={`${styles.boothBtnSecondary} ${styles.editorRetakeBtn}`} onClick={handleRetake}>
              <RefreshCcw size={18} /> Retake All
            </button>
            <button className={styles.boothBtnPrimary} onClick={onNext}>
              <Check size={18} /> Proceed to Pay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   STEP 4: PAYMENT
   ════════════════════════════════════════ */

function PaymentStep({
  price, paid, setPaid, errMsg, setErrMsg,
  captcha, templateId, compositedImage, onSuccess, onBack,
}: {
  price: number; paid: boolean; setPaid: (v: boolean) => void;
  errMsg: string | null; setErrMsg: (v: string | null) => void;
  captcha: string[]; templateId: string; compositedImage: string | null;
  onSuccess: (id: string) => void; onBack: () => void;
}) {
  const handlePay = async () => {
    setPaid(true); setErrMsg(null);
    try {
      const finalImage = compositedImage || '';
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, price, status: 'PAID', captures: captcha, finalImage }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrMsg(data.error || 'Unknown error'); setPaid(false); return;
      }
      setTimeout(() => onSuccess(data.data?._id || data._id || 'ok'), 800);
    } catch (err: any) {
      setErrMsg(err.message || String(err)); setPaid(false);
    }
  };

  return (
    <div className={`${styles.stepPage} ${styles.stepPagePayment}`}>
      <StepperBar current={3} total={5} />
      <div className={styles.paymentCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <button className={styles.boothBtnSecondary} onClick={onBack}><ArrowLeft size={16} /> Back</button>
        </div>
        <h2 className={styles.stepHeading}>Payment</h2>
        <p style={{ color: '#888', marginBottom: '24px' }}>Scan the QRIS code to pay</p>
        {paid ? (
          <div className={styles.paymentSuccess}>
            <CheckCircle size={80} color="#262626" />
            <h3>Payment Successful!</h3>
            <p>Preparing your photos...</p>
          </div>
        ) : (
          <>
            <div className={styles.paymentQr}><QrCode size={120} color="#1d1d1f" /></div>
            <div className={styles.paymentPrice}>Rp {price.toLocaleString('id-ID')}</div>
            {errMsg && <p style={{ color: 'red', fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>{errMsg}</p>}
            <button className={styles.boothBtnPrimary} onClick={handlePay} style={{ width: '100%', marginTop: '24px' }}>
              Simulate Successful Payment
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   STEP 5: RESULT
   ════════════════════════════════════════ */

function ResultStep({ compositedImage, onHome }: { compositedImage: string | null; onHome: () => void }) {
  const handleDownload = () => {
    if (!compositedImage) return;
    const link = document.createElement('a');
    link.download = `photobooth-${Date.now()}.jpg`;
    link.href = compositedImage;
    link.click();
  };

  const handlePrint = () => {
    if (!compositedImage) return;
    const img = new window.Image();
    img.onload = () => {
      const pw = img.naturalWidth;
      const ph = img.naturalHeight;
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(`<!DOCTYPE html><html><head><style>
        @page{margin:0;size:${pw}px ${ph}px}
        *{margin:0;padding:0;box-sizing:border-box}
        body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#000}
        img{display:block;width:${pw}px;height:${ph}px;max-width:100vw;max-height:100vh;object-fit:contain}
        @media print{body{background:none}}
      </style></head><body><img src="${compositedImage}" /></body></html>`);
      win.document.close();
      setTimeout(() => { win.focus(); win.print(); }, 500);
    };
    img.src = compositedImage;
  };

  return (
    <div className={`${styles.stepPage} ${styles.stepPageResult}`}>
      <StepperBar current={4} total={5} />
      <h2 className={styles.stepHeading} style={{ margin: '24px 0 8px' }}>Your Photos are Ready!</h2>
      <p style={{ color: '#888', marginBottom: '20px' }}>Download or print your photo strip.</p>
      <div className={styles.resultLayout}>
        <div className={styles.resultImage}>
          {compositedImage ? <img src={compositedImage} alt="Final strip" /> : <Loader2 className="spin" size={40} />}
        </div>
        <div className={styles.resultActions}>
          <button className={styles.boothBtnPrimary} onClick={handleDownload}>
            <Download size={18} /> Download JPEG
          </button>
          <button className={styles.boothBtnSecondary} onClick={handlePrint}>
            <Printer size={18} /> Print
          </button>
          <button className={`${styles.boothBtnSecondary} ${styles.resultHomeBtn}`} onClick={onHome}>
            <HomeIcon size={18} /> Home
          </button>
        </div>
      </div>
    </div>
  );
}
