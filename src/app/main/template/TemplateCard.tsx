'use client';

import { Loader2 } from 'lucide-react';
import { SlotDots } from '../StepperBar';
import { getOptimizedUrl } from '@/lib/cloudinary-url';
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
  onSelect: (template: any) => void;
  keyedFrameUrl?: string;
}

export default function TemplateCard({ template, onSelect, keyedFrameUrl }: TemplateCardProps) {
  const thumbSrc = keyedFrameUrl || (template.templateFull ? getOptimizedUrl(template.templateFull, 200, 600) : '') || template.templateThumb || '';
  return (
    <button className={styles.templateCard} onClick={() => onSelect(template)}>
      <div className={styles.templateCardThumb}>
        {thumbSrc ? (
          <img src={thumbSrc} alt={template.templateName} loading="lazy" />
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