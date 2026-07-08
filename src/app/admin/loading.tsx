// File: src/app/admin/loading.tsx
// Description: Auto-added top comment for easier file identification.

import styles from './page.module.css';

export default function AdminLoading() {
  return (
    <div className="page-stack">
      <div>
        <div className={styles.skeleton} style={{ width: 160, height: 22, borderRadius: 6, marginBottom: 6 }} />
        <div className={styles.skeleton} style={{ width: 280, height: 14, borderRadius: 4, marginTop: 4 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 20 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card card-sm" style={{ padding: 20 }}>
            <div className={styles.skeleton} style={{ width: 32, height: 32, borderRadius: 8, marginBottom: 12 }} />
            <div className={styles.skeleton} style={{ width: '70%', height: 14, borderRadius: 4, marginBottom: 6 }} />
            <div className={styles.skeleton} style={{ width: '50%', height: 24, borderRadius: 6 }} />
          </div>
        ))}
      </div>
      <div className={`card card-md ${styles.chartSection}`} style={{ marginTop: 24 }}>
        <div className={styles.skeleton} style={{ width: 200, height: 16, borderRadius: 4, marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 160 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
              <div className={styles.skeleton} style={{ width: '100%', maxWidth: 48, height: `${[60, 40, 80, 30, 70, 50, 90][i - 1]}%`, borderRadius: '8px 8px 0 0' }} />
              <div className={styles.skeleton} style={{ width: 30, height: 10, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
