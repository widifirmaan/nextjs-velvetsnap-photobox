'use client';

import { useCallback } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import StepperBar from '../StepperBar';
import styles from '@/app/v1/page.module.css';
import type { TemplateData } from '../types';
import TemplateCard from './TemplateCard';

interface TemplateStepProps {
  templates: TemplateData[];
  loading: boolean;
  onSelect: (id: string, data?: TemplateData) => void;
  onBack: () => void;
}

export default function TemplateStep({ templates, loading, onSelect, onBack }: TemplateStepProps) {
  const handleCardClick = useCallback((t: TemplateData) => {
    onSelect(t.templateId, t);
  }, [onSelect]);

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
        <div className={styles.stepEmpty}><p style={{ color: '#888', fontSize: 14 }}>No templates available</p></div>
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