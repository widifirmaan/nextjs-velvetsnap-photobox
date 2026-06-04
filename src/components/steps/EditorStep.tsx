'use client';

import { ArrowLeft, Check, RefreshCcw } from 'lucide-react';
import styles from '@/app/page.module.css';
import StepperBar from './StepperBar';
import type { TemplateData, PhotoAdjust } from './types';

function AdjustSlider({ label, value, min, max, onChange, display }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; display?: string;
}) {
  return (
    <div className={styles.editorAdjustRow}>
      <span className={styles.editorAdjustLabel}>{label}</span>
      <input type="range" min={min} max={max} step={1}
        value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
        className={styles.editorSlider} />
      <span className={styles.editorAdjustValue}>{display ?? value}</span>
    </div>
  );
}

export default function EditorStep({
  captures, templateData, keyedFrameImage, frameRatio,
  photoAdjust, setPhotoAdjust,
  selectedSlotIdx, setSelectedSlotIdx,
  selectedFilter, setSelectedFilter,
  onNext, onBack,
}: {
  captures: string[]; templateData: TemplateData | null; keyedFrameImage: string; frameRatio: number;
  photoAdjust: PhotoAdjust[];
  setPhotoAdjust: React.Dispatch<React.SetStateAction<PhotoAdjust[]>>;
  selectedSlotIdx: number; setSelectedSlotIdx: (v: number) => void;
  selectedFilter: string; setSelectedFilter: (v: string) => void;
  onNext: () => void; onBack: () => void;
}) {
  const handleRetake = () => onBack();

  const hasTemplate = templateData && templateData.frameImage && templateData.slotsLayout && templateData.slotsLayout.length > 0;

  const slotSources = (templateData?.slotsLayout || []).map((_, idx) => captures[idx]);

  const sel = photoAdjust[selectedSlotIdx] || { scale: 1, x: 0, y: 0, brightness: 100, contrast: 100, saturation: 100, temperature: 0, sharpen: 0 };

  const updateSlot = (idx: number, patch: Partial<PhotoAdjust>) => {
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
        <div className={styles.editorPreview}>
          {hasTemplate ? (
            <div className={styles.editorFrame} style={{ height: 'min(75vh, 600px)', aspectRatio: frameRatio, backgroundColor: templateData?.color || '#fff' }}>
              {(templateData?.slotsLayout || []).map((slot, idx) => {
                const src = captures[idx];
                if (!src) return null;
                return (
                  <div key={idx} style={{
                    position: 'absolute', left: `${slot.x}%`, top: `${slot.y}%`,
                    width: `${slot.w}%`, height: `${slot.h}%`, overflow: 'hidden', zIndex: 1,
                  }}>
                    <div
                      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
                    >
                      <img src={src} alt={`Slot ${idx}`}
                        className={selectedFilter === 'grayscale' ? styles.filterGray : selectedFilter === 'sepia' ? styles.filterSepia : ''}
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          transform: `scale(${photoAdjust[idx]?.scale || 1}) translate(${photoAdjust[idx]?.x || 0}%, ${photoAdjust[idx]?.y || 0}%)`,
                          transformOrigin: 'center', pointerEvents: 'none',
                          filter: slotCssFilter(idx),
                        }} />
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
                  style={{ transform: `scale(${photoAdjust[i]?.scale || 1})`, filter: slotCssFilter(i) }} />
              ))}
            </div>
          )}
        </div>
        <div className={styles.editorSidebar}>
          <button className={styles.boothBtnSecondary} onClick={handleRetake} style={{ alignSelf: 'flex-start' }}>
            <ArrowLeft size={16} /> Back
          </button>

          <div className={styles.editorSlotGrid}>
            {slotSources.map((src, idx) => (
              <button key={idx}
                className={`${styles.editorSlotThumb} ${selectedSlotIdx === idx ? styles.editorSlotThumbActive : ''}`}
                onClick={() => setSelectedSlotIdx(idx)}>
                {src ? (
                  <img src={src} alt={`Slot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </button>
            ))}
          </div>

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
