'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import Webcam from 'react-webcam';
import StepperBar from '../StepperBar';
import styles from '@/app/main/page.module.css';
import type { TemplateData } from '../types';
import { removeGreenScreen, composeFrameImage } from '@/lib/canvas-utils';
import TemplateCard from './TemplateCard';

interface TemplateStepProps {
  templates: TemplateData[];
  onSelect: (id: string) => void;
  onBack: () => void;
}

export default function TemplateStep({ templates, onSelect, onBack }: TemplateStepProps) {
  const webcamRef = useRef<Webcam>(null);
  const [latestFrame, setLatestFrame] = useState<string | null>(null);
  const [livePreviewUrls, setLivePreviewUrls] = useState<Record<string, string>>({});
  const keyedFramesRef = useRef<Record<string, string>>({});
  const compositingRef = useRef(false);

  // Pre-compute keyed frame images for all templates
  useEffect(() => {
    (async () => {
      const map: Record<string, string> = {};
      await Promise.all(templates.map(async (t) => {
        const src = t.frameImage;
        if (!src || !t.slotsLayout?.length) return;
        try {
          map[t.templateId] = await removeGreenScreen(src);
        } catch {}
      }));
      keyedFramesRef.current = map;
    })();
  }, [templates]);

  // Capture immediately on mount, then every 2s
  const capture = useCallback(() => {
    const shot = webcamRef.current?.getScreenshot();
    if (shot) setLatestFrame(shot);
  }, []);

  useEffect(() => {
    const t = setTimeout(capture, 100);
    const iv = setInterval(capture, 100);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [capture]);

  // Composite templates with latest frame
  const composite = useCallback(async () => {
    if (!latestFrame || compositingRef.current) return;
    compositingRef.current = true;
    try {
      const results = await Promise.all(templates.map(async (t) => {
        const keyed = keyedFramesRef.current[t.templateId];
        const slots = t.slotsLayout;
        if (!keyed || !slots?.length) return null;
        const arr = Array(slots.length).fill(latestFrame);
        const adjusts = Array(slots.length).fill({ scale: 1, x: 0, y: 0 });
        const url = await composeFrameImage(keyed, slots, arr, adjusts, t.color || '#ffffff');
        return { id: t.templateId, url };
      }));
      const map: Record<string, string> = {};
      results.forEach(r => { if (r) map[r.id] = r.url; });
      setLivePreviewUrls(map);
    } catch {} finally {
      compositingRef.current = false;
    }
  }, [latestFrame, templates]);

  useEffect(() => { composite(); }, [composite]);

  return (
    <div className={`${styles.stepPage} ${styles.stepPageTemplates}`}>
      <StepperBar current={0} total={5} />
      <div className={styles.stepHeader}>
        <button className={styles.backBtn} onClick={onBack}><ArrowLeft size={18} /></button>
        <h1 className={styles.stepHeading}>Pilih Frame</h1>
      </div>
      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: 'user' }}
        style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
      {templates.length === 0 ? (
        <p className={styles.stepEmpty}>Tidak ada template.</p>
      ) : (
        <div className={styles.templateGrid}>
          {templates.map((t) => (
            <TemplateCard key={t._id} template={t} onSelect={onSelect}
              livePreviewUrl={livePreviewUrls[t.templateId]} />
          ))}
        </div>
      )}
    </div>
  );
}
