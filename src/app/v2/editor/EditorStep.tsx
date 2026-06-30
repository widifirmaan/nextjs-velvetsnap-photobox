'use client';
import { ArrowLeft, RefreshCcw, Check } from 'lucide-react';
import styles from '../page.module.css';
import EditorFrame from './EditorFrame';
import AdjustSlider from './AdjustSlider';
import { TemplateData, DEFAULT_ADJUST, type PhotoAdjust } from '../types';
import { clampPhotoAdjust, computeSlotCssFilter } from '@/lib/adjust-utils';

export default function EditorStep({
  captures, templateData, keyedFrameImage, frameRatio,
  photoAdjust, setPhotoAdjust,
  selectedSlotIdx, setSelectedSlotIdx,
  selectedFilter,
  onNext, onBack,
}: {
  captures: string[]; templateData: TemplateData | null; keyedFrameImage: string; frameRatio: number;
  photoAdjust: PhotoAdjust[];
  setPhotoAdjust: React.Dispatch<React.SetStateAction<PhotoAdjust[]>>;
  selectedSlotIdx: number; setSelectedSlotIdx: (v: number) => void;
  selectedFilter: string;
  onNext: () => void; onBack: () => void;
}) {
  const handleRetake = () => onBack();

  const sel = photoAdjust[selectedSlotIdx] || DEFAULT_ADJUST;

  const updateSlot = (idx: number, patch: Partial<typeof sel>) => {
    setPhotoAdjust((prev) => clampPhotoAdjust(prev, idx, patch));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className={styles.editorLayout}>
        <EditorFrame
          captures={captures}
          templateData={templateData}
          keyedFrameImage={keyedFrameImage}
          frameRatio={frameRatio}
          photoAdjust={photoAdjust}
          selectedSlotIdx={selectedSlotIdx}
          setSelectedSlotIdx={setSelectedSlotIdx}
          selectedFilter={selectedFilter}
          slotCssFilter={(idx: number) => computeSlotCssFilter(photoAdjust[idx])}
          onAdjustSlot={updateSlot}
        />
        <div className={styles.editorSidebar}>
          <button className={styles.boothBtn} onClick={handleRetake} style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: 11 }}>
            <ArrowLeft size={14} /> Back
          </button>

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
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className={`${styles.boothBtn} ${styles.editorRetakeBtn}`} onClick={handleRetake}>
              <RefreshCcw size={14} /> Retake All
            </button>
            <button className={`${styles.boothBtn} ${styles.boothBtnPrimary}`} onClick={onNext}>
              <Check size={16} /> Proceed to Pay
            </button>
          </div>
        </div>
      </div>
      <div className={styles.newspaperFooter}>
        <div className={styles.mastheadMeta}>
          <span>VelvetSnap Photobooth</span>
          <a href="/admin/login" className={styles.mastheadLink}>Admin</a>
        </div>
      </div>
    </div>
  );
}
