'use client';

import { LayoutTemplate } from 'lucide-react';
import { SlotDots } from '../StepperBar';
import styles from '@/app/main/page.module.css';

interface TemplateCardProps {
  template: {
    _id: string;
    templateId: string;
    name: string;
    frameImage?: string;
    color: string;
    price: number;
    slots: number;
  };
  onSelect: (id: string) => void;
}

export default function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <button key={template._id} className={styles.templateCard} onClick={() => onSelect(template.templateId)}>
      <div className={styles.templateCardThumb}>
        {template.frameImage ? (
          <img src={template.frameImage} alt={template.name} loading="lazy" />
        ) : (
          <LayoutTemplate size={48} style={{ color: template.color }} />
        )}
      </div>
      <div className={styles.templateCardBody}>
        <div className={styles.templateCardName}>{template.name}</div>
        <div className={styles.templateCardMeta}>
          <span className={styles.templateCardPrice}>Rp{(template.price || 0).toLocaleString('id-ID')}</span>
          <SlotDots count={template.slots} />
        </div>
      </div>
    </button>
  );
}
