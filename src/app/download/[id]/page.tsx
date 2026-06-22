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
  let tx;
  if (isValidObjectId(id)) {
    tx = await Transaction.findById(id).lean();
  }
  if (!tx) {
    tx = await Transaction.findOne({ orderId: id }).lean();
  }
  if (!tx) {
    tx = await Transaction.findOne({ sessionId: id }).lean();
  }
  return tx ? JSON.parse(JSON.stringify(tx)) : null;
}

function DownloadBtn({ url, label }: { url: string; label: string }) {
  return (
    <a href={url} download className={styles.downloadBtn} rel="noopener noreferrer">
      <Download size={18} /> {label}
    </a>
  );
}

export default async function DownloadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tx = await getTransaction(id);

  if (!tx) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Photo not found</h1>
          <p className={styles.subtitle}>This download link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
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
                  <NextImage src={url} alt={`Photo ${i + 1}`} className={styles.thumb} fill sizes="150px" />
                  <DownloadBtn url={url} label={`Photo ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
