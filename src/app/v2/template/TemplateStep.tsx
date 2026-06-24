'use client';
import { ArrowLeft } from 'lucide-react';
import styles from '../page.module.css';
import TemplateCard from './TemplateCard';
import NewspaperSection from '../homepage/NewspaperSection';
import type { TemplateData } from '../types';

export default function TemplateStep({ templates, selectedId, onSelect, onBack, loading }: {
  templates: TemplateData[]; selectedId: string | null;
  onSelect: (id: string, data: TemplateData) => void; onBack?: () => void; loading: boolean;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <NewspaperSection label="PILIHAN">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--np-border)', marginBottom: 8 }}>
          {onBack && (
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center', color: 'var(--np-text)' }}>
              <ArrowLeft size={16} />
            </button>
          )}
          <h3 className={styles.sectionHeadline} style={{ marginBottom: 0, borderBottom: 'none', padding: 0 }}>Pilih Bingkai Foto</h3>
        </div>
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
          <div className={styles.templateGrid} style={{ overflowY: 'auto', flex: 1 }}>
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
