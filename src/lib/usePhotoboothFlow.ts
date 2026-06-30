'use client';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { removeGreenScreen, composeFrameImage, composeStripImage, renderStripFrame, stripElementsToSlotsLayout } from './canvas-utils';
import { getHighResUrl, getFullQualityUrl } from './cloudinary-url';
import { STORAGE_KEYS, FRAME_RENDER_MAX_W } from './constants';
import { TEMPLATE_CONFIGS, DEFAULT_ADJUST, type IStripElement, type TemplateData, type PhotoAdjust } from '@/app/v1/types';

export interface PhotoboothFlowOptions {
  step: number;
  setStep: (s: number) => void;
  onRefresh?: () => void;
  sessionTimer: number;
}

export interface PhotoboothFlowResult {
  templateId: string | null;
  templateData: TemplateData | null;
  captures: string[];
  photoAdjust: PhotoAdjust[];
  selectedSlotIdx: number;
  keyedFrameImage: string;
  frameRatio: number;
  stripLoading: boolean;
  compositedImage: string | null;
  price: number;
  paid: boolean;
  errMsg: string | null;
  txId: string | null;
  cachedTemplates: TemplateData[] | null;
  templatesLoading: boolean;
  timeLeft: number;
  filledCount: number;
  slotsCount: number;
  handleSelectTemplate: (id: string, data?: TemplateData, keyedUrl?: string) => void;
  handleAddCapture: (url: string, slotIdx?: number) => void;
  handleDeleteCapture: (idx: number) => void;
  handlePaymentSuccess: (id: string) => void;
  startOver: () => void;
  setPaid: React.Dispatch<React.SetStateAction<boolean>>;
  setErrMsg: React.Dispatch<React.SetStateAction<string | null>>;
  setPhotoAdjust: React.Dispatch<React.SetStateAction<PhotoAdjust[]>>;
  setSelectedSlotIdx: React.Dispatch<React.SetStateAction<number>>;
  setCaptures: React.Dispatch<React.SetStateAction<string[]>>;
  formatTime: (s: number) => string;
}

