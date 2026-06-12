'use client';

import { LayoutTemplate, Loader2 } from 'lucide-react';
import { SlotDots } from '../StepperBar';
import styles from '@/app/main/page.module.css';

interface TemplateCardProps {
  template: {
    _id: string;
    templateId: string;
    name: string;
    color: string;
    price: number;
    slots: number;
  };
  onSelect: (id: string) => void;
  livePreviewUrl?: string;
}

export default function TemplateCard({ template, onSelect, livePreviewUrl }: TemplateCardProps) {
  const hasFrame = !!livePreviewUrl;
  return (
    <button key={template._id} className={styles.templateCard} onClick={() => onSelect(template.templateId)}>
      <div className={styles.templateCardThumb}>
        {!hasFrame ? (
          <Loader2 className="spin" size={32} />
        ) : (
          livePreviewUrl ? (
            <img src={livePreviewUrl} alt={template.templateName} loading="lazy" />
          ) : (
            <LayoutTemplate size={48} style={{ color: template.templateData?.color || '#007aff' }} />
          )
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
