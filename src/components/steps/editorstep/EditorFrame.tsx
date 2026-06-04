'use client';

import styles from '@/app/page.module.css';
import type { TemplateData, PhotoAdjust } from '../types';

export default function EditorFrame({
  templateData, captures, keyedFrameImage, frameRatio,
  photoAdjust, selectedFilter, slotCssFilter,
}: {
  templateData: TemplateData | null; captures: string[]; keyedFrameImage: string; frameRatio: number;
  photoAdjust: PhotoAdjust[]; selectedFilter: string; slotCssFilter: (idx: number) => string;
}) {
  const hasTemplate = templateData?.frameImage && templateData?.slotsLayout && templateData.slotsLayout.length > 0;

  if (!hasTemplate) {
    return (
      <div className={styles.editorSimplePreview}>
        {captures.map((src, i) => (
          <img key={i} src={src} alt={`shot ${i}`}
            className={selectedFilter === 'grayscale' ? styles.filterGray : selectedFilter === 'sepia' ? styles.filterSepia : ''}
            style={{ transform: `scale(${photoAdjust[i]?.scale || 1})`, filter: slotCssFilter(i) }} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.editorFrame} style={{ height: 'min(75vh, 600px)', aspectRatio: frameRatio, backgroundColor: templateData?.color || '#fff' }}>
      {(templateData?.slotsLayout || []).map((slot, idx) => {
        const src = captures[idx];
        if (!src) return null;
        return (
          <div key={idx} style={{
            position: 'absolute', left: `${slot.x}%`, top: `${slot.y}%`,
            width: `${slot.w}%`, height: `${slot.h}%`, overflow: 'hidden', zIndex: 1,
          }}>
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
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
  );
}
