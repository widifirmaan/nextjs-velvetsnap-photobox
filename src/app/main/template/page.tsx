'use client';

import { useRouter } from 'next/navigation';
import { LayoutTemplate, Loader2, ArrowLeft, Camera as CameraIcon, Check } from 'lucide-react';
import styles from './page.module.css';
import { useState, useEffect } from 'react';

interface TemplateItem {
  _id: string;
  templateId: string;
  name: string;
  slots: number;
  price: number;
  color: string;
  isActive: boolean;
  thumbUrl?: string;
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
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates/list')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setTemplates(res.data.filter((t: TemplateItem) => t.isActive !== false) || []);
        }
      })
      .catch(() => {})
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
          <button className={styles.backBtn} onClick={() => router.push('/main')}>
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
        <div className={styles.empty}><Loader2 className="spin" size={40} /></div>
      ) : (
        <div className={styles.grid}>
          {templates.map((t) => (
            <button key={t._id} className={styles.card} onClick={() => handleSelect(t.templateId)}>
              <div className={styles.cardThumb}>
                {t.templateThumb ? (
                  <img src={t.templateThumb} alt={t.templateName} loading="lazy" decoding="async" />
                ) : (
                  <LayoutTemplate size={48} style={{ color: t.templateData?.color || '#007aff' }} />
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{t.templateName}</div>
                <div className={styles.cardMeta}>
                  <span className={styles.cardPrice}>Rp{(t.templatePrice || 0).toLocaleString('id-ID')}</span>
                  <SlotDots count={t.templateData?.slots || 1} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
