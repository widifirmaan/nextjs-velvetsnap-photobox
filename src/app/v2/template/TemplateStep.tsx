'use client';
import styles from '../page.module.css';
import TemplateCard from './TemplateCard';
import NewspaperSection from '../homepage/NewspaperSection';
import type { TemplateData } from '../types';

export default function TemplateStep({ templates, selectedId, onSelect, onNext, loading }: {
  templates: TemplateData[]; selectedId: string | null;
  onSelect: (id: string) => void; onNext: () => void; loading: boolean;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <NewspaperSection label="TEMPLATE">
        <div style={{ padding: '8px 0 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--np-border)', marginBottom: 12 }}>
          <h3 className={styles.sectionHeadline}>Choose Your Frame</h3>
          {selectedId && (
            <button className={styles.boothBtn} onClick={onNext} style={{ padding: '8px 20px', fontSize: 11 }}>
              NEXT →
            </button>
          )}
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
              No templates available. Check back later.
            </p>
          </div>
        ) : (
          <div className={styles.templateGrid} style={{ overflowY: 'auto', flex: 1 }}>
            {templates.map((t) => (
              <TemplateCard key={t._id || t.templateId} template={t}
                selected={t._id === selectedId || t.templateId === selectedId}
                onSelect={() => onSelect(t._id || t.templateId)} />
            ))}
          </div>
        )}
      </NewspaperSection>
      <div className={styles.newspaperFooter}>
        <div className={styles.mastheadMeta}>
          <span>Pick your frame to begin</span>
          <span>—</span>
          <span>{templates.length} templates available</span>
        </div>
      </div>
    </div>
  );
}
