// File: src/app/(themes)/v1/download/page.tsx
// Description: Download page styled for the v1 theme.

'use client';
import { Suspense } from 'react';
import { Download, MapPin, Smartphone } from 'lucide-react';
import { useDownloadData } from '@/lib/hooks/useDownloadData';
import DownloadQr from '@/app/download/DownloadQr';
import styles from '../page.module.css';

function V1DownloadContent() {
  const { id, tx, settings } = useDownloadData();
  const location = settings?.header?.location || 'Jakarta';
  let navItems: { label: string; url: string }[] = [];
  try { navItems = JSON.parse(settings?.header?.navItems || '[]'); } catch {}
  const downloadUrl = tx && id ? `${window.location.origin}/v1/download?id=${encodeURIComponent(id)}` : null;

  const nav = (
    <nav className={styles.nav}>
      {(navItems || []).map((item, i) => (
        <span key={item.url}>
          {i > 0 && <span className={styles.navSep} />}
          <a href={item.url} target={item.url.startsWith('http') ? '_blank' : undefined}
            rel={item.url.startsWith('http') ? 'noopener' : undefined}
            className={styles.navLink}>
            {item.label}
          </a>
        </span>
      ))}
    </nav>
  );

  if (!tx) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.location}>
            <MapPin size={16} />
            <span>{location}</span>
          </div>
          {nav}
        </header>
        <div className={styles.stepPage}>
          <h2 className={styles.stepHeading} style={{ margin: '24px 0 8px' }}>Not Found</h2>
          <p style={{ color: '#888', marginBottom: '20px' }}>This download link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.location}>
          <MapPin size={16} />
          <span>{location}</span>
        </div>
        {nav}
      </header>

      <div className={`${styles.stepPage} ${styles.stepPageResult}`}>
        <h2 className={styles.stepHeading} style={{ margin: '24px 0 8px' }}>Your Photos are Ready!</h2>
        <p style={{ color: '#888', marginBottom: '20px' }}>Download your photo strip and individual photos.</p>
        <div className={`${styles.resultLayout} ${styles.downloadLayout}`}>
          <div className={styles.resultPreview}>
            <div className={styles.previewInner}>
              {tx.finalImage && (
                <div className={styles.stripCol}>
                  <div className={styles.stripFrame}>
                    <img src={tx.finalImage} alt="Photo strip" style={{ width: '100%', height: '100%' }} />
                  </div>
                  <a href={tx.finalImage} download className={styles.stripDownloadBtn}>
                    <Download size={16} /> Download Strip
                  </a>
                </div>
              )}
              {(tx.captures || []).map((url, i) => (
                <div key={i} className={styles.thumbCard}>
                  <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%', border: '3px solid var(--mn-border)', boxShadow: 'var(--mn-shadow-sm, 0 4px 12px rgba(0,0,0,0.10))' }}>
                    <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <a href={url} download className={styles.downloadBtn}>
                    <Download size={16} /> Photo {i + 1}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.resultActions} ${styles.downloadSidebar}`}>
            {downloadUrl && (
              <div className={styles.qrSection}>
                <div className={styles.qrDivider} />
                <p className={styles.qrLabel}>
                  <Smartphone size={14} /> Scan to download
                </p>
                <DownloadQr url={downloadUrl} />
                <p className={styles.qrUrl}>{downloadUrl}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function V1DownloadPage() {
  return <Suspense fallback={null}><V1DownloadContent /></Suspense>;
}
