'use client';
import SharedTemplateStep from '@/components/flow/SharedTemplateStep';
import TemplateCard from './TemplateCard';
import styles from '../page.module.css';
import type { TemplateData } from '../types';

export default function TemplateStep({ templates, loading, onSelect }: {
  templates: TemplateData[]; loading: boolean;
  onSelect: (id: string, data?: TemplateData) => void;
}) {
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
