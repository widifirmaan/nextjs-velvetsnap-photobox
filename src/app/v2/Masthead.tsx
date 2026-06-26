'use client';
import { ArrowLeft, Timer } from 'lucide-react';
import styles from './page.module.css';

export default function Masthead({ top, title, tagline, bottom, onBack, timer }: {
  top?: React.ReactNode; title: React.ReactNode;
  tagline?: string; bottom?: React.ReactNode; onBack?: () => void; timer?: string;
}) {
  return (
    <div className={styles.newspaperHeader}>
      {top && <div className={styles.mastheadMeta}>{top}</div>}
      <div className={styles.mastheadRule} />
      <div style={{ position: 'relative' }}>
        {onBack && (
          <button onClick={onBack} className={styles.mastheadBackBtn} style={{
            border: '3px solid var(--np-border)', cursor: 'pointer',
            padding: '6px 12px', display: 'flex', alignItems: 'center', color: 'var(--np-text)',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, lineHeight: 1,
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
            background: 'var(--np-card)', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <ArrowLeft size={22} /> BACK
          </button>
        )}
        {timer && (
          <div className={styles.mastheadBackBtn} style={{
            border: '3px solid var(--np-border)', padding: '6px 12px',
            display: 'flex', alignItems: 'center', gap: 6, color: 'var(--np-text)',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, lineHeight: 1,
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
            background: 'var(--np-card)', letterSpacing: '0.04em',
          }}>
            <Timer size={16} /> {timer}
          </div>
        )}
        <h1 className={styles.mastheadTitle}>{title}</h1>
        {tagline && <p className={styles.mastheadTagline}>{tagline}</p>}
      </div>
      <div className={styles.mastheadRule} />
      {bottom && <div className={styles.mastheadMeta}>{bottom}</div>}
    </div>
  );
}
