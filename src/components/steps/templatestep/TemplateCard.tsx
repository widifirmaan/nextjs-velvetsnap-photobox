'use client';

import { LayoutTemplate } from 'lucide-react';
import styles from '@/app/page.module.css';
import { SlotDots } from '../StepperBar';
import type { TemplateData } from '../types';

export default function TemplateCard({ t, onSelect }: { t: TemplateData; onSelect: (id: string) => void }) {
  return (
    <button className={styles.templateCard} onClick={() => onSelect(t.templateId)}>
      <div className={styles.templateCardThumb}>
        {t.frameImage ? <img src={t.frameImage} alt={t.name} loading="lazy" /> : <LayoutTemplate size={48} style={{ color: t.color }} />}
      </div>
      <div className={styles.templateCardBody}>
        <div className={styles.templateCardName}>{t.name}</div>
        <div className={styles.templateCardMeta}>
          <span className={styles.templateCardPrice}>Rp{(t.price || 0).toLocaleString('id-ID')}</span>
          <SlotDots count={t.slots} />
        </div>
      </div>
    </button>
  );
}
