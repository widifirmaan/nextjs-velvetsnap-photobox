// File: src/app/(themes)/v2/editor/EditorStep.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import SharedEditorControls from '@/components/flow/SharedEditorControls';
import styles from '../page.module.css';
import EditorFrame from './EditorFrame';
import AdjustSlider from './AdjustSlider';
import { TemplateData, DEFAULT_ADJUST, type PhotoAdjust } from '../types';
import { clampPhotoAdjust, computeSlotCssFilter } from '@/lib/utils/adjust-utils';

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
  const handleBack = () => onBack();

  const currentAdjustment = photoAdjust[selectedSlotIdx] || DEFAULT_ADJUST;

  const updateSlot = (idx: number, patch: Partial<typeof currentAdjustment>) => {
    setPhotoAdjust((previous) => clampPhotoAdjust(previous, idx, patch));
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
          <SharedEditorControls
            currentAdjustment={currentAdjustment}
            onBack={handleBack}
            onRetakeAll={handleBack}
            onProceed={onNext}
            onUpdateAdjustment={(patch) => updateSlot(selectedSlotIdx, patch)}
            SliderControl={AdjustSlider}
            buttonClassName={styles.boothBtn}
            primaryButtonClassName={`${styles.boothBtn} ${styles.boothBtnPrimary}`}
            secondaryButtonClassName={styles.boothBtn}
            retakeButtonClassName={`${styles.boothBtn} ${styles.editorRetakeBtn}`}
            sectionClassName={styles.editorAdjustSection}
          />
        </div>
      </div>
      <div className={styles.newspaperFooter}>
        <div className={styles.mastheadMeta}>
          <span>VelvetSnap Photobooth</span>
        </div>
      </div>
    </div>
  );
}
