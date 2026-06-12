'use client';

import { ISlot } from '@/lib/canvas-utils';
import { X, Check, Upload, Loader2 } from 'lucide-react';
import { TemplateData } from '../../types';
import styles from '@/app/main/page.module.css';
import { useRef } from 'react';

export default function BoothPreview({
  templateData, captures, keyedFrameImage, frameRatio, filledCount, slotsCount,
  stripLoading, onAddCapture, onDeleteCapture, onNext,
}: {
  templateData: TemplateData | null;
  captures: string[];
  keyedFrameImage: string;
  frameRatio: number;
  filledCount: number;
  slotsCount: number;
  stripLoading: boolean;
  onAddCapture: (url: string, slotIdx?: number) => void;
  onDeleteCapture: (idx: number) => void;
  onNext: () => void;
}) {
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleUpload = (idx: number) => {
    fileRefs.current[idx]?.click();
  };

  const MAX_DIM = 1200;
  const JPEG_QUALITY = 0.82;

  const compressImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const c = document.createElement('canvas');
        c.width = width;
        c.height = height;
        const ctx = c.getContext('2d');
        if (!ctx) { resolve(dataUrl); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(c.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleFileChange = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      if (dataUrl) {
        const compressed = await compressImage(dataUrl);
        onAddCapture(compressed, idx);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <>
      {templateData?.templateData?.slotsLayout && (
        <div className={styles.boothPreview}>
          <div className={styles.boothStripPreview} style={{ aspectRatio: frameRatio }}>
            {stripLoading && !keyedFrameImage && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)', zIndex: 10 }}>
                <Loader2 className="spin" size={36} />
              </div>
            )}
            {templateData.templateData.slotsLayout.map((slot: ISlot, idx: number) => {
              const src = captures[idx];
              return (
                <div key={idx} style={{
                  position: 'absolute', left: `${slot.x}%`, top: `${slot.y}%`,
                  width: `${slot.w}%`, height: `${slot.h}%`, overflow: 'hidden',
                  background: src ? 'none' : 'rgba(0,0,0,0.06)', borderRadius: '2px',
                }}>
                  {src ? (
                    <>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <button className={styles.boothDeleteSlot} onClick={() => onDeleteCapture(idx)}><X size={14} /></button>
                    </>
                  ) : (
                    <button className={styles.boothUploadSlot} onClick={() => handleUpload(idx)} type="button">
                      <Upload size={20} />
                      <input
                        ref={(el) => { fileRefs.current[idx] = el; }}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(idx, e)}
                      />
                    </button>
                  )}
                </div>
              );
            })}
            {keyedFrameImage && <img src={keyedFrameImage} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />}
          </div>
          {filledCount === slotsCount && (
            <button className={styles.boothProceedBtn} onClick={onNext}><Check size={16} /> Edit</button>
          )}
        </div>
      )}
    </>
  );
}
