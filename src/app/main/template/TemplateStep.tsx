'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Webcam from 'react-webcam';
import StepperBar from '../StepperBar';
import styles from '@/app/main/page.module.css';
import type { TemplateData } from '../types';
import { removeGreenScreen, composeFrameImage } from '@/lib/canvas-utils';
import TemplateCard from './TemplateCard';

interface TemplateStepProps {
  onSelect: (id: string) => void;
  onBack: () => void;
}

export default function TemplateStep({ onSelect, onBack }: TemplateStepProps) {
  const webcamRef = useRef<Webcam>(null);
  const [latestFrame, setLatestFrame] = useState<string | null>(null);
  const [livePreviewUrls, setLivePreviewUrls] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const keyedFramesRef = useRef<Record<string, string>>({});
  const compositingRef = useRef(false);
  const frameRef = useRef<string | null>(null);

  // Fetch template list (lightweight), then progressively load full data
  useEffect(() => {
    fetch('/api/templates/list')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length) {
          const active = res.data.filter((t: TemplateData) => t.isActive !== false);
          setTemplates(active);
          setLoading(false);
          // Load full data one-by-one, staggered by 300ms
          active.forEach((t: any, i: number) => {
            setTimeout(() => {
              fetch(`/api/templates/thumbnails?id=${t.templateId}`)
                .then((r) => r.json())
                .then(async (fullRes) => {
                  if (!fullRes.success || !fullRes.data?.length) return;
                  const full = fullRes.data[0];
                  setTemplates((prev) => prev.map((p) => p.templateId === full.templateId ? { ...p, ...full } : p));
                  if (full.fullresUrl && full.slotsLayout?.length) {
                    try {
                      keyedFramesRef.current[full.templateId] = await removeGreenScreen(full.fullresUrl, 320);
                    } catch {}
                  }
                })
                .catch(() => {});
            }, i * 300);
          });
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  // Capture webcam every 3s
  const capture = useCallback(() => {
    const shot = webcamRef.current?.getScreenshot();
    if (shot) frameRef.current = shot;
    if (shot) setLatestFrame(shot);
  }, []);

  useEffect(() => {
    capture();
    const iv = setInterval(capture, 3000);
    return () => clearInterval(iv);
  }, [capture]);

  // Composite all templates with current frame
  const composite = useCallback(async () => {
    const frame = frameRef.current;
    if (!frame || compositingRef.current) return;
    compositingRef.current = true;
    try {
      const results = await Promise.all(templates.map(async (t) => {
        const keyed = keyedFramesRef.current[t.templateId];
        const slots = t.slotsLayout;
        if (!keyed || !slots?.length) return null;
        const arr = Array(slots.length).fill(frame);
        const adjusts = Array(slots.length).fill({ scale: 1, x: 0, y: 0 });
        const url = await composeFrameImage(keyed, slots, arr, adjusts, t.color || '#ffffff', 320);
        return { id: t.templateId, url };
      }));
      const map: Record<string, string> = {};
      results.forEach((r) => { if (r) map[r.id] = r.url; });
      setLivePreviewUrls(map);
    } catch {} finally {
      compositingRef.current = false;
    }
  }, [templates]);

  useEffect(() => {
    if (!latestFrame) return;
    composite();
  }, [latestFrame, composite]);

  return (
    <div className={`${styles.stepPage} ${styles.stepPageTemplates}`}>
      <StepperBar current={0} total={5} />
      <div className={styles.stepHeader}>
        <button className={styles.backBtn} onClick={onBack}><ArrowLeft size={18} /></button>
        <h1 className={styles.stepHeading}>Pilih Frame</h1>
      </div>
      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: 'user' }}
        style={{ position: 'fixed', top: 0, left: 0, width: 320, height: 240, opacity: 0, pointerEvents: 'none', zIndex: -1 }}
      />
      {loading ? (
        <div className={styles.stepEmpty}><Loader2 className="spin" size={40} /></div>
      ) : templates.length === 0 ? (
        <div className={styles.stepEmpty}><Loader2 className="spin" size={40} /></div>
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
