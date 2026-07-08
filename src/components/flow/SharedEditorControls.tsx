// File: src/components/flow/SharedEditorControls.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import type { PhotoAdjust } from '@/lib/types';
import type { ComponentType } from 'react';

export interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  display?: string;
}

interface SharedEditorControlsProps {
  currentAdjustment: PhotoAdjust;
  onBack: () => void;
  onRetakeAll: () => void;
  onProceed: () => void;
  onUpdateAdjustment: (patch: Partial<PhotoAdjust>) => void;
  SliderControl: ComponentType<SliderControlProps>;
  containerClassName?: string;
  headingClassName?: string;
  buttonClassName?: string;
  primaryButtonClassName?: string;
  secondaryButtonClassName?: string;
  retakeButtonClassName?: string;
  sectionClassName?: string;
}

// Shared editor controls are used by both theme variants.
// This component renders adjustment sliders and primary action buttons.
export default function SharedEditorControls({
  currentAdjustment,
  onBack,
  onRetakeAll,
  onProceed,
  onUpdateAdjustment,
  SliderControl,
  containerClassName,
  headingClassName,
  buttonClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  retakeButtonClassName,
  sectionClassName,
}: SharedEditorControlsProps) {
  return (
    <div className={containerClassName}>
      <button className={buttonClassName} onClick={onBack}>
        Back
      </button>
      <div className={sectionClassName}>
        <h4 className={headingClassName}>Adjustments</h4>
        <SliderControl
          label="Zoom"
          value={Math.round(currentAdjustment.scale * 100)}
          min={100}
          max={300}
          onChange={(value) => onUpdateAdjustment({ scale: value / 100 })}
          display={`${currentAdjustment.scale.toFixed(1)}x`}
        />
        <SliderControl
          label="Brightness"
          value={currentAdjustment.brightness}
          min={50}
          max={150}
          onChange={(value) => onUpdateAdjustment({ brightness: value })}
        />
        <SliderControl
          label="Contrast"
          value={currentAdjustment.contrast}
          min={50}
          max={150}
          onChange={(value) => onUpdateAdjustment({ contrast: value })}
        />
        <SliderControl
          label="Saturation"
          value={currentAdjustment.saturation}
          min={0}
          max={200}
          onChange={(value) => onUpdateAdjustment({ saturation: value })}
        />
        <SliderControl
          label="Temperature"
          value={currentAdjustment.temperature}
          min={-100}
          max={100}
          onChange={(value) => onUpdateAdjustment({ temperature: value })}
          display={currentAdjustment.temperature > 0 ? 'Warm' : currentAdjustment.temperature < 0 ? 'Cold' : 'Neutral'}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className={retakeButtonClassName} onClick={onRetakeAll}>
          Retake All
        </button>
        <button className={primaryButtonClassName} onClick={onProceed}>
          Proceed to Pay
        </button>
      </div>
    </div>
  );
}
