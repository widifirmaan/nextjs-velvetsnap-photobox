'use client';
import styles from './page.module.css';

export default function V2Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={styles.errorPage}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 900, color: 'var(--np-accent)', textTransform: 'uppercase' }}>PRESS ERROR</h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--np-text-secondary)' }}>{error.message || 'An unexpected error occurred'}</p>
      <button className={styles.boothBtn} onClick={reset} style={{ marginTop: 12 }}>TRY AGAIN</button>
    </div>
  );
}
