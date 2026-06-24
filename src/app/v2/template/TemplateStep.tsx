'use client';
import styles from '../page.module.css';
import TemplateCard from './TemplateCard';
import type { TemplateData } from '../types';

export default function TemplateStep({ templates, selectedId, onSelect, onNext, loading }: {
  templates: TemplateData[]; selectedId: string | null;
  onSelect: (id: string) => void; onNext: () => void; loading: boolean;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className={styles.sectionHeadline}>Choose Your Frame</h3>
        {selectedId && (
          <button className={styles.boothBtn} onClick={onNext} style={{ padding: '8px 20px', fontSize: 11 }}>
            NEXT →
          </button>
        )}
      </div>
      {loading ? (
        <div className={styles.templateGrid} style={{ paddingTop: 16 }}>
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
        <div className={styles.templateGrid} style={{ paddingTop: 16, overflowY: 'auto' }}>
          {templates.map((t) => (
            <TemplateCard key={t._id || t.templateId} template={t}
              selected={t._id === selectedId || t.templateId === selectedId}
              onSelect={() => onSelect(t._id || t.templateId)} />
          ))}
        </div>
      )}
    </div>
  );
}
