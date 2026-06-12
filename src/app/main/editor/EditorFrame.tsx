'use client';
import { Pencil } from 'lucide-react';
import { TemplateData, PhotoAdjust } from '../types';
import styles from '@/app/main/page.module.css';

export default function EditorFrame({ captures, templateData, keyedFrameImage, frameRatio, photoAdjust, selectedSlotIdx, setSelectedSlotIdx, selectedFilter, slotCssFilter }: {
  captures: string[];
  templateData: TemplateData | null;
  keyedFrameImage: string;
  frameRatio: number;
  photoAdjust: PhotoAdjust[];
  selectedSlotIdx: number;
  setSelectedSlotIdx: (idx: number) => void;
  selectedFilter: string;
  slotCssFilter: (idx: number) => string;
}) {
  return (
    <div className={styles.editorPreview}>
      {templateData && templateData.fullresUrl && templateData.slotsLayout && templateData.slotsLayout.length > 0 ? (
        <div className={styles.editorFrame} style={{ height: 'min(75vh, 600px)', aspectRatio: frameRatio, backgroundColor: templateData.color || '#fff' }}>
          {(templateData.slotsLayout || []).map((slot, idx) => {
            const src = captures[idx];
            if (!src) return null;
            return (
              <div key={idx} onClick={() => setSelectedSlotIdx(idx)} style={{
                position: 'absolute', left: `${slot.x}%`, top: `${slot.y}%`,
                width: `${slot.w}%`, height: `${slot.h}%`, overflow: 'hidden', zIndex: 1,
                cursor: 'pointer', borderRadius: '2px',
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
                  {selectedSlotIdx === idx && (
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.25)', pointerEvents: 'none',
                    }}>
                      <Pencil size={28} color="#fff" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <img src={keyedFrameImage || templateData.fullresUrl || ''} alt="Frame"
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
  );
}
