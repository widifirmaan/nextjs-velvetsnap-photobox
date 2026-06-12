'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import StepperBar from '../StepperBar';
import styles from '@/app/main/page.module.css';
import type { TemplateData } from '../types';
import { removeGreenScreen } from '@/lib/canvas-utils';
import TemplateCard from './TemplateCard';

interface TemplateStepProps {
  onSelect: (id: string) => void;
  onBack: () => void;
}

export default function TemplateStep({ onSelect, onBack }: TemplateStepProps) {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [keyedUrls, setKeyedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    fetch('/api/templates/list')
      .then((r) => r.json())
      .then(async (res) => {
        if (cancelledRef.current) return;
        if (!res.success || !res.data?.length) { setLoading(false); return; }
        const active = res.data.filter((t: TemplateData) => t.isActive !== false);
        setTemplates(active);

        // Fetch full detail + chroma-key templateFull in parallel batches
        const batchSize = 4;
        for (let i = 0; i < active.length; i += batchSize) {
          if (cancelledRef.current) return;
          const batch = active.slice(i, i + batchSize);
          await Promise.all(batch.map(async (t: any) => {
            try {
              const r = await fetch(`/api/templates/thumbnails?id=${t.templateId}`);
              const fullRes = await r.json();
              if (cancelledRef.current || !fullRes.success || !fullRes.data?.length) return;
              const full = fullRes.data[0];
              setTemplates((prev) => prev.map((p) => p.templateId === full.templateId ? { ...p, ...full } : p));
              const imgUrl = full.templateFull || full.templateThumb || '';
              if (imgUrl) {
                const keyed = await removeGreenScreen(imgUrl);
                if (!cancelledRef.current) {
                  setKeyedUrls((prev) => ({ ...prev, [full.templateId]: keyed }));
                }
              }
            } catch {}
          }));
        }
        setLoading(false);
      })
      .catch(() => { if (!cancelledRef.current) setLoading(false); });
    return () => { cancelledRef.current = true; };
  }, []);

  return (
    <div className={`${styles.stepPage} ${styles.stepPageTemplates}`}>
      <StepperBar current={0} total={5} />
      <div className={styles.stepHeader}>
        <button className={styles.backBtn} onClick={onBack}><ArrowLeft size={18} /></button>
        <h1 className={styles.stepHeading}>Pilih Frame</h1>
      </div>
      {loading && templates.length === 0 ? (
        <div className={styles.stepEmpty}><Loader2 className="spin" size={40} /></div>
      ) : templates.length === 0 ? (
        <div className={styles.stepEmpty}><Loader2 className="spin" size={40} /></div>
      ) : (
        <div className={styles.templateGrid}>
          {templates.map((t) => (
            <TemplateCard key={t._id} template={t} onSelect={onSelect}
              keyedFrameUrl={keyedUrls[t.templateId]} />
          ))}
        </div>
      )}
    </div>
  );
}