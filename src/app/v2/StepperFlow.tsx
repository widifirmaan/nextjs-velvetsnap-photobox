'use client';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Timer } from 'lucide-react';
import styles from './page.module.css';
import { composeFrameImage, composeStripImage, renderStripFrame, stripElementsToSlotsLayout } from '@/lib/canvas-utils';
import { STORAGE_KEYS, FRAME_RENDER_MAX_W } from '@/lib/constants';
import { DEFAULT_ADJUST, type IStripElement, type TemplateData, type PhotoAdjust } from './types';
import StepperBar from './StepperBar';
import TemplateStep from './template/TemplateStep';
import BoothStep from './booth/component/BoothStep';
import EditorStep from './editor/EditorStep';
import PaymentStep from './payment/component/PaymentStep';
import ResultStep from './result/component/ResultStep';

export default function StepperFlow({ step, setStep, onRefresh, sessionTimer }: {
  step: number; setStep: (s: number) => void; onRefresh?: () => void; sessionTimer: number;
}) {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [captures, setCaptures] = useState<string[]>([]);
  const [photoAdjust, setPhotoAdjust] = useState<PhotoAdjust[]>([]);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(0);
  const [keyedFrameImage, setKeyedFrameImage] = useState('');
  const [frameRatio, setFrameRatio] = useState(2 / 3);
  const [stripLoading, setStripLoading] = useState(false);
  const [compositedImage, setCompositedImage] = useState<string | null>(null);
  const [price, setPrice] = useState(35000);
  const [paid, setPaid] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [cachedTemplates, setCachedTemplates] = useState<TemplateData[] | null>(null);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(sessionTimer);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const compositingId = useRef(0);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const startOver = useCallback(() => { onRefresh?.(); setStep(0); setCaptures([]); setTemplateId(null); setTemplateData(null); setCompositedImage(null); setPaid(false); setErrMsg(null); setKeyedFrameImage(''); setStripLoading(false); }, [onRefresh, setStep]);

  useEffect(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (step === 0 || sessionTimer <= 0) { setTimeLeft(sessionTimer); return; }
    setTimeLeft(sessionTimer);
    timerRef.current = setInterval(() => setTimeLeft((prev) => { if (prev <= 1) { clearInterval(timerRef.current!); timerRef.current = null; return 0; } return prev - 1; }), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, sessionTimer]);

  useEffect(() => {
    if (sessionTimer > 0 && timeLeft === 0 && step > 0) { startOver(); }
  }, [timeLeft, step, sessionTimer, startOver]);

  useEffect(() => {
    if (cachedTemplates) { setTemplatesLoading(false); return; }
    const stored = typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEYS.TEMPLATES);
    let cached = false;
    if (stored) { try { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) { setCachedTemplates(parsed); cached = true; } } catch {} }
    if (!cached) {
      fetch('/api/templates/list').then(r => r.json()).then(data => {
        const list = data.data || data.templates || [];
        setCachedTemplates(list);
        const raw = JSON.stringify(list);
        if (raw.length < 4_000_000) { try { sessionStorage.setItem(STORAGE_KEYS.TEMPLATES, raw); } catch {} }
      }).catch(() => {}).finally(() => setTemplatesLoading(false));
    } else {
      setTemplatesLoading(false);
    }
  }, [cachedTemplates]);

  const handleTemplateSelect = useCallback((id: string, fullData?: TemplateData) => {
    const tmpl = fullData || (cachedTemplates || []).find(t => t._id === id || t.templateId === id);
    if (!tmpl) return;
    setTemplateId(id);
    setTemplateData(tmpl);
    setPrice(tmpl.templatePrice || 35000);
    const td = tmpl.templateData;
    if (td?.type === 'strip' && td.elements) {
      const cw = td.canvasWidth || 1000;
      const ch = td.canvasHeight || 3000;
      const computed = stripElementsToSlotsLayout(td.elements, cw, ch);
      if (td.slotsLayout && td.slotsLayout.length === 0) {
        td.slotsLayout.push(...computed);
      } else if (!td.slotsLayout) {
        (td as unknown as Record<string, unknown>).slotsLayout = computed;
      }
      setKeyedFrameImage('');
      setFrameRatio(td.canvasWidth && td.canvasHeight ? td.canvasWidth / td.canvasHeight : 2 / 3);
    } else {
      setKeyedFrameImage('');
      setFrameRatio(td?.canvasWidth && td?.canvasHeight ? td.canvasWidth / td.canvasHeight : 2 / 3);
    }
    setErrMsg(null);
    setStep(1);
    setCaptures([]);
  }, [cachedTemplates, setStep]);

  const handleCaptures = useCallback((caps: string[]) => {
    setCaptures(caps);
    setPhotoAdjust(caps.map(() => ({ ...DEFAULT_ADJUST })));
  }, []);

  const handleKeyedFrame = useCallback(async () => {
    if (!templateData || !captures.length) return;
    const td = templateData.templateData;
    if (td?.type === 'strip') {
      const elements: IStripElement[] = JSON.parse(JSON.stringify(td.elements));
      const origCanvasW = td.canvasWidth || 1000;
      const origCanvasH = td.canvasHeight || 3000;
      const bgColor = td.color || '#ffffff';
      try {
        const frame = await renderStripFrame(elements, origCanvasW, origCanvasH, bgColor, FRAME_RENDER_MAX_W);
        if (frame) setKeyedFrameImage(frame);
      } catch (e) { console.error('renderStripFrame err', e); }
      const ratio = origCanvasW / origCanvasH;
      setFrameRatio(ratio);
    } else {
      if (!keyedFrameImage) {
        try {
          const tmplFull = templateData.templateFull || '';
          const slots = td?.slotsLayout || [];
          const color = td?.color || '#ffffff';
          const img = await composeFrameImage(tmplFull, slots, captures, photoAdjust, color, FRAME_RENDER_MAX_W);
          if (img) setKeyedFrameImage(img);
        } catch (e) { console.error('composeFrameImage err', e); }
      }
    }
  }, [templateData, captures, keyedFrameImage, photoAdjust]);

  useEffect(() => {
    if (step === 1 && templateData && captures.length) { handleKeyedFrame(); }
  }, [step, templateData, captures, handleKeyedFrame]);

  const handlePaymentSuccess = useCallback((orderId: string) => {
    setPaid(true);
    setTxId(orderId);
  }, []);

  const handleCompose = useCallback(async () => {
    if (!templateData || !captures.length || compositedImage) return;
    const id = ++compositingId.current;
    setStripLoading(true);
    setErrMsg(null);
    try {
      const td = templateData.templateData;
      if (td?.type === 'strip') {
        const elements: IStripElement[] = JSON.parse(JSON.stringify(td.elements));
        const cw = td.canvasWidth || 1000;
        const ch = td.canvasHeight || 3000;
        const bgColor = td.color || '#ffffff';
        const result = await composeStripImage(elements, bgColor, captures, photoAdjust, cw, ch);
        if (id !== compositingId.current) return;
        if (result) { setCompositedImage(result); setStep(4); } else setErrMsg('Gagal merender strip');
      } else {
        const tmplFull = templateData.templateFull || '';
        const slots = td?.slotsLayout || [];
        const color = td?.color || '#ffffff';
        const result = await composeFrameImage(tmplFull, slots, captures, photoAdjust, color);
        if (id !== compositingId.current) return;
        if (result) { setCompositedImage(result); setStep(4); } else setErrMsg('Gagal merender gambar');
      }
    } catch (e) { console.error('compose failed', e); if (id === compositingId.current) setErrMsg('Render error'); }
    setStripLoading(false);
  }, [templateData, captures, compositedImage, photoAdjust, setStep]);

  useEffect(() => {
    if (step === 3 && paid) { handleCompose(); }
  }, [step, paid, handleCompose]);

  const slotCount = useMemo(() => {
    if (templateData?.templateData?.slotsLayout?.length) return templateData.templateData.slotsLayout.length;
    return captures.length || 3;
  }, [templateData, captures]);

  const sessionId = useMemo(() => {
    if (typeof window !== 'undefined') {
      const s = sessionStorage.getItem(STORAGE_KEYS.PHOTOBOOTH_SESSION) || `session_${Date.now()}`;
      sessionStorage.setItem(STORAGE_KEYS.PHOTOBOOTH_SESSION, s);
      return s;
    }
    return `session_${Date.now()}`;
  }, []);

  return (
    <div className={styles.stepPage}>
      <StepperBar current={step} total={5} />
      {sessionTimer > 0 && step > 0 && step < 4 && (
        <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 100, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--np-card)', border: '2px solid var(--np-border)', padding: '4px 10px', fontFamily: 'var(--font-body)', fontSize: 11, boxShadow: 'var(--np-shadow-sm)' }}>
          <Timer size={14} /> {formatTime(timeLeft)}
        </div>
      )}
      {errMsg && (
        <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: 'var(--np-card)', border: '3px solid var(--np-accent)', padding: '8px 16px', fontFamily: 'var(--font-body)', fontSize: 11, boxShadow: 'var(--np-shadow)' }}>
          {errMsg}
        </div>
      )}

      {step === 0 && (
        <TemplateStep
          templates={cachedTemplates || []}
          selectedId={templateId}
          onSelect={(id, data) => handleTemplateSelect(id, data)}
          onBack={() => setStep(-1)}
          loading={templatesLoading}
        />
      )}

      {step === 1 && (
        <BoothStep
          totalSlots={slotCount}
          onCaptures={handleCaptures}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && (
        <EditorStep
          captures={captures}
          templateData={templateData}
          keyedFrameImage={keyedFrameImage}
          frameRatio={frameRatio}
          photoAdjust={photoAdjust}
          setPhotoAdjust={setPhotoAdjust}
          selectedSlotIdx={selectedSlotIdx}
          setSelectedSlotIdx={setSelectedSlotIdx}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && !paid && (
        <PaymentStep
          price={price}
          captures={captures}
          sessionId={sessionId}
          onSuccess={handlePaymentSuccess}
          onBack={() => setStep(2)}
        />
      )}

      {(step === 4 || (step === 3 && paid)) && (
        <ResultStep
          image={compositedImage}
          orderId={txId || ''}
          onStartOver={startOver}
        />
      )}

      {(step === 3 && paid && stripLoading) && (
        <div className={styles.loadingScreen}>
          <div className={styles.paymentCard}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--np-text-muted)', marginBottom: 12 }}>RENDERING PHOTO...</div>
          </div>
        </div>
      )}
    </div>
  );
}
