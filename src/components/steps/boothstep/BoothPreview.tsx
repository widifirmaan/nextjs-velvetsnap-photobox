'use client';

import { Check, X } from 'lucide-react';
import styles from '@/app/page.module.css';
import { type ISlot } from '@/lib/canvas-utils';
import type { TemplateData } from '../types';

export default function BoothPreview({
  templateData, keyedFrameImage, frameRatio, captures, filledCount, slotsCount, onDeleteCapture, onNext,
}: {
  templateData: TemplateData | null; keyedFrameImage: string; frameRatio: number;
  captures: string[]; filledCount: number; slotsCount: number;
  onDeleteCapture: (idx: number) => void; onNext: () => void;
}) {
  if (!templateData?.slotsLayout) return null;

  return (
    <div className={styles.boothPreview}>
      <div className={styles.boothStripPreview} style={{ aspectRatio: frameRatio }}>
        {templateData.slotsLayout.map((slot: ISlot, idx: number) => {
          const src = captures[idx];
          return (
            <div key={idx} style={{
              position: 'absolute', left: `${slot.x}%`, top: `${slot.y}%`,
              width: `${slot.w}%`, height: `${slot.h}%`, overflow: 'hidden',
              background: src ? 'none' : 'rgba(0,0,0,0.06)', borderRadius: '2px',
            }}>
              {src && (
                <>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <button className={styles.boothDeleteSlot} onClick={() => onDeleteCapture(idx)}><X size={14} /></button>
                </>
              )}
            </div>
          );
        })}
        <img src={keyedFrameImage || templateData.frameImage || ''} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      </div>
      {filledCount === slotsCount && (
        <button className={styles.boothProceedBtn} onClick={onNext}><Check size={16} /> Edit</button>
      )}
    </div>
  );
}
