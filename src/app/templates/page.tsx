'use client';

import { useRouter } from 'next/navigation';
import { LayoutTemplate, Loader2, ArrowLeft, Camera as CameraIcon, Check, Columns, Layout } from 'lucide-react';
import styles from './page.module.css';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

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
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoRef = useRef<number>(0);
  const idleRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  const tripled = useMemo(
    () => [...templates, ...templates, ...templates],
    [templates]
  );

  const updateTransforms = useCallback(() => {
    const c = trackRef.current;
    if (!c) return;

    const oneSet = c.scrollWidth / 3;
    if (c.scrollLeft >= oneSet * 2) c.scrollLeft -= oneSet;
    else if (c.scrollLeft < oneSet) c.scrollLeft += oneSet;

    const cx = c.scrollLeft + c.clientWidth / 2;
    slideRefs.current.forEach((el) => {
      if (!el) return;
      const ecx = el.offsetLeft + el.offsetWidth / 2;
      const dist = (ecx - cx) / (c.clientWidth * 0.5);
      const abs = Math.abs(dist);
      const sign = Math.sign(dist);
      let rotY: number, scale: number, zIdx: number;
      if (abs < 0.5) {
        rotY = sign * abs * 10;
        scale = 1 - abs * 0.12;
        zIdx = 50;
      } else if (abs < 1) {
        const t = (abs - 0.5) / 0.5;
        rotY = sign * 5;
        scale = 0.94 - t * 0.21;
        zIdx = 50 - t * 35;
      } else {
        rotY = sign * 5;
        scale = 0.73;
        zIdx = 15;
      }
      el.style.transform = `perspective(700px) rotateY(${rotY}deg) scale(${scale})`;
      el.style.zIndex = Math.round(zIdx).toString();
      el.style.opacity = String(Math.max(0.1, 1 - abs * 0.55));
    });
  }, []);

  useEffect(() => {
    if (viewMode !== 'carousel' || !templates.length) return;
    slideRefs.current = templates.map(() => null);
  }, [templates, viewMode]);

  useEffect(() => {
    if (viewMode !== 'carousel') return;
    const c = trackRef.current;
    if (!c || !templates.length) return;
    requestAnimationFrame(() => {
      if (c.scrollWidth > c.clientWidth) {
        c.scrollLeft = c.scrollWidth / 3;
      }
      const onScroll = () => requestAnimationFrame(updateTransforms);
      c.addEventListener('scroll', onScroll, { passive: true });
      updateTransforms();
      return () => c.removeEventListener('scroll', onScroll);
    });
  }, [updateTransforms, templates.length, viewMode]);

  useEffect(() => {
    if (viewMode !== 'carousel' || !templates.length) return;
    const c = trackRef.current;
    if (!c || c.scrollWidth <= c.clientWidth) return;
    let running = true;
    const step = () => {
      if (!running) return;
      const oneSet = c.scrollWidth / 3;
      c.scrollLeft += 0.8;
      if (c.scrollLeft >= oneSet * 2) c.scrollLeft -= oneSet;
      else if (c.scrollLeft < oneSet) c.scrollLeft += oneSet;
      autoRef.current = requestAnimationFrame(step);
    };
    autoRef.current = requestAnimationFrame(step);
    return () => { running = false; cancelAnimationFrame(autoRef.current); };
  }, [templates.length, viewMode]);

  const stopAuto = useCallback(() => {
    cancelAnimationFrame(autoRef.current);
    clearTimeout(idleRef.current);
  }, []);

  const resumeAuto = useCallback(() => {
    clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => {
      if (viewMode !== 'carousel') return;
      const c = trackRef.current;
      if (!c || c.scrollWidth <= c.clientWidth) return;
      const step = () => {
        const oneSet = c.scrollWidth / 3;
        c.scrollLeft += 0.8;
        if (c.scrollLeft >= oneSet * 2) c.scrollLeft -= oneSet;
        else if (c.scrollLeft < oneSet) c.scrollLeft += oneSet;
        autoRef.current = requestAnimationFrame(step);
      };
      autoRef.current = requestAnimationFrame(step);
    }, 3000);
  }, [viewMode]);

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
        <div className={styles.toggleRow}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'carousel' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode('carousel')}
          >
            <Layout size={16} /> Carousel
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Columns size={16} /> Grid
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingWrap}>
          <Loader2 className="spin" size={40} color="#262626" />
        </div>
      ) : templates.length === 0 ? (
        <p className={styles.empty}>Tidak ada template.</p>
      ) : viewMode === 'carousel' ? (
        /* ── Carousel / CoverFlow View ── */
        <div
          ref={trackRef}
          className={styles.carouselTrack}
          onPointerDown={stopAuto}
          onPointerUp={resumeAuto}
          onPointerLeave={resumeAuto}
        >
          {tripled.map((t, i) => (
            <div
              key={`${t._id}-${i}`}
              ref={(el) => { slideRefs.current[i] = el; }}
              className={styles.carouselSlide}
              onClick={() => handleSelect(t.templateId)}
            >
              <div className={styles.carouselSlideInner}>
                {t.frameImage ? (
                  <img src={t.frameImage} alt={t.name} draggable={false} />
                ) : (
                  <LayoutTemplate size={40} style={{ color: t.color }} />
                )}
              </div>
              <div className={styles.carouselSlideLabel}>
                <span className={styles.carouselSlideName}>{t.name}</span>
                <span className={styles.carouselSlidePrice}>Rp{(t.price || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Grid View ── */
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
