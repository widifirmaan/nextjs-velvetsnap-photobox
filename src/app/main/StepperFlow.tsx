'use client';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Timer } from 'lucide-react';
import styles from '@/app/main/page.module.css';
import { removeGreenScreen, composeFrameImage, composeStripImage, renderStripFrame, stripElementsToSlotsLayout } from '@/lib/canvas-utils';
import { getHighResUrl } from '@/lib/cloudinary-url';
import { TEMPLATE_CONFIGS, type TemplateData, type PhotoAdjust } from './types';
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
  const [selectedFilter, setSelectedFilter] = useState('none');
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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const startOver = useCallback(() => { onRefresh?.(); setStep(0); setCaptures([]); setTemplateId(null); setTemplateData(null); setCompositedImage(null); setPaid(false); setErrMsg(null); setKeyedFrameImage(''); setStripLoading(false); }, [onRefresh, setStep]);

  useEffect(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (step === 0 || sessionTimer <= 0) {
      setTimeLeft(sessionTimer);
      return;
    }
    setTimeLeft(sessionTimer);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
          startOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [step, sessionTimer, startOver]);

  useEffect(() => {
    if (cachedTemplates) { setTemplatesLoading(false); return; }
    fetch('/api/templates/list')
      .then((r) => r.json())
      .then((res) => {
        if (!res.success || !res.data?.length) { setTemplatesLoading(false); return; }
        setCachedTemplates(res.data.filter((t: TemplateData) => t.isActive !== false));
        setTemplatesLoading(false);
      })
      .catch(() => setTemplatesLoading(false));
  }, []);

  const handleSelectTemplate = useCallback((id: string, data?: TemplateData, keyedUrl?: string) => {
    setTemplateId(id);
    setStripLoading(true);
    setStep(2);
    const cw = data?.templateData?.canvasWidth || 1000;
    const ch = data?.templateData?.canvasHeight || 3000;
    setFrameRatio(cw / ch);
    if (keyedUrl) {
      setKeyedFrameImage(keyedUrl);
      setStripLoading(false);
      return;
    }
    if (data) {
      setTemplateData(data);
      setPrice(data.templatePrice ?? 35000);
      const fullUrl = data.templateFull || '';
      if (fullUrl) {
        setKeyedFrameImage(fullUrl);
        setStripLoading(false);
        return;
      }
    }
    setStripLoading(false);
  }, [setStep]);

  useEffect(() => {
    if (!templateId || templateData) return;
    const loadTemplate = async () => {
      setStripLoading(true);
      let matched: TemplateData | undefined;
      try {
        const res = await fetch(`/api/templates/thumbnails?id=${templateId}`);
        const data = await res.json();
        if (data.success && data.data?.length) matched = data.data[0];
      } catch {}
      if (matched) {
        setTemplateData(matched);
        setPrice(matched.templatePrice ?? 35000);

        const cw = matched.templateData.canvasWidth || 1000;
        const ch = matched.templateData.canvasHeight || 3000;

        // Convert legacy (frameImage + slotsLayout) to elements
        if (!matched.templateData.elements?.length && matched.templateFull && matched.templateData.slotsLayout?.length) {
          const els: any[] = [];
          els.push({
            id: 'bg', type: 'background',
            x: 0, y: 0, width: cw, height: ch,
            rotation: 0, zIndex: 0, visible: true,
            props: { stickerUrl: getHighResUrl(matched.templateFull, cw, ch), opacity: 1 },
          });
          (matched.templateData.slotsLayout || []).forEach((slot: any, i: number) => {
            els.push({
              id: `slot-${i}`, type: 'photo-slot',
              x: (slot.x / 100) * cw, y: (slot.y / 100) * ch,
              width: (slot.w / 100) * cw, height: (slot.h / 100) * ch,
              rotation: 0, zIndex: 1, visible: true,
              props: { borderWidth: 2, borderColor: '#ffffff', borderRadius: 8, shape: 'rounded', opacity: 1 },
            });
          });
          matched.templateData.elements = els;
          matched.templateData.type = 'strip';
        }

        // Always process elements (needed for editor/result compositing)
        if (matched.templateData.elements?.length) {
          const slotsLayout = stripElementsToSlotsLayout(matched.templateData.elements, cw, ch);
          matched.templateData.slotsLayout = slotsLayout;
          if (!matched.templateData.slots) matched.templateData.slots = slotsLayout.length;
          matched.templateData.elements = matched.templateData.elements.map((el) =>
            el.type === 'background' && el.props.stickerUrl
              ? { ...el, props: { ...el.props, stickerUrl: getHighResUrl(el.props.stickerUrl, cw, ch) } }
              : el
          );
        }

        // Keyed frame: templateFull is already chroma-keyed from studio save
        if (matched.templateFull) {
          setKeyedFrameImage(matched.templateFull);
          const img = new window.Image();
          img.onload = () => setFrameRatio(img.naturalWidth / img.naturalHeight);
          img.src = matched.templateFull;
          setStripLoading(false);
        } else if (matched.templateData.elements?.length) {
          try {
            const frameDataUrl = await renderStripFrame(matched.templateData.elements, cw, ch, matched.templateData.color || '#ffffff', 720);
            const bgFrameDataUrl = await removeGreenScreen(frameDataUrl, 720);
            const img = new window.Image();
            img.onload = () => setFrameRatio(img.naturalWidth / img.naturalHeight);
            img.src = bgFrameDataUrl;
            setKeyedFrameImage(bgFrameDataUrl);
          } catch {}
          setStripLoading(false);
        } else {
          setStripLoading(false);
        }
      } else {
        const fallback = TEMPLATE_CONFIGS[templateId];
        if (fallback) {
          setTemplateData({ templateId, templateName: fallback.name, templateData: { slots: fallback.slots, color: '#ffffff', canvasWidth: 1000, canvasHeight: 3000, type: 'frame', elements: [], slotsLayout: [] }, templatePrice: 35000, templateDesc: '' } as TemplateData);
        }
      }
    };
    loadTemplate();
  }, [templateId]);

  const handleAddCapture = useCallback((url: string, slotIdx?: number) => {
    setCaptures((prev) => {
      if (slotIdx !== undefined && slotIdx >= 0) {
        const n = [...prev];
        while (n.length <= slotIdx) n.push('');
        n[slotIdx] = url;
        return n;
      }
      const idx = prev.findIndex((c) => c === '');
      if (idx !== -1) { const n = [...prev]; n[idx] = url; return n; }
      return [...prev, url];
    });
  }, []);

  const handleDeleteCapture = (idx: number) => {
    setCaptures((prev) => { const n = [...prev]; n[idx] = ''; return n; });
  };

  useEffect(() => {
    setPhotoAdjust(captures.map(() => ({ scale: 1, x: 0, y: 0, brightness: 100, contrast: 100, saturation: 100, temperature: 0 })));
  }, [captures]);

  useEffect(() => {
    if (!captures.length || !templateData?.templateData?.slotsLayout?.length) return;
    const outW = templateData.templateData?.canvasWidth || 1000;
    const frameSrc = keyedFrameImage || templateData.templateFull || '';
    const hasPreComposed = !!frameSrc;
    if (!hasPreComposed && templateData.templateData?.type === 'strip' && templateData.templateData?.elements?.length) {
      composeStripImage(
        templateData.templateData?.elements, templateData.templateData?.color || '#ffffff',
        captures, photoAdjust,
        outW, templateData.templateData?.canvasHeight || 3000, outW,
      ).then(setCompositedImage).catch(() => {});
    } else if (frameSrc) {
      composeFrameImage(frameSrc, templateData.templateData?.slotsLayout, captures, photoAdjust, templateData.templateData?.color || '#ffffff', outW)
        .then(setCompositedImage)
        .catch(() => {});
    }
  }, [captures, photoAdjust, templateData, keyedFrameImage]);

  const slotsCount = templateData?.templateData?.slots || TEMPLATE_CONFIGS[templateId || '']?.slots || 3;
  const filledCount = useMemo(() => captures.filter((c) => c !== '').length, [captures]);

  const timerBadge = (step >= 1 && step <= 5 && sessionTimer > 0 && timeLeft > 0) ? (
    <div style={{
      position:'fixed', top:12, right:16, zIndex:100,
      display:'flex', alignItems:'center', gap:6,
      padding:'6px 14px', borderRadius:8,
      background:'rgba(0,0,0,0.6)', color:'#fff',
      fontSize:13, fontWeight:600, fontFamily:'monospace',
      letterSpacing:0.5, backdropFilter:'blur(4px)',
    }}>
      <Timer size={14} />
      {formatTime(timeLeft)}
    </div>
  ) : null;

  let content: React.ReactNode = null;

  if (step === 1) content = <TemplateStep templates={cachedTemplates || []} loading={templatesLoading} onSelect={handleSelectTemplate} onBack={() => setStep(0)} />;

  if (step === 2) content = (
    <BoothStep
      templateId={templateId || 't1'}
      templateName={templateData?.templateName || TEMPLATE_CONFIGS[templateId || '']?.name || ''}
      slotsCount={slotsCount}
      filledCount={filledCount}
      captures={captures}
      onAddCapture={handleAddCapture}
      onDeleteCapture={handleDeleteCapture}
      templateData={templateData}
      keyedFrameImage={keyedFrameImage}
      frameRatio={frameRatio}
      stripLoading={stripLoading}
      onNext={() => setStep(3)}
      onBack={() => { setStep(1); setCaptures([]); setKeyedFrameImage(''); setStripLoading(false); }}
    />
  );

  if (step === 3) content = (
    <EditorStep
      captures={captures}
      templateData={templateData}
      keyedFrameImage={keyedFrameImage}
      frameRatio={frameRatio}
      photoAdjust={photoAdjust}
      setPhotoAdjust={setPhotoAdjust}
      selectedSlotIdx={selectedSlotIdx}
      setSelectedSlotIdx={setSelectedSlotIdx}
      selectedFilter={selectedFilter}
      setSelectedFilter={setSelectedFilter}
      onNext={() => setStep(4)}
      onBack={() => setStep(2)}
    />
  );

  if (step === 4) content = (
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
  );

  if (step === 5) content = (
    <ResultStep
      compositedImage={compositedImage}
      onHome={startOver}
    />
  );

  if (!content) return null;

  return (
    <>
      {timerBadge}
      <div className={styles.stepTransition}>{content}</div>
    </>
  );
}
