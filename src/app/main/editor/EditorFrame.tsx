'use client';
import { useRef, useCallback } from 'react';
import { Pencil } from 'lucide-react';
import { TemplateData, PhotoAdjust, DEFAULT_ADJUST } from '../types';
import styles from '@/app/main/page.module.css';

function DraggablePhoto({ src, slotIdx, selected, adjust, cssFilter, selectedFilter, onSelect, onAdjust }: {
  src: string; slotIdx: number; selected: boolean; adjust: PhotoAdjust;
  cssFilter: string; selectedFilter: string;
  onSelect: () => void; onAdjust: (idx: number, patch: Partial<PhotoAdjust>) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moving: boolean }>({ startX: 0, startY: 0, origX: 0, origY: 0, moving: false });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    elRef.current?.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: adjust.x || 0,
      origY: adjust.y || 0,
      moving: false,
    };
  }, [adjust.x, adjust.y]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragRef.current.startX === 0 && dragRef.current.startY === 0) return;
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
    if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) dragRef.current.moving = true;
    onAdjust(slotIdx, { x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  }, [slotIdx, onAdjust]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    elRef.current?.releasePointerCapture(e.pointerId);
    if (!dragRef.current.moving) onSelect();
    dragRef.current.startX = 0;
    dragRef.current.startY = 0;
  }, [onSelect]);

  return (
    <div
      ref={elRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        width: '100%', height: '100%', position: 'relative', overflow: 'hidden', cursor: 'grab', touchAction: 'none',
        outline: selected ? '3px solid #fff' : 'none',
        outlineOffset: '-3px',
        borderRadius: '2px',
      }}
    >
      <img src={src} alt={`Slot ${slotIdx}`}
        draggable={false}
        className={selectedFilter === 'grayscale' ? styles.filterGray : selectedFilter === 'sepia' ? styles.filterSepia : ''}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none',
          transform: `scale(${adjust.scale || 1}) translate(${adjust.x || 0}%, ${adjust.y || 0}%)`,
          transformOrigin: 'center',
          filter: cssFilter,
          userSelect: 'none', WebkitUserSelect: 'none',
        }} />
      {selected && (
        <div style={{
          position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 4,
          background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: 5, boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}>
          <Pencil size={13} color="#333" />
        </div>
      )}
    </div>
  );
}

export default function EditorFrame({ captures, templateData, keyedFrameImage, frameRatio, photoAdjust, selectedSlotIdx, setSelectedSlotIdx, selectedFilter, slotCssFilter, onAdjustSlot }: {
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
}) {
  return (
    <div className={styles.editorPreview}>
      {templateData && templateData.templateFull && templateData.templateData.slotsLayout && templateData.templateData.slotsLayout.length > 0 ? (
        <div className={styles.editorFrame} style={{ height: 'min(75vh, 600px)', aspectRatio: frameRatio, backgroundColor: templateData.templateData.color || '#fff' }}>
          {(templateData.templateData.slotsLayout || []).map((slot, idx) => {
            const src = captures[idx];
            if (!src) return null;
            return (
              <div key={idx} style={{
                position: 'absolute', left: `${slot.x}%`, top: `${slot.y}%`,
                width: `${slot.w}%`, height: `${slot.h}%`, overflow: 'hidden', zIndex: 1,
                borderRadius: '2px',
              }}>
                <DraggablePhoto
                  src={src}
                  slotIdx={idx}
                  selected={selectedSlotIdx === idx}
                  adjust={photoAdjust[idx] || DEFAULT_ADJUST}
                  cssFilter={slotCssFilter(idx)}
                  selectedFilter={selectedFilter}
                  onSelect={() => setSelectedSlotIdx(idx)}
                  onAdjust={onAdjustSlot}
                />
              </div>
            );
          })}
          <img src={keyedFrameImage?.includes('res.cloudinary.com') ? keyedFrameImage.replace('/image/upload/', '/image/upload/f_auto,q_auto/') : (keyedFrameImage || templateData.templateFull?.replace('/image/upload/', '/image/upload/f_auto,q_auto/') || '')} alt="Frame"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }} />
        </div>
      ) : (
        <div className={styles.editorSimplePreview}>
          {captures.map((src, i) => (
            <img key={i} src={src} alt={`shot ${i}`}
              draggable={false}
              className={selectedFilter === 'grayscale' ? styles.filterGray : selectedFilter === 'sepia' ? styles.filterSepia : ''}
              style={{ transform: `scale(${photoAdjust[i]?.scale || 1})`, filter: slotCssFilter(i), userSelect: 'none', WebkitUserSelect: 'none' }} />
          ))}
        </div>
      )}
    </div>
  );
}
