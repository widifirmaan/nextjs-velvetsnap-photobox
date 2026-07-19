// File: src/app/(themes)/v1/editor/EditorStep.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import StepperBar from '../StepperBar';
import EditorFrame from './EditorFrame';
import AdjustSlider from './AdjustSlider';
import SharedEditorControls from '@/components/flow/SharedEditorControls';
import { TemplateData, PhotoAdjust, DEFAULT_ADJUST } from '../types';
import styles from '@/app/(themes)/v1/page.module.css';
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
            buttonClassName={styles.boothBtnSecondary}
            primaryButtonClassName={styles.boothBtnPrimary}
            retakeButtonClassName={`${styles.boothBtnSecondary} ${styles.editorRetakeBtn}`}
            sectionClassName={styles.editorAdjustSection}
          />
        </div>
      </div>
    </div>
  );
}
