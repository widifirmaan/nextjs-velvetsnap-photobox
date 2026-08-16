// File: src/app/(themes)/v2/download/page.tsx
// Description: Download page styled for the v2 (newspaper) theme.

'use client';
import { Suspense } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { useDownloadData } from '@/lib/hooks/useDownloadData';
import Masthead from '../Masthead';
import DownloadQr from '@/app/download/DownloadQr';
import styles from '../page.module.css';

function splitTitle(appName: string): [string, string] {
  let caps = 0;
  for (let i = 0; i < appName.length; i++) {
    if (appName[i] >= 'A' && appName[i] <= 'Z') caps++;
    if (caps === 2) return [appName.slice(0, i), appName.slice(i)];
  }
  const mid = Math.ceil(appName.length / 2);
  return [appName.slice(0, mid), appName.slice(mid)];
}

function V2DownloadContent() {
  const { id, tx, settings, host } = useDownloadData();
  const appName = settings?.appName || 'VelvetSnap';
  const location = settings?.header?.location || 'Jakarta';
  let navItems: { label: string; url: string }[] = [];
  try { navItems = JSON.parse(settings?.header?.navItems || '[]'); } catch {}
  const downloadUrl = tx && id ? `${window.location.origin}/v2/download?id=${encodeURIComponent(id)}` : null;
  const [accent, rest] = splitTitle(appName);

  if (!tx) {
    return (
      <div className={styles.stepPage}>
        <Masthead
          onBack={() => { window.location.href = '/v2'; }}
          backLabel="HOME"
          top={<>
            <span>{host.toUpperCase()}</span>
            <span>&nbsp;</span>
            <span>Not Found</span>
          </>}
          title={<><span className={styles.mastheadAccent}>{accent}</span>{rest}<span className={styles.mastheadAccent}> NOT FOUND</span></>}
          tagline="This download link may be invalid or expired."
          bottom={<>
            <span>Price Rp 35.000</span>
            <span>Est. 2024</span>
            <span className={styles.navItems}>
              {(navItems || []).map((item, i) => (
                <a key={i} href={item.url} className={styles.mastheadLink}>{item.label}</a>
              ))}
            </span>
          </>}
        />
        <div className={styles.notFound}>
          <p>This download link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepPage}>
      <Masthead
        onBack={() => { window.location.href = '/v2'; }}
        backLabel="HOME"
        top={<>
          <span>{host.toUpperCase()}</span>
          <span>{tx.captures?.length || 0} PHOTOS</span>
          <span>{location} — Edition</span>
        </>}
        title={<><span className={styles.mastheadAccent}>{accent}</span>{rest}</>}
        tagline="Download your photo strip and individual photos."
        bottom={<>
          <span>Price Rp {tx.price?.toLocaleString('id-ID') || '35.000'}</span>
          <span>Est. 2024</span>
          <span className={styles.navItems}>
            {(navItems || []).map((item, i) => (
              <a key={i} href={item.url} className={styles.mastheadLink}>{item.label}</a>
            ))}
          </span>
        </>}
      />

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
                <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%', border: '3px solid var(--np-border)', boxShadow: 'var(--np-shadow-sm)' }}>
                  <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <a href={url} download className={styles.downloadBtn}>
                  <Download size={16} /> Photo {i + 1}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.resultSidebar} ${styles.downloadSidebar}`}>
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
    </div>
  );
}

export default function V2DownloadPage() {
  return <Suspense fallback={null}><V2DownloadContent /></Suspense>;
}
