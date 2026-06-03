'use client';

import { useRouter } from 'next/navigation';
import { LayoutTemplate, Film, Newspaper, Loader2, ArrowLeft, Camera as CameraIcon, Check } from 'lucide-react';
import styles from './page.module.css';
import { useState, useEffect, useCallback } from 'react';

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

const CATEGORIES = ['All', 'Classic', 'Modern', 'Playful'];

function getCategory(templateId: string): string {
  switch (templateId) {
    case 't1': return 'Classic';
    case 't2': return 'Modern';
    case 't3': return 'Playful';
    default:   return 'Classic';
  }
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
  const [activeCat, setActiveCat] = useState('All');

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

  const handleSelect = useCallback((id: string) => {
    router.push(`/booth?template=${id}`);
  }, [router]);

  const filtered = activeCat === 'All'
    ? templates
    : templates.filter((t) => getCategory(t.templateId) === activeCat);

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

      <h1 className={styles.heading}>Pilih Frame</h1>

      <div className={styles.filterRow}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterTab} ${activeCat === cat ? styles.filterTabActive : ''}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingWrap}>
          <Loader2 className="spin" size={40} color="#262626" />
        </div>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>Tidak ada template di kategori ini.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((t) => (
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

      <div className={styles.backWrap}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ArrowLeft size={20} /> Kembali
        </button>
      </div>
    </div>
  );
}
