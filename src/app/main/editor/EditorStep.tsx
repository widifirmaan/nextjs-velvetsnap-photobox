'use client';
import { ArrowLeft, RefreshCcw, Check } from 'lucide-react';
import StepperBar from '../StepperBar';
import EditorFrame from './EditorFrame';
import SlotSelector from './SlotSelector';
import AdjustSlider from './AdjustSlider';
import { TemplateData, PhotoAdjust } from '../types';
import styles from '@/app/main/page.module.css';

export default function EditorStep({
  captures, templateData, keyedFrameImage, frameRatio,
  photoAdjust, setPhotoAdjust,
  selectedSlotIdx, setSelectedSlotIdx,
  selectedFilter, setSelectedFilter,
  onNext, onBack,
}: {
  captures: string[]; templateData: TemplateData | null; keyedFrameImage: string; frameRatio: number;
  photoAdjust: { scale: number; x: number; y: number; brightness: number; contrast: number; saturation: number; temperature: number; sharpen: number }[];
  setPhotoAdjust: React.Dispatch<React.SetStateAction<{ scale: number; x: number; y: number; brightness: number; contrast: number; saturation: number; temperature: number; sharpen: number }[]>>;
  selectedSlotIdx: number; setSelectedSlotIdx: (v: number) => void;
  selectedFilter: string; setSelectedFilter: (v: string) => void;
  onNext: () => void; onBack: () => void;
}) {
  const handleRetake = () => onBack();

  const hasTemplate = templateData && templateData.frameImage && templateData.slotsLayout && templateData.slotsLayout.length > 0;

  const slotSources = (templateData?.slotsLayout || []).map((_, idx) => captures[idx]);

  const sel = photoAdjust[selectedSlotIdx] || { scale: 1, x: 0, y: 0, brightness: 100, contrast: 100, saturation: 100, temperature: 0, sharpen: 0 };

  const updateSlot = (idx: number, patch: Partial<typeof sel>) => {
    setPhotoAdjust((prev) => {
      const next = prev.map((a) => ({ ...a }));
      if (!next[idx]) next[idx] = { scale: 1, x: 0, y: 0, brightness: 100, contrast: 100, saturation: 100, temperature: 0, sharpen: 0 };
      Object.assign(next[idx], patch);
      return next;
    });
  };

  const slotCssFilter = (idx: number) => {
    const a = photoAdjust[idx];
    if (!a) return '';
    const t = a.temperature;
    const hueRotate = t * 0.25;
    const warmSepia = t > 0 ? t * 0.08 : 0;
    const blur = a.sharpen < 0 ? `blur(${Math.abs(a.sharpen) * 0.04}px)` : '';
    return `brightness(${a.brightness}%) contrast(${a.contrast}%) saturate(${a.saturation}%) hue-rotate(${hueRotate}deg) sepia(${warmSepia}%)${blur}`;
  };

  return (
    <div className={`${styles.stepPage} ${styles.stepPageEditor}`}>
      <StepperBar current={2} total={5} />
      <div className={styles.editorLayout}>
        <EditorFrame
          captures={captures}
          templateData={templateData}
          keyedFrameImage={keyedFrameImage}
          frameRatio={frameRatio}
          photoAdjust={photoAdjust}
          selectedSlotIdx={selectedSlotIdx}
          selectedFilter={selectedFilter}
          slotCssFilter={slotCssFilter}
        />
        <div className={styles.editorSidebar}>
          <button className={styles.boothBtnSecondary} onClick={handleRetake} style={{ alignSelf: 'flex-start' }}>
            <ArrowLeft size={16} /> Back
          </button>

          <SlotSelector
            slotSources={slotSources}
            selectedSlotIdx={selectedSlotIdx}
            setSelectedSlotIdx={setSelectedSlotIdx}
          />

          <div className={styles.editorAdjustSection}>
            <h4>Adjustments</h4>
            <AdjustSlider label="Zoom" value={Math.round(sel.scale * 100)} min={100} max={300}
              onChange={(v) => updateSlot(selectedSlotIdx, { scale: v / 100 })}
              display={`${sel.scale.toFixed(1)}x`} />
            <AdjustSlider label="Brightness" value={sel.brightness} min={50} max={150}
              onChange={(v) => updateSlot(selectedSlotIdx, { brightness: v })} />
            <AdjustSlider label="Contrast" value={sel.contrast} min={50} max={150}
              onChange={(v) => updateSlot(selectedSlotIdx, { contrast: v })} />
            <AdjustSlider label="Saturation" value={sel.saturation} min={0} max={200}
              onChange={(v) => updateSlot(selectedSlotIdx, { saturation: v })} />
            <AdjustSlider label="Temp" value={sel.temperature} min={-100} max={100}
              onChange={(v) => updateSlot(selectedSlotIdx, { temperature: v })}
              display={`${sel.temperature > 0 ? 'Warm' : sel.temperature < 0 ? 'Cold' : 'Neutral'}`} />
            <AdjustSlider label="Smooth" value={sel.sharpen} min={-100} max={100}
              onChange={(v) => updateSlot(selectedSlotIdx, { sharpen: v })}
              display={`${sel.sharpen > 0 ? 'Sharpen' : sel.sharpen < 0 ? 'Smooth' : 'None'}`} />
          </div>

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
