import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { isValidObjectId } from 'mongoose';
import NextImage from 'next/image';
import { Download, Image as LucideImage } from 'lucide-react';
import styles from './page.module.css';
import type { Metadata } from 'next';

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
  '--np-card-border': '3px solid #1a1a1a',
  '--np-image-border': '3px solid #1a1a1a',
  '--np-thumb-border': '2px solid #1a1a1a',
  '--np-btn-border': '3px solid #1a1a1a',
  '--font-heading': 'UnifrakturMaguntia, serif',
  '--font-body': 'EB Garamond, Georgia, serif',
};

function DownloadBtn({ url, label }: { url: string; label: string }) {
  return (
    <a href={url} download className={styles.downloadBtn} rel="noopener noreferrer">
      <Download size={18} /> {label}
    </a>
  );
}

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

  const content = !tx ? (
    <>
      <h1 className={styles.heading}>Photo not found</h1>
      <p className={styles.subtitle}>This download link may be invalid or expired.</p>
    </>
  ) : (
    <>
      <h1 className={styles.heading}>Your Photos</h1>
      <p className={styles.subtitle}>Download your photo strip and individual photos.</p>

      {tx.finalImage && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Photo Strip</h2>
          <div className={styles.imageWrap}>
            <NextImage src={tx.finalImage} alt="Photo strip" className={styles.image} fill sizes="400px" />
          </div>
          <DownloadBtn url={tx.finalImage} label="Download Strip" />
        </div>
      )}

      {tx.captures?.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <LucideImage size={18} /> Individual Photos ({tx.captures.length})
          </h2>
          <div className={styles.grid}>
            {tx.captures.map((url: string, i: number) => (
              <div key={i} className={styles.thumbCard}>
                <div className={styles.thumbWrap}>
                  <NextImage src={url} alt={`Photo ${i + 1}`} className={styles.thumb} fill sizes="(max-width:640px) 50vw, 200px" />
                </div>
                <DownloadBtn url={url} label={`Photo ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className={styles.page} style={isV2 ? V2_VARS as React.CSSProperties : undefined}>
      <div className={styles.card}>
        {content}
      </div>
    </div>
  );
}
