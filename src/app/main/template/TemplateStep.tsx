'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import StepperBar from '../StepperBar';
import styles from '@/app/main/page.module.css';
import type { TemplateData } from '../types';
import TemplateCard from './TemplateCard';

interface TemplateStepProps {
  onSelect: (id: string, data?: TemplateData, keyedUrl?: string) => void;
  onBack: () => void;
}

export default function TemplateStep({ onSelect, onBack }: TemplateStepProps) {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);

  const handleCardClick = useCallback((t: TemplateData) => {
    onSelect(t.templateId, t);
  }, [onSelect]);

  useEffect(() => {
    cancelledRef.current = false;
    fetch('/api/templates/list')
      .then((r) => r.json())
      .then((res) => {
        if (cancelledRef.current) return;
        if (!res.success || !res.data?.length) { setLoading(false); return; }
        const active = res.data.filter((t: TemplateData) => t.isActive !== false);
        setTemplates(active);
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
            <TemplateCard key={t._id} template={t} onSelect={handleCardClick} />
          ))}
        </div>
      )}
    </div>
  );
}