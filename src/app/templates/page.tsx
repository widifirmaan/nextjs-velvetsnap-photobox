'use client';

import { useRouter } from 'next/navigation';
import { LayoutTemplate, Film, Newspaper, Loader2, ArrowLeft, Camera as CameraIcon, Check, X, Sparkles, ChevronRight } from 'lucide-react';
import styles from './page.module.css';
import { useState, useEffect, useCallback } from 'react';

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

const CATEGORIES = ['All', 'Classic', 'Modern', 'Playful'];
const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
];

function getCategory(templateId: string): string {
  switch (templateId) {
    case 't1': return 'Classic';
    case 't2': return 'Modern';
    case 't3': return 'Playful';
    default:   return 'Classic';
  }
}

function slotCountDots(count: number) {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(<span key={i} className={`${styles.slotDot} ${styles.slotDotFilled}`} />);
  }
  return items;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All');
  const [preview, setPreview] = useState<TemplateData | null>(null);

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

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="page-container">
      {/* ── Stepper ── */}
      <div className={styles.stepper} style={{ justifyContent: 'center', alignSelf: 'center' }}>
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

      <h1 className="title" style={{ marginTop: '4px' }}>Choose Your Frame</h1>
      <p className="subtitle">Swipe through styles, tap to preview</p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 className="spin" size={40} color="var(--accent-color)" />
        </div>
      ) : (
        <>
          {/* ── #4: Category Filter Tabs ── */}
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

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              No templates in this category.
            </div>
          ) : (
            <>
              {/* ── #6: Hero Card (featured) ── */}
              {featured && (
                <div className={styles.heroCard} onClick={() => setPreview(featured)}>
                  <div className={styles.heroInner}>
                    <div className={styles.heroImageWrap}>
                      {featured.frameImage ? (
                        <img src={featured.frameImage} alt={featured.name} loading="lazy" decoding="async" />
                      ) : (
                        <LayoutTemplate size={48} style={{ color: featured.color }} />
                      )}
                    </div>
                    <div className={styles.heroInfo}>
                      <span className={styles.heroBadge}><Sparkles size={12} /> Featured</span>
                      <h2 className={styles.heroTitle}>{featured.name}</h2>
                      <p className={styles.heroDesc}>{featured.description}</p>
                      <div className={styles.heroFooter}>
                        <span className={styles.heroPrice}>Rp {(featured.price || 0).toLocaleString('id-ID')}</span>
                        <span className={styles.heroSlots}>
                          {slotCountDots(featured.slots)}
                          <span>{featured.slots} shots</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── #2: Horizontal Carousel ── */}
              {rest.length > 0 && (
                <>
                  <div className={styles.carouselLabel}>
                    <h2>Other Styles</h2>
                    <span className={styles.carouselHint}><ChevronRight size={14} /> Swipe</span>
                  </div>
                  <div className={styles.carousel}>
                    {rest.map((t) => (
                      <div key={t._id} className={styles.carouselCard} onClick={() => setPreview(t)}>
                        <div className={styles.carouselCardThumb}>
                          {t.frameImage ? (
                            <img src={t.frameImage} alt={t.name} loading="lazy" decoding="async" />
                          ) : (
                            <LayoutTemplate size={36} style={{ color: t.color }} />
                          )}
                        </div>
                        <div className={styles.carouselCardBody}>
                          <div className={styles.carouselCardName}>{t.name}</div>
                          <div className={styles.carouselCardDesc}>{t.description}</div>
                          <div className={styles.carouselCardFooter}>
                            <span className={styles.carouselCardPrice}>
                              Rp {(t.price || 0).toLocaleString('id-ID')}
                            </span>
                            <div className={styles.slotVisual}>
                              {slotCountDots(t.slots)}
                              <span className={styles.slotDotCount}>{t.slots}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
            <button className="mac-button secondary" onClick={() => router.back()} style={{ padding: '10px 20px', fontSize: '14px' }}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </>
      )}

      {/* ── #1: Preview Modal ── */}
      {preview && (
        <div className={styles.overlay} onClick={() => setPreview(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalPreview}>
              {preview.frameImage ? (
                <img src={preview.frameImage} alt={preview.name} />
              ) : (
                <LayoutTemplate size={64} style={{ color: preview.color }} />
              )}
              {preview.slotsLayout?.slice(0, 6).map((slot, i) => (
                <div
                  key={i}
                  className={styles.modalSampleSlot}
                  style={{ left: `${slot.x}%`, top: `${slot.y}%`, width: `${slot.w}%`, height: `${slot.h}%` }}
                >
                  <img src={SAMPLE_PHOTOS[i % SAMPLE_PHOTOS.length]} alt="" />
                </div>
              ))}
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>{preview.name}</h3>
                <button className={styles.modalClose} onClick={() => setPreview(null)}>
                  <X size={16} />
                </button>
              </div>
              <p className={styles.modalDesc}>{preview.description}</p>
              <div className={styles.modalRow}>
                <span className={styles.modalRowItem}>
                  <CameraIcon size={14} /> {preview.slots} shots
                </span>
                <span className={styles.modalRowItem}>
                  <span className={styles.slotVisual}>{slotCountDots(preview.slots)}</span>
                </span>
              </div>
              <button className={styles.modalSelectBtn} onClick={() => handleSelect(preview.templateId)}>
                <Check size={16} /> Select This Frame
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
