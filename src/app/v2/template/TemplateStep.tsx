'use client';
import { useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import styles from '../page.module.css';
import type { TemplateData } from '../types';
import TemplateCard from './TemplateCard';

export default function TemplateStep({ templates, loading, onSelect }: {
  templates: TemplateData[]; loading: boolean;
  onSelect: (id: string, data?: TemplateData) => void;
}) {
  const handleCardClick = useCallback((t: TemplateData) => {
    onSelect(t.templateId, t);
  }, [onSelect]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, margin: 0 }}>Pilih Frame</h1>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '0 24px 24px' }}>
        {loading && templates.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="spin" size={40} />
          </div>
        ) : templates.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--np-text-muted)' }}>No templates available</p>
          </div>
        ) : (
          <div className={styles.templateGrid}>
            {templates.map((t) => (
              <TemplateCard key={t._id || t.templateId} template={t} onSelect={handleCardClick} />
            ))}
          </div>
        )}
      </div>
      <div className={styles.newspaperFooter}>
        <div className={styles.mastheadMeta}>
          <span>VelvetSnap Photobooth</span>
          <a href="/admin/login" className={styles.mastheadLink}>Admin</a>
        </div>
      </div>
    </div>
  );
}
