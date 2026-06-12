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
  onSelect: (id: string) => void;
  livePreviewUrl?: string;
}

const cardSrc = (t: TemplateCardProps['template']) => {
  const url = t.templateFull || t.templateThumb || '';
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  return getOptimizedUrl(url, 500);
};

export default function TemplateCard({ template, onSelect, livePreviewUrl }: TemplateCardProps) {
  const src = livePreviewUrl || cardSrc(template);
  return (
    <button className={styles.templateCard} onClick={() => onSelect(template.templateId)}>
      <div className={styles.templateCardThumb}>
        {src ? (
          <img src={src} alt={template.templateName} loading="lazy" />
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
