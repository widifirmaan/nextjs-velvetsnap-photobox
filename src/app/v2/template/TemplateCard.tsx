'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import styles from '../page.module.css';
import type { TemplateData } from '../types';
import { getOptimizedUrl } from '@/lib/cloudinary-url';

export default function TemplateCard({ template, onSelect, keyedFrameUrl }: {
  template: TemplateData; onSelect: (t: TemplateData) => void; keyedFrameUrl?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  const imgSrc = keyedFrameUrl || (template.templateFull ? getOptimizedUrl(template.templateFull, 200, 600) : '') || template.templateThumb || '';
  const slotCount = template.templateData?.slots || 1;

  return (
    <button className={styles.templateCard} onClick={() => onSelect(template)}
      style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}>
      <div style={{ flex: 1, position: 'relative', minHeight: 0, background: '#ddd', overflow: 'hidden' }}>
        {!loaded && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}><Loader2 className="spin" size={24} /></div>}
        {imgSrc ? (
          <Image src={imgSrc} alt={template.templateName} fill sizes="200px"
            className={styles.templateCardImg} onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#888' }}>NO PREVIEW</span>
          </div>
        )}
      </div>
      <div className={styles.templateCardBody}>
        <div className={styles.templateCardName}>{template.templateName}</div>
        <div className={styles.templateCardDesc}>{template.templateDesc}</div>
        <div className={styles.templateCardFooter}>
          <div className={styles.templateCardPrice}>Rp {(template.templatePrice || 0).toLocaleString('id-ID')}</div>
          <div className={styles.slotDots}>
            {Array.from({ length: slotCount }).map((_, i) => (
              <span key={i} className={styles.slotDot} />
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
