// File: src/components/flow/SharedEditorFrame.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { useCallback, useRef } from 'react';
import { Pencil } from 'lucide-react';
import type { CSSProperties } from 'react';
import { DEFAULT_ADJUST, type PhotoAdjust, type TemplateData } from '@/lib/types';

interface SharedEditorFrameProps {
  captures: string[];
  templateData: TemplateData | null;
  keyedFrameImage: string;
  frameRatio: number;
  photoAdjust: PhotoAdjust[];
  selectedSlotIdx: number;
  setSelectedSlotIdx: (idx: number) => void;
  selectedFilter: string;
  slotCssFilter: (idx: number) => string;
  onAdjustSlot: (idx: number, patch: Partial<PhotoAdjust>) => void;
  previewClassName?: string;
  frameClassName?: string;
  simplePreviewClassName?: string;
  selectedGrayClassName?: string;
  selectedSepiaClassName?: string;
  formatFrameUrl?: (url: string) => string;
  frameStyle?: CSSProperties;
  pencilWrapperStyle?: CSSProperties;
}

// DraggablePhoto renders a single captured image inside a photo slot.
// It supports pointer drag to pan the image inside the slot and selection state.
function DraggablePhoto({
  src,
  slotIdx,
  selected,
  adjust,
  cssFilter,
  selectedFilter,
  selectedGrayClassName,
  selectedSepiaClassName,
  onSelect,
  onAdjust,
}: {
  src: string;
  slotIdx: number;
  selected: boolean;
  adjust: PhotoAdjust;
  cssFilter: string;
  selectedFilter: string;
  selectedGrayClassName?: string;
  selectedSepiaClassName?: string;
  onSelect: () => void;
  onAdjust: (idx: number, patch: Partial<PhotoAdjust>) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; maxT: number; moving: boolean }>({ startX: 0, startY: 0, origX: 0, origY: 0, maxT: 0, moving: false });

  const clamp = (value: number, max: number) => Math.max(-max, Math.min(max, value));

  // Start dragging the photo when the pointer goes down inside the slot.
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      elRef.current?.setPointerCapture(event.pointerId);
      const maxT = Math.max(0, ((1 - 1 / (adjust.scale || 1)) / 2) * 100);
      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        origX: adjust.x || 0,
        origY: adjust.y || 0,
        maxT,
        moving: false,
      };
    },
    [adjust.scale, adjust.x, adjust.y]
  );

  // Update position while dragging, clamping movement so the image does not escape the slot.
  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (dragRef.current.startX === 0 && dragRef.current.startY === 0) return;
      const el = event.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      const dx = ((event.clientX - dragRef.current.startX) / rect.width) * 100;
      const dy = ((event.clientY - dragRef.current.startY) / rect.height) * 100;
      if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) dragRef.current.moving = true;
      onAdjust(slotIdx, {
        x: clamp(dragRef.current.origX + dx, dragRef.current.maxT),
        y: clamp(dragRef.current.origY + dy, dragRef.current.maxT),
      });
    },
    [onAdjust, slotIdx]
  );

  // End dragging and select the image if the user did not move it.
  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      elRef.current?.releasePointerCapture(event.pointerId);
      if (!dragRef.current.moving) onSelect();
      dragRef.current.startX = 0;
      dragRef.current.startY = 0;
    },
    [onSelect]
  );

  return (
    <div
      ref={elRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'grab',
        touchAction: 'none',
        outline: selected ? '3px solid #fff' : 'none',
        outlineOffset: '-3px',
        borderRadius: '2px',
      }}
    >
      <img
        src={src}
        alt={`Slot ${slotIdx}`}
        draggable={false}
        className={selectedFilter === 'grayscale' ? selectedGrayClassName : selectedFilter === 'sepia' ? selectedSepiaClassName : ''}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
          transform: `scale(${adjust.scale || 1}) translate(${adjust.x || 0}%, ${adjust.y || 0}%)`,
          transformOrigin: 'center',
          filter: cssFilter,
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />
    </div>
  );
}

// Shared editor frame renders all captured photos in their template slots.
// It also overlays the selected frame and shows a selection indicator.
export default function SharedEditorFrame({
  captures,
  templateData,
  keyedFrameImage,
  photoAdjust,
  selectedSlotIdx,
  setSelectedSlotIdx,
  selectedFilter,
  slotCssFilter,
  onAdjustSlot,
  previewClassName,
  frameClassName,
  simplePreviewClassName,
  selectedGrayClassName,
  selectedSepiaClassName,
  formatFrameUrl,
  frameStyle,
  pencilWrapperStyle,
}: SharedEditorFrameProps) {
  const formatUrl = (url: string) => {
    if (!url) return url;
    if (formatFrameUrl) return formatFrameUrl(url);
    if (url.includes('res.cloudinary.com')) return url.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
    return url;
  };

  const frameSource = keyedFrameImage || templateData?.templateFull || '';

  return (
    <div className={previewClassName}>
      {templateData && templateData.templateFull && templateData.templateData.slotsLayout && templateData.templateData.slotsLayout.length > 0 ? (
        <div className={frameClassName} style={{ ...frameStyle, backgroundColor: templateData.templateData.color || '#fff' }}>
          {templateData.templateData.slotsLayout.map((slot, idx) => {
            const src = captures[idx];
            if (!src) return null;
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  width: `${slot.w}%`,
                  height: `${slot.h}%`,
                  overflow: 'hidden',
                  zIndex: 1,
                  borderRadius: '2px',
                }}
              >
                  <DraggablePhoto
                    src={src}
                    slotIdx={idx}
                    selected={selectedSlotIdx === idx}
                    adjust={photoAdjust[idx] || DEFAULT_ADJUST}
                    cssFilter={slotCssFilter(idx)}
                    selectedFilter={selectedFilter}
                    selectedGrayClassName={selectedGrayClassName}
                    selectedSepiaClassName={selectedSepiaClassName}
                    onSelect={() => setSelectedSlotIdx(idx)}
                    onAdjust={onAdjustSlot}
                  />
              </div>
            );
          })}
          <img
            src={formatUrl(frameSource)}
            alt="Frame"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}
          />
          {selectedSlotIdx >= 0 && selectedSlotIdx < (templateData.templateData.slotsLayout?.length || 0) && (() => {
            const s = templateData.templateData.slotsLayout[selectedSlotIdx];
            return (
              <div
                style={{
                  position: 'absolute',
                  left: `${s.x + s.w}%`,
                  top: `${s.y}%`,
                  width: 24,
                  height: 24,
                  zIndex: 3,
                  background: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  transform: 'translate(-50%, 4px)',
                  ...pencilWrapperStyle,
                }}
              >
                <Pencil size={14} color="#333" />
              </div>
            );
          })()}
        </div>
      ) : (
        <div className={simplePreviewClassName}>
          {captures.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`shot ${index}`}
              draggable={false}
              className={selectedFilter === 'grayscale' ? selectedGrayClassName : selectedFilter === 'sepia' ? selectedSepiaClassName : ''}
              style={{ transform: `scale(${photoAdjust[index]?.scale || 1})`, filter: slotCssFilter(index), userSelect: 'none', WebkitUserSelect: 'none' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
