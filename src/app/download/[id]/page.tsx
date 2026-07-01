import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { isValidObjectId } from 'mongoose';
import NextImage from 'next/image';
import { Download, Smartphone } from 'lucide-react';
import { UnifrakturMaguntia, EB_Garamond } from 'next/font/google';
import styles from './page.module.css';
import type { Metadata } from 'next';
import DownloadQr from './DownloadQr';

const unifraktur = UnifrakturMaguntia({ subsets: ['latin'], display: 'swap', variable: '--font-unifraktur', weight: '400' });
const ebGaramond = EB_Garamond({ subsets: ['latin'], display: 'swap', variable: '--font-ebgaramond' });

export const metadata: Metadata = {
  title: 'Download Your Photos',
};

async function getTransaction(id: string) {
  await connectDB();
  const filter: Record<string, unknown>[] = [];
  if (isValidObjectId(id)) filter.push({ _id: id });
  filter.push({ orderId: id }, { sessionId: id });
  if (/^bypass_/i.test(id)) {
    const prefix = id.toUpperCase();
    filter.push({ orderId: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` } });
  }
  const tx = await Transaction.findOne({ $or: filter }).lean();
  return tx ? JSON.parse(JSON.stringify(tx)) : null;
}

const V2_VARS: Record<string, string> = {
  '--np-bg': '#f5f0e8',
  '--np-card': '#faf6ef',
  '--np-text': '#1a1a1a',
  '--np-text-secondary': '#4a4a4a',
  '--np-text-muted': '#8a8a8a',
  '--np-border': '#1a1a1a',
  '--np-accent': '#c73e3e',
  '--np-accent-hover': '#a83232',
  '--np-radius': '0px',
  '--np-radius-sm': '0px',
  '--np-shadow': '6px 6px 0px #1a1a1a',
  '--np-shadow-sm': '3px 3px 0px #1a1a1a',
  '--font-heading': 'var(--font-unifraktur, UnifrakturMaguntia, serif)',
  '--font-body': 'var(--font-ebgaramond, EB Garamond, Georgia, serif)',
};

export default async function DownloadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tx, themeRes] = await Promise.all([
    getTransaction(id),
    fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000'}/api/settings`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => d.data || { uiTheme: 'v1' })
      .catch(() => ({ uiTheme: 'v1' } as Record<string, unknown>)),
  ]);

  const isV2 = themeRes.uiTheme === 'v2';
  const appName = (themeRes.appName as string) || 'VelvetSnap';
  const downloadUrl = tx && id ? `${process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000'}/download/${id}` : null;

  if (!tx) {
    return (
      <div className={`${styles.stepPage}${isV2 ? ` ${unifraktur.variable} ${ebGaramond.variable}` : ''}`} style={isV2 ? V2_VARS as React.CSSProperties : undefined}>
        <div className={styles.stepContent}>
          <div className={styles.newspaperHeader}>
            <div className={styles.mastheadMeta}><span>DOWNLOAD</span><span>&nbsp;</span><span>Not Found</span></div>
            <div className={styles.mastheadRule} />
            <h1 className={styles.mastheadTitle}>{appName.toUpperCase()}<span className={styles.mastheadAccent}> NOT FOUND</span></h1>
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
    <div className={`${styles.stepPage}${isV2 ? ` ${unifraktur.variable} ${ebGaramond.variable}` : ''}`} style={isV2 ? V2_VARS as React.CSSProperties : undefined}>
      <div className={styles.stepContent}>
        <div className={styles.newspaperHeader}>
          <div className={styles.mastheadMeta}>
            <span>DOWNLOAD</span>
            <span>{tx.captures?.length || 0} PHOTOS</span>
          </div>
          <div className={styles.mastheadRule} />
          <h1 className={styles.mastheadTitle}>{appName.toUpperCase()}<span className={styles.mastheadAccent}> PHOTOS</span></h1>
          <p className={styles.mastheadTagline}>Download your photo strip and individual photos.</p>
          <div className={styles.mastheadRule} />
        </div>

        <div className={styles.resultLayout}>
          <div className={styles.resultPreview}>
            <div className={styles.previewInner}>
                {tx.finalImage && (
                  <div className={styles.stripCol}>
                    <NextImage src={tx.finalImage} alt="Photo strip" width={400} height={1200}
                      style={{
                        objectFit: 'contain', maxWidth: '100%', maxHeight: '100%',
                        width: '100%', height: 'auto',
                        ...(isV2 ? { border: '4px solid var(--np-border)', boxShadow: 'var(--np-shadow)' } : {}),
                      }} />
                    <a href={tx.finalImage} download className={styles.stripDownloadBtn}>
                      <Download size={16} /> Download Strip
                    </a>
                  </div>
                )}
                {tx.captures?.map((url: string, i: number) => (
                  <div key={i} className={styles.thumbCard}>
                    <NextImage src={url} alt={`Photo ${i + 1}`} width={200} height={266}
                      style={{ objectFit: 'cover', width: '100%', display: 'block', border: isV2 ? '3px solid var(--np-border)' : '1px solid #eee', boxShadow: isV2 ? 'var(--np-shadow-sm)' : 'none' }} />
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
            <a href="/admin/login" className={styles.mastheadLink}>Admin</a>
          </div>
        </div>
      </div>
    </div>
  );
}
