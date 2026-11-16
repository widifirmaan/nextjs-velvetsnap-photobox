'use client';
import { useEffect, useState } from 'react';
import styles from '../page.module.css';

export default function V2Preloader({ ready, appName, tagline }: { ready: boolean; appName?: string; tagline?: string }) {
  const [phase, setPhase] = useState<'loading' | 'fold' | 'gone'>('loading');

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setPhase('fold'), 600);
    return () => clearTimeout(t);
  }, [ready]);

  useEffect(() => {
    if (phase !== 'fold') return;
    const t = setTimeout(() => setPhase('gone'), 1000);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'gone') return null;

  const name = appName || 'VelvetSnap';

  return (
    <div className={`${styles.preloader} ${phase === 'fold' ? styles.preloaderFold : ''}`}>
      <div className={styles.preloaderMasthead}>
        <div className={styles.preloaderMeta}>The Daily</div>
        <h1 className={styles.preloaderTitle}>{name}</h1>
        <div className={styles.preloaderDivider} />
        <p className={styles.preloaderTagline}>
          {tagline || 'Loading...'}
        </p>
      </div>
      <div className={styles.preloaderSpinner} />
    </div>
  );
}
