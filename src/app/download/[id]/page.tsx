import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { isValidObjectId } from 'mongoose';
import NextImage from 'next/image';
import { Download, Smartphone, Check } from 'lucide-react';
import styles from './page.module.css';
import type { Metadata } from 'next';
import DownloadQr from './DownloadQr';

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
  '--font-heading': 'UnifrakturMaguntia, serif',
  '--font-body': 'EB Garamond, Georgia, serif',
};

const lab = ['Template', 'Photo', 'Edit', 'Pay', 'Cetak'];
const rom = ['I', 'II', 'III', 'IV', 'V'];

function DownloadBtn({ url, label }: { url: string; label: string; primary?: boolean }) {
  const s: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '12px 20px', border: '3px solid var(--np-border)',
    fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer',
    transition: 'all 0.1s', lineHeight: 1, textDecoration: 'none',
    color: '#fff', background: 'var(--np-accent)', boxShadow: 'var(--np-shadow-sm)',
  };
  return <a href={url} download style={s}><Download size={16} /> {label}</a>;
}

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
      <div className={styles.stepPage} style={isV2 ? V2_VARS as React.CSSProperties : undefined}>
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
    <div className={styles.stepPage} style={isV2 ? V2_VARS as React.CSSProperties : undefined}>
      <div className={styles.stepContent}>
        <div className={styles.newspaperHeader}>
          <div className={styles.mastheadMeta}>
            <span>DOWNLOAD</span>
            <span>{tx.captures?.length || 0} PHOTOS</span>
            <span>Cetak</span>
          </div>
          <div className={styles.mastheadRule} />
          <h1 className={styles.mastheadTitle}>{appName.toUpperCase()}<span className={styles.mastheadAccent}> PHOTOS</span></h1>
          <p className={styles.mastheadTagline}>Download your photo strip and individual photos.</p>
          <div className={styles.mastheadRule} />
          <div className={styles.mastheadMeta}>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              {lab.map((l, i) => (
                <span key={i} style={{
                  color: i < 4 ? 'var(--np-text)' : 'var(--np-accent)',
                  fontWeight: i < 4 ? 400 : 700,
                  display: 'inline-flex', alignItems: 'center', gap: 2,
                }}>
                  {i < 4 ? <Check size={12} /> : ''}{rom[i]}. {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.resultLayout}>
          <div className={styles.resultPreview}>
            <div className={styles.resultImage}>
              {tx.finalImage ? (
                <NextImage src={tx.finalImage} alt="Photo strip" width={400} height={1200}
                  style={{
                    objectFit: 'contain', maxWidth: '100%', maxHeight: '70dvh',
                    height: 'auto', width: 'auto',
                    ...(isV2 ? { border: '4px solid var(--np-border)', boxShadow: 'var(--np-shadow)' } : {}),
                  }} />
              ) : tx.captures?.length > 0 ? (
                <div className={styles.thumbGrid}>
                  {tx.captures.map((url: string, i: number) => (
                    <NextImage key={i} src={url} alt={`Photo ${i + 1}`} width={200} height={266}
                      style={{ objectFit: 'cover', border: isV2 ? '3px solid var(--np-border)' : '1px solid #eee', boxShadow: isV2 ? 'var(--np-shadow-sm)' : 'none' }} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className={styles.resultSidebar}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, margin: 0, textAlign: 'center', flexShrink: 0 }}>
              Your Photos are Ready!
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tx.finalImage && <DownloadBtn url={tx.finalImage} label="Download Strip" primary />}
              {tx.captures?.map((url: string, i: number) => (
                <DownloadBtn key={i} url={url} label={`Photo ${i + 1}`} />
              ))}
            </div>

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
