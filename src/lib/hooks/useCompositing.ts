'use client';
import { useState, useEffect, useRef } from 'react';
import { composeFrameImage, composeStripImage, type ISlot } from '@/lib/canvas-utils';
import type { PhotoAdjust, IStripElement } from '@/app/main/types';

interface TemplateDataLike {
  templateData?: {
    slotsLayout?: ISlot[];
    elements?: IStripElement[];
    canvasWidth?: number;
    canvasHeight?: number;
    color?: string;
    type?: string;
  };
  templateFull?: string;
}

interface UseCompositingOptions {
  captures: string[];
  photoAdjust: PhotoAdjust[];
  templateData: TemplateDataLike | null;
  keyedFrameImage: string;
  debounceMs?: number;
}

export function useCompositing({
  captures, photoAdjust, templateData, keyedFrameImage, debounceMs = 200,
}: UseCompositingOptions) {
  const [compositedImage, setCompositedImage] = useState<string | null>(null);
  const [compositing, setCompositing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!captures.length || !templateData?.templateData?.slotsLayout?.length) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    timerRef.current = setTimeout(async () => {
      setCompositing(true);
      const outW = templateData.templateData?.canvasWidth || 1000;
      const frameSrc = keyedFrameImage || templateData.templateFull || '';
      const hasPreComposed = !!frameSrc;
      const elements = templateData.templateData?.elements;

      try {
        if (!hasPreComposed && templateData.templateData?.type === 'strip' && elements?.length) {
          const result = await composeStripImage(
            elements, templateData.templateData?.color || '#ffffff',
            captures, photoAdjust,
            outW, templateData.templateData?.canvasHeight || 3000, outW,
          );
          if (!abort.signal.aborted) setCompositedImage(result);
        } else if (frameSrc && templateData?.templateData?.slotsLayout) {
          const result = await composeFrameImage(
            frameSrc, templateData.templateData.slotsLayout, captures, photoAdjust,
            templateData.templateData.color || '#ffffff', outW,
          );
          if (!abort.signal.aborted) setCompositedImage(result);
        }
      } catch {} finally {
        if (!abort.signal.aborted) setCompositing(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abort.abort();
    };
  }, [captures, photoAdjust, templateData, keyedFrameImage, debounceMs]);

  return { compositedImage, compositing };
}
