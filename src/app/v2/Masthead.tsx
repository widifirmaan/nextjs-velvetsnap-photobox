'use client';
import { ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

export default function Masthead({ top, title, tagline, bottom, onBack }: {
  top?: React.ReactNode; title: React.ReactNode;
  tagline?: string; bottom?: React.ReactNode; onBack?: () => void;
}) {
  return (
    <div className={styles.newspaperHeader}>
      {top && <div className={styles.mastheadMeta}>{top}</div>}
      <div className={styles.mastheadRule} />
      <div style={{ position: 'relative' }}>
        {onBack && (
          <button onClick={onBack} style={{
            background: 'none', border: '2px solid var(--np-border)', cursor: 'pointer',
            padding: '4px 8px', display: 'flex', alignItems: 'center', color: 'var(--np-text)',
            fontFamily: 'var(--font-body)', lineHeight: 1,
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          }}>
            <ArrowLeft size={28} />
          </button>
        )}
        <h1 className={styles.mastheadTitle}>{title}</h1>
        {tagline && <p className={styles.mastheadTagline}>{tagline}</p>}
      </div>
      <div className={styles.mastheadRule} />
      {bottom && <div className={styles.mastheadMeta}>{bottom}</div>}
    </div>
  );
}
