'use client';
import styles from '../page.module.css';
import TemplateCard from './TemplateCard';
import NewspaperSection from '../homepage/NewspaperSection';
import type { TemplateData } from '../types';

export default function TemplateStep({ templates, selectedId, onSelect, loading }: {
  templates: TemplateData[]; selectedId: string | null;
  onSelect: (id: string, data: TemplateData) => void; loading: boolean;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <NewspaperSection>
        {loading ? (
          <div className={styles.templateGrid}>
            {[1,2,3,4].map((i) => (
              <div key={i} className={styles.templateCard}>
                <div className={styles.templateCardImg} style={{ background: '#ddd' }} />
                <div className={styles.templateCardBody}>
                  <div className={styles.skeleton} style={{ width: '80%', height: 12, marginBottom: 4 }} />
                  <div className={styles.skeleton} style={{ width: '60%', height: 10 }} />
                </div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--np-text-muted)' }}>
              Belum ada bingkai tersedia. Silakan cek kembali nanti.
            </p>
          </div>
        ) : (
          <div className={styles.templateGrid}>
            {templates.map((t) => (
              <TemplateCard key={t._id || t.templateId} template={t}
                selected={t._id === selectedId || t.templateId === selectedId}
                onSelect={(data) => onSelect(t._id || t.templateId, data)} />
            ))}
          </div>
        )}
      </NewspaperSection>
      <div className={styles.newspaperFooter}>
        <div className={styles.mastheadMeta}>
          <span>Pilih bingkai untuk memulai</span>
          <span>—</span>
          <span>{templates.length} bingkai tersedia</span>
        </div>
      </div>
    </div>
  );
}
