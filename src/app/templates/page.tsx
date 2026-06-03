'use client';

import { useRouter } from 'next/navigation';
import { LayoutTemplate, Film, Newspaper, Loader2, ArrowLeft, Camera as CameraIcon, Check } from 'lucide-react';
import styles from './page.module.css';
import { useState, useEffect } from 'react';

interface ISlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TemplateData {
  _id: string;
  templateId: string;
  name: string;
  description: string;
  slots: number;
  price: number;
  color: string;
  isActive: boolean;
  frameImage?: string;
  slotsLayout?: ISlot[];
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates/thumbnails')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTemplates(data.data.filter((t: TemplateData) => t.isActive !== false) || []);
        }
      })
      .catch((err) => console.error('Failed to load templates:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (id: string) => {
    router.push(`/booth?template=${id}`);
  };

  const getTemplateIcon = (templateId: string, color: string) => {
    switch (templateId) {
      case 't1':
        return <LayoutTemplate size={32} style={{ color }} />;
      case 't2':
        return <Film size={32} style={{ color }} />;
      case 't3':
        return <Newspaper size={32} style={{ color }} />;
      default:
        return <LayoutTemplate size={32} style={{ color }} />;
    }
  };

  return (
    <div className="page-container">
      {/* ── Stepper ── */}
      <div className={styles.stepper}>
        <div className={`${styles.stepItem} ${styles.stepActive}`}>
          <span className={styles.stepNum}><LayoutTemplate size={14} /></span>
          <span className={styles.stepLabel}>Template</span>
        </div>
        <div className={styles.stepLine} />
        <div className={styles.stepItem}>
          <span className={styles.stepNum}><CameraIcon size={14} /></span>
          <span className={styles.stepLabel}>Photo</span>
        </div>
        <div className={styles.stepLine} />
        <div className={styles.stepItem}>
          <span className={styles.stepNum}><Check size={14} /></span>
          <span className={styles.stepLabel}>Edit</span>
        </div>
        <div className={styles.stepLine} />
        <div className={styles.stepItem}>
          <span className={styles.stepNum}><CameraIcon size={14} /></span>
          <span className={styles.stepLabel}>Pay</span>
        </div>
      </div>

      <h1 className="title" style={{ marginTop: '4px' }}>Choose a Template</h1>
      <p className="subtitle">Select your aesthetic frame style</p>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 className="spin" size={40} color="var(--accent-color)" />
        </div>
      ) : (
        <div className={styles.grid}>
          {templates.map((t) => (
            <div key={t._id} className={`glass-panel ${styles.card}`} onClick={() => handleSelect(t.templateId)}>
              {t.frameImage ? (
                <div className={styles.thumbnailWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.frameImage} alt={t.name} className={styles.cardImage} loading="lazy" decoding="async" />
                </div>
              ) : (
                <div className={styles.iconContainer} style={{ color: t.color }}>
                  {getTemplateIcon(t.templateId, t.color)}
                </div>
              )}
              <h2 className={styles.cardTitle}>{t.name}</h2>
              <p className={styles.cardDesc}>{t.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.price}>Rp {(t.price || 0).toLocaleString('id-ID')}</span>
                <span className={styles.slots}>{t.slots} Shots</span>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              No templates available. Please create templates in the Admin panel.
            </div>
          )}
        </div>
      )}
      
      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
        <button className="mac-button secondary" onClick={() => router.back()} style={{ padding: '10px 20px', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>
    </div>
  );
}

