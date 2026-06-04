'use client';

import { ArrowLeft, LayoutTemplate } from 'lucide-react';
import styles from '@/app/page.module.css';
import StepperBar, { SlotDots } from './StepperBar';
import type { TemplateData } from './types';

export default function TemplateStep({ templates, onSelect, onBack }: {
  templates: TemplateData[]; onSelect: (id: string) => void; onBack: () => void;
}) {
  return (
    <div className={`${styles.stepPage} ${styles.stepPageTemplates}`}>
      <StepperBar current={0} total={5} />
      <div className={styles.stepHeader}>
        <button className={styles.backBtn} onClick={onBack}><ArrowLeft size={18} /></button>
        <h1 className={styles.stepHeading}>Pilih Frame</h1>
      </div>
      {templates.length === 0 ? (
        <p className={styles.stepEmpty}>Tidak ada template.</p>
      ) : (
        <div className={styles.templateGrid}>
          {templates.map((t) => (
            <button key={t._id} className={styles.templateCard} onClick={() => onSelect(t.templateId)}>
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
          ))}
        </div>
      )}
    </div>
  );
}
