// File: src/app/(themes)/v1/template/TemplateCard.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import SharedTemplateCard from '@/components/template/TemplateCard';
import type { TemplateData } from '../types';
import styles from '@/app/(themes)/v1/page.module.css';

export default function TemplateCard({ template, onSelect, keyedFrameUrl, loading, fetchPriority }: {
  template: TemplateData;
  onSelect: (template: TemplateData) => void;
  keyedFrameUrl?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}) {
  return (
    <SharedTemplateCard
      template={template}
      onSelect={onSelect}
      keyedFrameUrl={keyedFrameUrl}
      loading={loading}
      fetchPriority={fetchPriority}
      sizes="200px"
      buttonClassName={styles.templateCard}
      imageWrapperClassName={styles.templateCardThumb}
      imageClassName={styles.templateCardImage}
      bodyClassName={styles.templateCardBody}
      nameClassName={styles.templateCardName}
      metaClassName={styles.templateCardMeta}
      priceClassName={styles.templateCardPrice}
      slotDotsClassName={styles.slotDots}
      slotDotClassName={styles.slotDot}
      fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#666' }}>No preview</span>
        </div>
      }
    />
  );
}
