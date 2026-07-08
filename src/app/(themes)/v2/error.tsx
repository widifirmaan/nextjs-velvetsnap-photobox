// File: src/app/(themes)/v2/error.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import styles from './page.module.css';

export default function V2Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={styles.errorPage}>
      <h2>Something went wrong</h2>
      <p>{error.message || 'An unexpected error occurred'}</p>
      <button className={styles.boothBtn} onClick={reset} style={{ marginTop: 12 }}>Try Again</button>
    </div>
  );
}
