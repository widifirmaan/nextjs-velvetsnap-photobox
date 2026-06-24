'use client';
import { useState, useCallback } from 'react';
import styles from '../../page.module.css';
import ResultActions from './ResultActions';

export default function ResultStep({ image, orderId, onStartOver }: {
  image: string | null; orderId: string; onStartOver: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!image || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(image);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `velvetsnap-${orderId}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error('download failed', e); }
    setDownloading(false);
  }, [image, orderId, downloading]);

  return (
    <div className={styles.resultLayout}>
      <h2 className={styles.resultHeadline}>Your Photo Is Ready</h2>
      {image ? (
        <div className={styles.resultImage}>
          <img src={image} alt="Final result" />
        </div>
      ) : (
        <div className={styles.resultImage} style={{ aspectRatio: '2/3', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--np-card)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--np-text-muted)' }}>RENDERING...</span>
        </div>
      )}
      <ResultActions onDownload={handleDownload} onStartOver={onStartOver} />
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--np-text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Order #{orderId.slice(0, 12)}...
      </p>
    </div>
  );
}
