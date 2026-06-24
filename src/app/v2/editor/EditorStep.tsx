'use client';
import { ArrowLeft, RefreshCcw, Check } from 'lucide-react';
import styles from '../page.module.css';
import EditorFrame from './EditorFrame';
import AdjustSlider from './AdjustSlider';
import { TemplateData, PhotoAdjust, DEFAULT_ADJUST } from '../types';

export default function EditorStep({
  captures, templateData, keyedFrameImage, frameRatio,
  photoAdjust, setPhotoAdjust, selectedSlotIdx, setSelectedSlotIdx,
  onNext, onBack,
}: {
  captures: string[]; templateData: TemplateData | null; keyedFrameImage: string; frameRatio: number;
  photoAdjust: PhotoAdjust[]; setPhotoAdjust: React.Dispatch<React.SetStateAction<PhotoAdjust[]>>;
  selectedSlotIdx: number; setSelectedSlotIdx: (v: number) => void;
  onNext: () => void; onBack: () => void;
}) {
  const sel = photoAdjust[selectedSlotIdx] || DEFAULT_ADJUST;

  const updateSlot = (idx: number, patch: Partial<typeof sel>) => {
    setPhotoAdjust((prev) => {
      const next = prev.map((a) => ({ ...a }));
      if (!next[idx]) next[idx] = { ...DEFAULT_ADJUST };
      if ('scale' in patch) {
        const s = patch.scale || 1;
        const maxT = Math.max(0, (1 - 1 / s) / 2 * 100);
        next[idx].x = Math.max(-maxT, Math.min(maxT, next[idx].x || 0));
        next[idx].y = Math.max(-maxT, Math.min(maxT, next[idx].y || 0));
      } else {
        const s = next[idx].scale || 1;
        const maxT = Math.max(0, (1 - 1 / s) / 2 * 100);
        if ('x' in patch) patch.x = Math.max(-maxT, Math.min(maxT, patch.x!));
        if ('y' in patch) patch.y = Math.max(-maxT, Math.min(maxT, patch.y!));
      }
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
    return `brightness(${a.brightness}%) contrast(${a.contrast}%) saturate(${a.saturation}%) hue-rotate(${hueRotate}deg) sepia(${warmSepia}%)`;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className={styles.editorLayout}>
        <EditorFrame captures={captures} templateData={templateData} keyedFrameImage={keyedFrameImage} frameRatio={frameRatio}
          photoAdjust={photoAdjust} selectedSlotIdx={selectedSlotIdx} setSelectedSlotIdx={setSelectedSlotIdx}
          slotCssFilter={slotCssFilter} onAdjustSlot={updateSlot} />
        <div className={styles.editorSidebar}>
          <button className={styles.boothBtn} onClick={onBack} style={{ padding: '8px 16px', fontSize: 11, alignSelf: 'flex-start' }}>
            <ArrowLeft size={14} /> BACK
          </button>
          <div className={styles.editorAdjustSection}>
            <h4>ADJUSTMENTS</h4>
            <AdjustSlider label="ZOOM" value={Math.round(sel.scale * 100)} min={100} max={300}
              onChange={(v) => updateSlot(selectedSlotIdx, { scale: v / 100 })} display={`${sel.scale.toFixed(1)}x`} />
            <AdjustSlider label="BRIGHTNESS" value={sel.brightness} min={50} max={150}
              onChange={(v) => updateSlot(selectedSlotIdx, { brightness: v })} />
            <AdjustSlider label="CONTRAST" value={sel.contrast} min={50} max={150}
              onChange={(v) => updateSlot(selectedSlotIdx, { contrast: v })} />
            <AdjustSlider label="SATURATION" value={sel.saturation} min={0} max={200}
              onChange={(v) => updateSlot(selectedSlotIdx, { saturation: v })} />
            <AdjustSlider label="TEMP" value={sel.temperature} min={-100} max={100}
              onChange={(v) => updateSlot(selectedSlotIdx, { temperature: v })}
              display={`${sel.temperature > 0 ? 'WARM' : sel.temperature < 0 ? 'COLD' : 'NEUTRAL'}`} />
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className={`${styles.boothBtn} ${styles.editorRetakeBtn}`} onClick={onBack}>
              <RefreshCcw size={14} /> RETAKE ALL
            </button>
            <button className={`${styles.boothBtn} ${styles.boothBtnPrimary}`} onClick={onNext} style={{ width: '100%' }}>
              <Check size={16} /> PROCEED TO PAY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
