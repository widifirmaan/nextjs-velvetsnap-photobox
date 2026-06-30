'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { SlotDots } from '../StepperBar';
import { getOptimizedUrl } from '@/lib/cloudinary-url';
import type { TemplateData } from '../types';
import styles from '@/app/v1/page.module.css';

interface TemplateCardProps {
  template: TemplateData;
  onSelect: (template: TemplateData) => void;
  keyedFrameUrl?: string;
}

export default function TemplateCard({ template, onSelect, keyedFrameUrl }: TemplateCardProps) {
  const thumbSrc = keyedFrameUrl || (template.templateFull ? getOptimizedUrl(template.templateFull, 200, 600) : '') || template.templateThumb || '';
  const [loaded, setLoaded] = useState(false);
  return (
    <button className={styles.templateCard} onClick={() => onSelect(template)}>
      <div className={styles.templateCardThumb}>
        {thumbSrc ? (
          <div style={{ position:'relative', width:'100%', height:'100%' }}>
            {!loaded && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1, background:'#f8f8f8' }}>
                <Loader2 className="spin" size={32} />
              </div>
            )}
            <Image src={thumbSrc} alt={template.templateName} fill sizes="200px" onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} />
          </div>
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