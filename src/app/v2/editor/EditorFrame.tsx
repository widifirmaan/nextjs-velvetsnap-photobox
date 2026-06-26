'use client';
import { useRef, useCallback } from 'react';
import { Pencil } from 'lucide-react';
import { TemplateData, PhotoAdjust, DEFAULT_ADJUST } from '../types';
import { getAutoFormatUrl } from '@/lib/cloudinary-url';
import styles from '../page.module.css';

function DraggablePhoto({ src, slotIdx, selected, adjust, cssFilter, onSelect, onAdjust }: {
  src: string; slotIdx: number; selected: boolean; adjust: PhotoAdjust;
  cssFilter: string;
  onSelect: () => void; onAdjust: (idx: number, patch: Partial<PhotoAdjust>) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; maxT: number; moving: boolean }>({ startX: 0, startY: 0, origX: 0, origY: 0, maxT: 0, moving: false });

  const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    elRef.current?.setPointerCapture(e.pointerId);
    const maxT = Math.max(0, (1 - 1 / (adjust.scale || 1)) / 2 * 100);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: adjust.x || 0, origY: adjust.y || 0, maxT, moving: false };
  }, [adjust.x, adjust.y, adjust.scale]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragRef.current.startX === 0 && dragRef.current.startY === 0) return;
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
    if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) dragRef.current.moving = true;
    onAdjust(slotIdx, { x: clamp(dragRef.current.origX + dx, dragRef.current.maxT), y: clamp(dragRef.current.origY + dy, dragRef.current.maxT) });
  }, [slotIdx, onAdjust]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    elRef.current?.releasePointerCapture(e.pointerId);
    if (!dragRef.current.moving) onSelect();
    dragRef.current.startX = 0; dragRef.current.startY = 0;
  }, [onSelect]);

  return (
    <div ref={elRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', cursor: 'grab', touchAction: 'none', outline: selected ? '3px solid var(--np-accent)' : 'none', outlineOffset: '-3px' }}>
      <img src={src} alt={`Slot ${slotIdx}`} draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', transform: `scale(${adjust.scale || 1}) translate(${adjust.x || 0}%, ${adjust.y || 0}%)`, transformOrigin: 'center', filter: cssFilter, userSelect: 'none' }} />
    </div>
  );
}

export default function EditorFrame({ captures, templateData, keyedFrameImage, frameRatio, photoAdjust, selectedSlotIdx, setSelectedSlotIdx, slotCssFilter, onAdjustSlot }: {
  captures: string[]; templateData: TemplateData | null; keyedFrameImage: string; frameRatio: number;
  photoAdjust: PhotoAdjust[]; selectedSlotIdx: number; setSelectedSlotIdx: (idx: number) => void;
  slotCssFilter: (idx: number) => string; onAdjustSlot: (idx: number, patch: Partial<PhotoAdjust>) => void;
}) {
  return (
    <div className={styles.editorPreview}>
      {templateData && templateData.templateFull && templateData.templateData.slotsLayout && templateData.templateData.slotsLayout.length > 0 ? (
        <div className={styles.editorFrame} style={{ height: 'min(75vh, 600px)', aspectRatio: frameRatio, backgroundColor: templateData.templateData.color || '#fff' }}>
          {(templateData.templateData.slotsLayout || []).map((slot, idx) => {
            const src = captures[idx];
            if (!src) return null;
            return (
              <div key={idx} style={{ position: 'absolute', left: `${slot.x}%`, top: `${slot.y}%`, width: `${slot.w}%`, height: `${slot.h}%`, overflow: 'hidden', zIndex: 1 }}>
                <DraggablePhoto src={src} slotIdx={idx} selected={selectedSlotIdx === idx} adjust={photoAdjust[idx] || DEFAULT_ADJUST} cssFilter={slotCssFilter(idx)} onSelect={() => setSelectedSlotIdx(idx)} onAdjust={onAdjustSlot} />
              </div>
            );
          })}
          <img src={getAutoFormatUrl(keyedFrameImage) || getAutoFormatUrl(templateData.templateFull || '') || ''} alt="Frame"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }} />
          {selectedSlotIdx >= 0 && selectedSlotIdx < (templateData.templateData.slotsLayout?.length || 0) && (() => {
            const s = templateData.templateData.slotsLayout[selectedSlotIdx];
            return (
              <div style={{ position: 'absolute', left: `${s.x + s.w}%`, top: `${s.y}%`, width: 24, height: 24, zIndex: 3, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', boxShadow: '2px 2px 0px #1a1a1a', transform: 'translate(-50%, 4px)' }}>
                <Pencil size={14} color="#1a1a1a" />
              </div>
            );
          })()}
        </div>
      ) : (
        <div className={styles.editorSimplePreview}>
          {captures.map((src, i) => (
            <img key={i} src={src} alt={`shot ${i}`} draggable={false}
              style={{ transform: `scale(${photoAdjust[i]?.scale || 1})`, filter: slotCssFilter(i), userSelect: 'none' }} />
          ))}
        </div>
      )}
    </div>
  );
}