export function usePhotoboothFlow({ step, setStep, onRefresh, sessionTimer }: PhotoboothFlowOptions): PhotoboothFlowResult {
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

  const startOver = useCallback(() => {
    try { if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEYS.PHOTOBOOTH_SESSION); } catch {}
    onRefresh?.();
    setStep(0);
    setCaptures([]);
    setTemplateId(null);
    setTemplateData(null);
    setCompositedImage(null);
    setPaid(false);
    setErrMsg(null);
    setKeyedFrameImage('');
    setStripLoading(false);
  }, [onRefresh, setStep]);

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
    // Prefer the live global promise so stale sessionStorage doesn't
    // cause an empty-state flash when the API already has data.
    const globalPromise = typeof window !== 'undefined' ? (window as any).__templatePromise : null;
    if (globalPromise) {
      globalPromise.then((res: any) => {
        if (res.success && res.data?.length) {
          const list = res.data.filter((t: TemplateData) => t.isActive !== false);
          setCachedTemplates(list);
          const raw = JSON.stringify(list);
          if (raw.length < 4_000_000) sessionStorage.setItem(STORAGE_KEYS.TEMPLATES, raw);
        }
        setTemplatesLoading(false);
      }).catch(() => setTemplatesLoading(false));
      return;
    }
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEYS.TEMPLATES) : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TemplateData[];
        setCachedTemplates(parsed);
        setTemplatesLoading(false);
        return;
      } catch (e) { console.error('usePhotoboothFlow: failed to parse cached templates', e); }
    }
    const accountId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ACCOUNT) : null;
    const url = accountId ? `/api/templates/list?accountId=${encodeURIComponent(accountId)}` : '/api/templates/list';
    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success || !res.data?.length) { setTemplatesLoading(false); return; }
        const list = res.data.filter((t: TemplateData) => t.isActive !== false);
        setCachedTemplates(list);
        const raw = JSON.stringify(list);
        if (raw.length < 4_000_000) sessionStorage.setItem(STORAGE_KEYS.TEMPLATES, raw);
        setTemplatesLoading(false);
      })
      .catch((e) => { console.error('Failed to fetch templates', e); setTemplatesLoading(false); });
  }, []);

  const renderFrameFromElements = useCallback(async (elements: IStripElement[], cw: number, ch: number, bgColor: string) => {
    try {
      const frameDataUrl = await renderStripFrame(elements, cw, ch, bgColor, 720);
      const bgFrameDataUrl = await removeGreenScreen(frameDataUrl, FRAME_RENDER_MAX_W);
      const img = new window.Image();
      img.onload = () => setFrameRatio(img.naturalWidth / img.naturalHeight);
      img.src = bgFrameDataUrl;
      setKeyedFrameImage(bgFrameDataUrl);
    } catch (e) { console.error('renderFrameFromElements failed', e); }
  }, []);

  const handleSelectTemplate = useCallback((id: string, data?: TemplateData, keyedUrl?: string) => {
    setTemplateId(id);
    setStep(2);
    const cw = data?.templateData?.canvasWidth || 1000;
    const ch = data?.templateData?.canvasHeight || 3000;
    setFrameRatio(cw / ch);
    if (data) {
      setTemplateData(data);
      setPrice(data.templatePrice ?? 35000);
      if (data.templateFull && !keyedUrl) {
        setKeyedFrameImage(data.templateFull);
      }
    } else if (keyedUrl && cachedTemplates) {
      const found = cachedTemplates.find(t => t.templateId === id);
      if (found) {
        setTemplateData(found);
        setPrice(found.templatePrice ?? 35000);
      }
    }
  }, [setStep, cachedTemplates]);

  // Background chroma-key render when template changes
  useEffect(() => {
    if (!templateData?.templateData?.elements?.length) return;
    const els = templateData.templateData.elements;
    const cw = templateData.templateData.canvasWidth || 1000;
    const ch = templateData.templateData.canvasHeight || 3000;
    renderFrameFromElements(els, cw, ch, templateData.templateData.color || '#ffffff');
  }, [templateData]);

  useEffect(() => {
    if (!templateId || templateData) return;
    const loadTemplate = async () => {
      setStripLoading(true);
      let matched: TemplateData | undefined;
      try {
        const res = await fetch(`/api/templates/thumbnails?id=${templateId}`);
        const data = await res.json();
        if (data.success && data.data?.length) matched = data.data[0];
      } catch (e) { console.error('usePhotoboothFlow: failed to load thumbnails', e); }
      if (matched) {
        setTemplateData(matched);
        setPrice(matched.templatePrice ?? 35000);

        const cw = matched.templateData.canvasWidth || 1000;
        const ch = matched.templateData.canvasHeight || 3000;

        // Convert legacy (frameImage + slotsLayout) to elements
        if (!matched.templateData.elements?.length && matched.templateFull && matched.templateData.slotsLayout?.length) {
          const els: IStripElement[] = [];
          els.push({
            id: 'bg', type: 'background',
            x: 0, y: 0, width: cw, height: ch,
            rotation: 0, zIndex: 0, visible: true,
            props: { stickerUrl: getHighResUrl(matched.templateFull, cw, ch), opacity: 1 },
          });
          (matched.templateData.slotsLayout || []).forEach((slot: { x: number; y: number; w: number; h: number }, i: number) => {
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

        if (matched.templateFull) {
          setKeyedFrameImage(getFullQualityUrl(matched.templateFull));
        }
        setStripLoading(false);
      } else {
        const fallback = TEMPLATE_CONFIGS[templateId];
        if (fallback) {
          setTemplateData({ templateId, templateName: fallback.name, templateData: { slots: fallback.slots, color: '#ffffff', canvasWidth: 1000, canvasHeight: 3000, type: 'frame', elements: [], slotsLayout: [] }, templatePrice: 35000, templateDesc: '' } as TemplateData);
        }
        setStripLoading(false);
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

  const handleDeleteCapture = useCallback((idx: number) => {
    setCaptures((prev) => { const n = [...prev]; n[idx] = ''; return n; });
  }, []);

  useEffect(() => {
    if (!captures.length || !templateData?.templateData?.slotsLayout?.length) return;
    const adjs = captures.map((_, i) => photoAdjust[i] || { ...DEFAULT_ADJUST });
    const outW = templateData.templateData?.canvasWidth || 1000;
    const frameSrc = keyedFrameImage || templateData.templateFull || '';
    const hasPreComposed = !!frameSrc;
    const id = ++compositingId.current;
    if (!hasPreComposed && templateData.templateData?.type === 'strip' && templateData.templateData?.elements?.length) {
      composeStripImage(
        templateData.templateData?.elements, templateData.templateData?.color || '#ffffff',
        captures, adjs,
        outW, templateData.templateData?.canvasHeight || 3000, outW,
      ).then(result => { if (compositingId.current === id) setCompositedImage(result); }).catch(e => console.error('composeStripImage failed', e));
    } else if (frameSrc) {
      composeFrameImage(frameSrc, templateData.templateData?.slotsLayout, captures, adjs, templateData.templateData?.color || '#ffffff', outW)
        .then(result => { if (compositingId.current === id) setCompositedImage(result); })
        .catch(e => console.error('composeFrameImage failed', e));
    }
  }, [captures, photoAdjust, templateData, keyedFrameImage]);

  const handlePaymentSuccess = useCallback((id: string) => {
    setTxId(id);
    setStep(5);
  }, []);

  const slotsCount = templateData?.templateData?.slots || TEMPLATE_CONFIGS[templateId || '']?.slots || 3;
  const filledCount = useMemo(() => captures.filter((c) => c !== '').length, [captures]);

  return {
    templateId, templateData, captures, photoAdjust, selectedSlotIdx,
    keyedFrameImage, frameRatio, stripLoading, compositedImage,
    price, paid, errMsg, txId, cachedTemplates, templatesLoading, timeLeft,
    filledCount, slotsCount,
    handleSelectTemplate, handleAddCapture, handleDeleteCapture,
    handlePaymentSuccess, startOver,
    setPaid, setErrMsg, setPhotoAdjust, setSelectedSlotIdx, setCaptures,
    formatTime,
  };
}
