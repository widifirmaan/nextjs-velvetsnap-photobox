// File: src/app/(themes)/v2/template/TemplateStep.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import { useCallback } from 'react';
import SharedTemplateStep from '@/components/flow/SharedTemplateStep';
import styles from '../page.module.css';
import type { TemplateData } from '../types';

export default function TemplateStep({ templates, loading, onSelect }: {
  templates: TemplateData[]; loading: boolean;
  onSelect: (id: string, data?: TemplateData) => void;
}) {
  const handleCardClick = useCallback((t: TemplateData) => {
    onSelect(t.templateId, t);
  }, [onSelect]);

  return (
    <SharedTemplateStep
      templates={templates}
      loading={loading}
      onSelect={onSelect}
      title="Pilih Frame"
      wrapperClassName={styles.stepPage}
      headingClassName={styles.stepHeading}
      listClassName={styles.templateGrid}
    />
  );
}
