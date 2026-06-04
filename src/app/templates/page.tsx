'use client';

import { useRouter } from 'next/navigation';
import { LayoutTemplate, Loader2, ArrowLeft, Camera as CameraIcon, Check } from 'lucide-react';
import styles from './page.module.css';
import { useState, useEffect } from 'react';

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
}

function SlotDots({ count }: { count: number }) {
  return (
    <span className={styles.slotDots}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={styles.slotDot} />
      ))}
    </span>
  );
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

  return (
    <div className={styles.page}>
      {/* ── Stepper ── */}
      <div className={styles.stepper}>
        <div className={`${styles.stepItem} ${styles.stepActive}`}>
          <span className={styles.stepNum}><LayoutTemplate size={16} /></span>
          <span className={styles.stepLabel}>Template</span>
        </div>
        <div className={`${styles.stepLine} ${styles.stepLineDone}`} />
        <div className={styles.stepItem}>
          <span className={styles.stepNum}><CameraIcon size={16} /></span>
          <span className={styles.stepLabel}>Photo</span>
        </div>
        <div className={styles.stepLine} />
        <div className={styles.stepItem}>
          <span className={styles.stepNum}><Check size={16} /></span>
          <span className={styles.stepLabel}>Edit</span>
        </div>
        <div className={styles.stepLine} />
        <div className={styles.stepItem}>
          <span className={styles.stepNum}><CameraIcon size={16} /></span>
          <span className={styles.stepLabel}>Pay</span>
        </div>
      </div>

      <div className={styles.headerRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <ArrowLeft size={18} />
          </button>
          <h1 className={styles.heading}>Pilih Frame</h1>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingWrap}>
          <Loader2 className="spin" size={40} color="#262626" />
        </div>
      ) : templates.length === 0 ? (
        <p className={styles.empty}>Tidak ada template.</p>
      ) : (
        <div className={styles.grid}>
          {templates.map((t) => (
            <button key={t._id} className={styles.card} onClick={() => handleSelect(t.templateId)}>
              <div className={styles.cardThumb}>
                {t.frameImage ? (
                  <img src={t.frameImage} alt={t.name} loading="lazy" decoding="async" />
                ) : (
                  <LayoutTemplate size={48} style={{ color: t.color }} />
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{t.name}</div>
                <div className={styles.cardMeta}>
                  <span className={styles.cardPrice}>Rp{(t.price || 0).toLocaleString('id-ID')}</span>
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
