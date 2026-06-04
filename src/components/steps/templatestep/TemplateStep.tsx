'use client';

import { ArrowLeft } from 'lucide-react';
import StepperBar from '../StepperBar';
import TemplateCard from './TemplateCard';
import type { TemplateData } from '../types';
import styles from '@/app/page.module.css';

interface TemplateStepProps {
  templates: TemplateData[];
  onSelect: (id: string) => void;
  onBack: () => void;
}

export default function TemplateStep({ templates, onSelect, onBack }: TemplateStepProps) {
  return (
    <div className={`${styles.stepPage} ${styles.stepPageTemplates}`}>
      <StepperBar current={0} total={5} />
      <div className={styles.stepHeader}>
        <button className={styles.backBtn} onClick={onBack}><ArrowLeft size={18} /></button>
        <h1 className={styles.stepHeading}>Pilih Frame</h1>
      </div>
      {templates.length === 0 ? (
        <p className={styles.stepEmpty}>Tidak ada template.</p>
      ) : (
        <div className={styles.templateGrid}>
          {templates.map((t) => (
            <TemplateCard key={t._id} template={t} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
