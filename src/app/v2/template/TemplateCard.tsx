'use client';
import Image from 'next/image';
import styles from '../page.module.css';
import type { TemplateData } from '../types';

export default function TemplateCard({ template, selected, onSelect }: {
  template: TemplateData; selected: boolean; onSelect: () => void;
}) {
  const imgSrc = template.templateThumb || template.templateFull;

  return (
    <div className={`${styles.templateCard} ${selected ? styles.templateCardSelected : ''}`} onClick={onSelect}>
      {imgSrc ? (
        <Image src={imgSrc} alt={template.templateName} width={200} height={300}
          className={styles.templateCardImg} />
      ) : (
        <div className={styles.templateCardImg} style={{ background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#888' }}>NO PREVIEW</span>
        </div>
      )}
      <div className={styles.templateCardBody}>
        <div className={styles.templateCardName}>{template.templateName}</div>
        <div className={styles.templateCardDesc}>{template.templateDesc}</div>
        <div className={styles.templateCardPrice}>Rp {(template.templatePrice || 0).toLocaleString('id-ID')}</div>
      </div>
    </div>
  );
}
