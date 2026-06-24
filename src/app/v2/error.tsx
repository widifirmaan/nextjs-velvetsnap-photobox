'use client';
import styles from './page.module.css';

export default function V2Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={styles.errorPage}>
      <h2>Press Error</h2>
      <p>{error.message || 'An unexpected error occurred'}</p>
      <button className={styles.boothBtn} onClick={reset} style={{ marginTop: 12 }}>Try Again</button>
    </div>
  );
}
