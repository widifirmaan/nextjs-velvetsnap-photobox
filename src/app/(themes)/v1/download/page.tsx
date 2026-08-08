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
        <div className={styles.downloadLayout}>
          <div className={styles.downloadPreview}>
            {tx.finalImage && (
              <div className={styles.stripCard}>
                <img src={tx.finalImage} alt="Photo strip" className={styles.stripImg} />
                <a href={tx.finalImage} download className={styles.stripDownloadBtn}>
                  <Download size={16} /> Download Strip
                </a>
              </div>
            )}
            {(tx.captures || []).map((url, i) => (
              <div key={i} className={styles.thumbCard}>
                <img src={url} alt={`Photo ${i + 1}`} className={styles.thumbImg} />
                <a href={url} download className={styles.downloadBtn}>
                  <Download size={12} /> Photo {i + 1}
                </a>
              </div>
            ))}
          </div>
          <div className={styles.resultActions}>
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
