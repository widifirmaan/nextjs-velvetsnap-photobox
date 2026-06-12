'use client';

import { LayoutTemplate, Loader2 } from 'lucide-react';
import { SlotDots } from '../StepperBar';
import styles from '@/app/main/page.module.css';

interface TemplateCardProps {
  template: {
    _id?: string;
    templateId: string;
    templateName: string;
    templatePrice: number;
    templateFull?: string;
    templateThumb?: string;
    templateData?: {
      color: string;
      slots: number;
    };
  };
  onSelect: (id: string) => void;
  livePreviewUrl?: string;
}

export default function TemplateCard({ template, onSelect, livePreviewUrl }: TemplateCardProps) {
  return (
    <button className={styles.templateCard} onClick={() => onSelect(template.templateId)}>
      <div className={styles.templateCardThumb}>
        {livePreviewUrl ? (
          <img src={livePreviewUrl} alt={template.templateName} loading="lazy" />
        ) : template.templateThumb ? (
          <img src={template.templateThumb} alt={template.templateName}
            style={{ opacity: 0.5, filter: 'blur(2px)' }} />
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
