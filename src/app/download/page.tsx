'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Smartphone } from 'lucide-react';
import styles from './page.module.css';
import DownloadQr from './DownloadQr';

function DownloadContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [tx, setTx] = useState(null);
  const [settings, setSettings] = useState(null);
  const [host, setHost] = useState('');

  useEffect(() => {
    if (!id) return;
    setHost(window.location.host);
    Promise.all([
      fetch(`/api/transactions/${id}`).then(r => r.json()).catch(() => ({ success: false })),
      fetch('/api/settings').then(r => r.json()).catch(() => ({ success: false, data: { uiTheme: 'v1' } })),
    ]).then(([txRes, settingsRes]) => {
      if (txRes.success) setTx(txRes.data);
      if (settingsRes.success) setSettings(settingsRes.data);
    });
  }, [id]);

  const uiTheme = settings?.uiTheme || 'v1';
  const isV2 = uiTheme === 'v2';
  const appName = settings?.appName || 'VelvetSnap';
  const downloadUrl = tx && id ? `${window.location.origin}/download?id=${id}` : null;

  const V2_VARS = {
    '--np-bg': '#f5f0e8', '--np-card': '#faf6ef', '--np-text': '#1a1a1a',
    '--np-text-secondary': '#4a4a4a', '--np-text-muted': '#8a8a8a', '--np-border': '#1a1a1a',
    '--np-accent': '#c73e3e', '--np-accent-hover': '#a83232', '--np-radius': '0px',
    '--np-radius-sm': '0px', '--np-shadow': '6px 6px 0px #1a1a1a', '--np-shadow-sm': '3px 3px 0px #1a1a1a',
  } as React.CSSProperties;

  if (!tx) {
    return (
      <div className={`${styles.stepPage}${isV2 ? '' : ''}`} style={isV2 ? V2_VARS : undefined}>
        <div className={styles.stepContent}>
          <div className={styles.newspaperHeader}>
            <div className={styles.mastheadMeta}><span>{host.toUpperCase()}</span><span>&nbsp;</span><span>Not Found</span></div>
            <div className={styles.mastheadRule} />
            <h1 className={styles.mastheadTitle}>{appName}<span className={styles.mastheadAccent}> NOT FOUND</span></h1>
            {isV2 && <p className={styles.mastheadTagline}>This download link may be invalid or expired.</p>}
            <div className={styles.mastheadRule} />
          </div>
          <div className={styles.notFound}>
            <p>This download link may be invalid or expired.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.stepPage}${isV2 ? '' : ''}`} style={isV2 ? V2_VARS : undefined}>
      <div className={styles.stepContent}>
        <div className={styles.newspaperHeader}>
          <div className={styles.mastheadMeta}>
            <span>{host.toUpperCase()}</span>
            <span>{tx.captures?.length || 0} PHOTOS</span>
          </div>
          <div className={styles.mastheadRule} />
          <h1 className={styles.mastheadTitle}>{appName}</h1>
          <p className={styles.mastheadTagline}>Download your photo strip and individual photos.</p>
          <div className={styles.mastheadRule} />
        </div>

        <div className={styles.resultLayout}>
          <div className={styles.resultPreview}>
            <div className={styles.previewInner}>
              {tx.finalImage && (
                <div className={styles.stripCol}>
                  <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%', ...(isV2 ? { border: '4px solid var(--np-border)', boxShadow: 'var(--np-shadow)' } : {}) }}>
                    <img src={tx.finalImage} alt="Photo strip" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <a href={tx.finalImage} download className={styles.stripDownloadBtn}>
                    <Download size={16} /> Download Strip
                  </a>
                </div>
              )}
              {(tx.captures || []).map((url, i) => (
                <div key={i} className={styles.thumbCard}>
                  <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%', ...(isV2 ? { border: '3px solid var(--np-border)', boxShadow: 'var(--np-shadow-sm)' } : {}) }}>
                    <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <a href={url} download className={styles.downloadBtn}>
                    <Download size={12} /> Photo {i + 1}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.resultSidebar}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, margin: 0, textAlign: 'center', flexShrink: 0 }}>
              Your Photos are Ready!
            </h2>
            {downloadUrl && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <div style={{ borderTop: '2px solid var(--np-border)', marginBottom: 12 }} />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--np-text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Smartphone size={14} /> Scan to download
                </p>
                <DownloadQr url={downloadUrl} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.newspaperFooter}>
          <div className={styles.mastheadMeta}>
            <span>VelvetSnap Photobooth</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DownloadPage() {
  return <Suspense fallback={null}><DownloadContent /></Suspense>;
}
