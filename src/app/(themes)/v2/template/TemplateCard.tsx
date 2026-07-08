// File: src/app/(themes)/v2/template/TemplateCard.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import SharedTemplateCard from '@/components/template/TemplateCard';
import type { TemplateData } from '../types';
import styles from '../page.module.css';

export default function TemplateCard({ template, onSelect, keyedFrameUrl }: {
  template: TemplateData;
  onSelect: (t: TemplateData) => void;
  keyedFrameUrl?: string;
}) {
  return (
    <SharedTemplateCard
      template={template}
      onSelect={onSelect}
      keyedFrameUrl={keyedFrameUrl}
      sizes="200px"
      buttonClassName={styles.templateCard}
      buttonStyle={{ background: 'none', border: 'none', padding: 0 }}
      imageWrapperClassName={styles.templateCardImg}
      imageClassName={styles.templateCardImg}
      bodyClassName={styles.templateCardBody}
      nameClassName={styles.templateCardName}
      descClassName={styles.templateCardDesc}
      footerClassName={styles.templateCardFooter}
      priceClassName={styles.templateCardPrice}
      slotDotsClassName={styles.slotDots}
      slotDotClassName={styles.slotDot}
      fallback={
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#888' }}>NO PREVIEW</span>
        </div>
      }
    />
  );
}
