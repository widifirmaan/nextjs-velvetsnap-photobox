'use client';
import { useState } from 'react';
import styles from '../../page.module.css';
import ResultActions from './ResultActions';
import { downloadImageAsBlob } from '@/lib/download-utils';

export default function ResultStep({ image, orderId, onStartOver }: {
  image: string | null; orderId: string; onStartOver: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!image || downloading) return;
    setDownloading(true);
    try {
      await downloadImageAsBlob(image, `velvetsnap-${orderId || 'photo'}.jpg`);
    } catch (e) { console.error('download failed', e); }
    setDownloading(false);
  };

  return (
    <div className={styles.resultLayout}>
      <div className={styles.resultHeadline}>YOUR MEMORIES, PRINTED IN TIME</div>
      {image ? (
        <div className={styles.resultImage}>
          <img src={image} alt="Your photobooth strip" />
        </div>
      ) : (
        <div className={styles.skeleton} style={{ width: '100%', maxWidth: 400, aspectRatio: '3/4' }} />
      )}
      <ResultActions
        onDownload={handleDownload}
        onStartOver={onStartOver}
      />
    </div>
  );
}
