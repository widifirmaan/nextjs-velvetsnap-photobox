'use client';

import { Loader2 } from 'lucide-react';
import { SlotDots } from '../StepperBar';
import styles from '@/app/main/page.module.css';

interface TemplateCardProps {
  template: {
    _id?: string;
    templateId: string;
    templateName: string;
    templatePrice: number;
    templateData?: {
      color: string;
      slots: number;
    };
  };
  onSelect: (id: string) => void;
  keyedFrameUrl?: string;
}

export default function TemplateCard({ template, onSelect, keyedFrameUrl }: TemplateCardProps) {
  return (
    <button className={styles.templateCard} onClick={() => onSelect(template.templateId)}>
      <div className={styles.templateCardThumb}>
        {keyedFrameUrl ? (
          <img src={keyedFrameUrl} alt={template.templateName} loading="lazy" />
        ) : (
          <Loader2 className="spin" size={32} />
        )}
      </div>
      <div className={styles.templateCardBody}>
        <div className={styles.templateCardName}>{template.templateName}</div>
        <div className={styles.templateCardMeta}>
          <span className={styles.templateCardPrice}>Rp{(template.templatePrice || 0).toLocaleString('id-ID')}</span>
          <SlotDots count={template.templateData?.slots || 1} />
        </div>
      </div>
    </button>
  );
}