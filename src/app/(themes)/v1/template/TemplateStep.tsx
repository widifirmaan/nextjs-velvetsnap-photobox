// File: src/app/(themes)/v1/template/TemplateStep.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { useCallback } from 'react';
import SharedTemplateStep from '@/components/flow/SharedTemplateStep';
import styles from '@/app/(themes)/v1/page.module.css';
import type { TemplateData } from '../types';

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
      <TemplateList
        templates={templates}
        loading={loading}
        emptyMessage="No templates available"
        listClassName={styles.templateGrid}
        renderTemplate={(t) => (
          <TemplateCard key={t._id || t.templateId} template={t} onSelect={handleCardClick} />
        )}
      />
    </div>
  );
}