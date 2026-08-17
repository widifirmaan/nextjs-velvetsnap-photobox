'use client';

import SharedTemplateStep from '@/components/flow/SharedTemplateStep';
import TemplateCard from './TemplateCard';
import StepperBar from '../StepperBar';
import styles from '@/app/(themes)/v1/page.module.css';
import type { TemplateData } from '../types';

interface TemplateStepProps {
  templates: TemplateData[];
  loading: boolean;
  onSelect: (id: string, data?: TemplateData) => void;
  onBack: () => void;
}

export default function TemplateStep({ templates, loading, onSelect, onBack }: TemplateStepProps) {
  return (
    <>
      <StepperBar current={0} total={5} />
      <SharedTemplateStep
      templates={templates}
      loading={loading}
      onSelect={onSelect}
      onBack={onBack}
      title="Pilih Frame"
      wrapperClassName={`${styles.stepPage} ${styles.stepPageTemplates}`}
      headerClassName={styles.stepHeader}
      backButtonClassName={styles.backBtn}
      headingClassName={styles.stepHeading}
      listClassName={styles.templateGrid}
      cardComponent={TemplateCard}
      />
    </>
  );
}