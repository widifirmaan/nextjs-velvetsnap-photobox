// File: src/lib/hooks/usePhotoboothFlow.ts
// Description: Auto-added top comment for easier file identification.

'use client';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { removeGreenScreen, composeFrameImage, composeStripImage, renderStripFrame, stripElementsToSlotsLayout } from './canvas-utils';
import { getHighResUrl, getFullQualityUrl } from './cloudinary-url';
import { STORAGE_KEYS, FRAME_RENDER_MAX_W } from './constants';
import { TEMPLATE_CONFIGS, DEFAULT_ADJUST, type IStripElement, type TemplateData, type PhotoAdjust } from '@/lib/types';

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

  // Convert a time value in seconds to a human-readable mm:ss format.
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Reset the entire photobooth flow and clear session state.
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

  // Render the selected template frame and remove green screen background.
  const renderFrameFromElements = useCallback(async (elements: IStripElement[], canvasWidth: number, canvasHeight: number, backgroundColor: string) => {
    try {
      const frameDataUrl = await renderStripFrame(elements, canvasWidth, canvasHeight, backgroundColor, 720);
      const keyedDataUrl = await removeGreenScreen(frameDataUrl, FRAME_RENDER_MAX_W);
      const image = new window.Image();
      image.onload = () => setFrameRatio(image.naturalWidth / image.naturalHeight);
      image.src = keyedDataUrl;
      setKeyedFrameImage(keyedDataUrl);
    } catch (error) {
      console.error('renderFrameFromElements failed', error);
    }
  }, []);

  // Select a template and prepare the flow for booth capture.
  const handleSelectTemplate = useCallback((id: string, data?: TemplateData, keyedUrl?: string) => {
    setTemplateId(id);
    setStep(2);
    const canvasWidth = data?.templateData?.canvasWidth || 1000;
    const canvasHeight = data?.templateData?.canvasHeight || 3000;
    setFrameRatio(canvasWidth / canvasHeight);
    if (data) {
      setTemplateData(data);
      setPrice(data.templatePrice ?? 35000);
      if (data.templateFull && !keyedUrl) {
        setKeyedFrameImage(data.templateFull);
      }
    } else if (keyedUrl && cachedTemplates) {
      const found = cachedTemplates.find((template) => template.templateId === id);
      if (found) {
        setTemplateData(found);
        setPrice(found.templatePrice ?? 35000);
      }
    }
  }, [setStep, cachedTemplates]);

  // Background chroma-key render when template changes
  useEffect(() => {
    if (!templateData?.templateData?.elements?.length) return;
    const elements = templateData.templateData.elements;
    const canvasWidth = templateData.templateData.canvasWidth || 1000;
    const canvasHeight = templateData.templateData.canvasHeight || 3000;
    renderFrameFromElements(elements, canvasWidth, canvasHeight, templateData.templateData.color || '#ffffff');
  }, [templateData]);

  useEffect(() => {
    if (!templateId || templateData) return;
    const loadTemplate = async () => {
      setStripLoading(true);
      let matchedTemplate: TemplateData | undefined;
      try {
        const response = await fetch(`/api/templates/thumbnails?id=${templateId}`);
        const responseData = await response.json();
        if (responseData.success && responseData.data?.length) matchedTemplate = responseData.data[0];
      } catch (error) {
        console.error('usePhotoboothFlow: failed to load thumbnails', error);
      }
      if (matchedTemplate) {
        setTemplateData(matchedTemplate);
        setPrice(matchedTemplate.templatePrice ?? 35000);
        const canvasWidth = matchedTemplate.templateData.canvasWidth || 1000;
        const canvasHeight = matchedTemplate.templateData.canvasHeight || 3000;

        // Convert legacy (frameImage + slotsLayout) to elements
        if (!matchedTemplate.templateData.elements?.length && matchedTemplate.templateFull && matchedTemplate.templateData.slotsLayout?.length) {
          const elements: IStripElement[] = [];
          elements.push({
            id: 'bg', type: 'background',
            x: 0, y: 0, width: canvasWidth, height: canvasHeight,
            rotation: 0, zIndex: 0, visible: true,
            props: { stickerUrl: getHighResUrl(matchedTemplate.templateFull, canvasWidth, canvasHeight), opacity: 1 },
          });
          (matchedTemplate.templateData.slotsLayout || []).forEach((slot: { x: number; y: number; w: number; h: number }, index: number) => {
            elements.push({
              id: `slot-${index}`, type: 'photo-slot',
              x: (slot.x / 100) * canvasWidth, y: (slot.y / 100) * canvasHeight,
              width: (slot.w / 100) * canvasWidth, height: (slot.h / 100) * canvasHeight,
              rotation: 0, zIndex: 1, visible: true,
              props: { borderWidth: 2, borderColor: '#ffffff', borderRadius: 8, shape: 'rounded', opacity: 1 },
            });
          });
          matchedTemplate.templateData.elements = elements;
          matchedTemplate.templateData.type = 'strip';
        }

        // Always process elements (needed for editor/result compositing)
        if (matchedTemplate.templateData.elements?.length) {
          const slotsLayout = stripElementsToSlotsLayout(matchedTemplate.templateData.elements, canvasWidth, canvasHeight);
          matchedTemplate.templateData.slotsLayout = slotsLayout;
          if (!matchedTemplate.templateData.slots) matchedTemplate.templateData.slots = slotsLayout.length;
          matchedTemplate.templateData.elements = matchedTemplate.templateData.elements.map((element) =>
            element.type === 'background' && element.props.stickerUrl
              ? { ...element, props: { ...element.props, stickerUrl: getHighResUrl(element.props.stickerUrl, canvasWidth, canvasHeight) } }
              : element
          );
        }

        if (matchedTemplate.templateFull) {
          setKeyedFrameImage(getFullQualityUrl(matchedTemplate.templateFull));
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

  // Add a captured photo to the current capture list, either into a specific slot or the next empty slot.
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

  // Remove a capture from a specific slot, leaving an empty placeholder.
  const handleDeleteCapture = useCallback((idx: number) => {
    setCaptures((prev) => { const n = [...prev]; n[idx] = ''; return n; });
  }, []);

  useEffect(() => {
    if (!captures.length || !templateData?.templateData?.slotsLayout?.length) return;
    const adjustments = captures.map((_, index) => photoAdjust[index] || { ...DEFAULT_ADJUST });
    const outputWidth = templateData.templateData?.canvasWidth || 1000;
    const frameSource = keyedFrameImage || templateData.templateFull || '';
    const isPreComposedFrame = !!frameSource;
    const compositionId = ++compositingId.current;
    if (!isPreComposedFrame && templateData.templateData?.type === 'strip' && templateData.templateData?.elements?.length) {
      composeStripImage(
        templateData.templateData.elements,
        templateData.templateData.color || '#ffffff',
        captures,
        adjustments,
        outputWidth,
        templateData.templateData.canvasHeight || 3000,
        outputWidth,
      )
        .then((result) => { if (compositingId.current === compositionId) setCompositedImage(result); })
        .catch((error) => console.error('composeStripImage failed', error));
    } else if (frameSource) {
      composeFrameImage(frameSource, templateData.templateData?.slotsLayout, captures, adjustments, templateData.templateData?.color || '#ffffff', outputWidth)
        .then((result) => { if (compositingId.current === compositionId) setCompositedImage(result); })
        .catch((error) => console.error('composeFrameImage failed', error));
    }
  }, [captures, photoAdjust, templateData, keyedFrameImage]);

  // When payment succeeds, store the transaction ID and move to the result step.
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
