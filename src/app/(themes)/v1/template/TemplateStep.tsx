'use client';

import SharedTemplateStep from '@/components/flow/SharedTemplateStep';
import TemplateCard from './TemplateCard';
import styles from '@/app/(themes)/v1/page.module.css';
import type { TemplateData } from '../types';

interface TemplateStepProps {
  templates: TemplateData[];
  loading: boolean;
  onSelect: (id: string, data?: TemplateData) => void;
  onBack: () => void;
}

export default function TemplateStep({ templates, loading, onSelect }: TemplateStepProps) {
  return (
    <SharedTemplateStep
      templates={templates}
      loading={loading}
      onSelect={onSelect}
      title="Pilih Frame"
      wrapperClassName={styles.stepPage}
      headingClassName={styles.stepHeading}
      listClassName={styles.templateGrid}
      cardComponent={TemplateCard}
    />
  );
}