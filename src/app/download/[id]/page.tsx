import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { isValidObjectId } from 'mongoose';
import NextImage from 'next/image';
import { Download, Smartphone } from 'lucide-react';
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

const META: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--np-text-muted)', padding: '0 4px', lineHeight: 1 };
const RULE: React.CSSProperties = { height: 1, background: 'var(--np-border)', margin: '4px 0', border: 'none', flexShrink: 0 };
const LINK: React.CSSProperties = { color: 'var(--np-text)', textDecoration: 'none', borderBottom: '1px solid var(--np-border)' };

export default async function DownloadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tx, themeRes] = await Promise.all([
    getTransaction(id),
    fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000'}/api/settings`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => d.data?.uiTheme || 'v1')
      .catch(() => 'v1' as string),
  ]);

  const isV2 = themeRes === 'v2';
  const downloadUrl = tx ? `${process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000'}/download/${id}` : null;

  if (!tx) {
    return (
      <div className={styles.page} style={isV2 ? V2_VARS as React.CSSProperties : undefined}>
        <div className={styles.card}>
          {isV2 && (
            <>
              <div style={META}><span>VelvetSnap Photobooth</span><span>Edition</span></div>
              <hr style={RULE} />
              <h1 className={styles.mastheadTitle}>PHOTO<span className={styles.mastheadAccent}> NOT FOUND</span></h1>
              <hr style={RULE} />
            </>
          )}
          <h1 className={styles.heading}>Photo not found</h1>
          <p className={styles.subtitle}>This download link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const BtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', border: '3px solid var(--np-border)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.1s', lineHeight: 1, textDecoration: 'none', color: 'var(--np-text)', background: 'var(--np-card)', boxShadow: 'var(--np-shadow-sm)' };
  const BtnPrimary: React.CSSProperties = { ...BtnStyle, background: 'var(--np-accent)', color: '#fff' };

  return (
    <div className={styles.page} style={isV2 ? { ...V2_VARS as React.CSSProperties, display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' } : undefined}>
      {isV2 && (
        <div style={{ flexShrink: 0, textAlign: 'center', padding: '8px 24px 0' }}>
          <div style={META}><span>VelvetSnap Photobooth</span><span>Edition</span></div>
          <hr style={RULE} />
          <h1 className={styles.mastheadTitle}>YOUR<span className={styles.mastheadAccent}> PHOTOS</span></h1>
          <hr style={RULE} />
        </div>
      )}

      {!isV2 && (
        <div style={{ flexShrink: 0, padding: '24px 24px 0' }}>
          <h1 className={styles.heading}>Your Photos</h1>
          <p className={styles.subtitle}>Download your photo strip and individual photos.</p>
        </div>
      )}

      <div className={styles.resultLayout}>
        <div className={styles.resultPreview}>
          {tx.finalImage ? (
            <div className={styles.resultImage}>
              <NextImage src={tx.finalImage} alt="Photo strip" className={styles.resultImg} width={400} height={1200} style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '70dvh', height: 'auto', width: 'auto', border: isV2 ? '4px solid var(--np-border)' : 'none', boxShadow: isV2 ? 'var(--np-shadow)' : 'none' }} />
            </div>
          ) : tx.captures?.length > 0 ? (
            <div className={styles.thumbGrid}>
              {tx.captures.map((url: string, i: number) => (
                <NextImage key={i} src={url} alt={`Photo ${i + 1}`} width={200} height={266} style={{ objectFit: 'cover', border: isV2 ? '2px solid var(--np-border)' : '1px solid #eee' }} />
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.resultSidebar}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tx.finalImage && (
              <a href={tx.finalImage} download style={BtnPrimary}>
                <Download size={16} /> Download Strip
              </a>
            )}
            {tx.captures?.length > 0 && tx.captures.map((url: string, i: number) => (
              <a key={i} href={url} download style={BtnStyle}>
                <Download size={16} /> Photo {i + 1}
              </a>
            ))}
          </div>

          {downloadUrl && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <hr style={RULE} />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--np-text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Smartphone size={14} /> Scan to download
              </p>
              <DownloadQr url={downloadUrl} />
            </div>
          )}
        </div>
      </div>

      {isV2 && (
        <div className={styles.newspaperFooter}>
          <hr style={RULE} />
          <div style={META}>
            <span>VelvetSnap Photobooth</span>
            <a href="/admin/login" style={LINK}>Admin</a>
          </div>
        </div>
      )}
    </div>
  );
}
