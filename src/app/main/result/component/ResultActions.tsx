'use client';
import { useEffect, useRef } from 'react';
import { Download, Printer, Home as HomeIcon, Smartphone } from 'lucide-react';
import styles from '@/app/main/page.module.css';

export default function ResultActions({
  compositedImage, onHome, txId,
}: {
  compositedImage: string | null; onHome: () => void; txId?: string | null;
}) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const downloadUrl = txId ? `${window.location.origin}/download/${txId}` : null;

  useEffect(() => {
    if (!qrRef.current || !downloadUrl) return;
    import('qrcode').then((QRCode) => {
      QRCode.toCanvas(qrRef.current!, downloadUrl, {
        width: 140,
        margin: 2,
        color: { dark: '#1d1d1f', light: '#ffffff' },
      });
    });
  }, [downloadUrl]);

  const handleDownload = () => {
    if (!compositedImage) return;
    const link = document.createElement('a');
    link.download = `photobooth-${Date.now()}.jpg`;
    link.href = compositedImage;
    link.click();
  };

  const handlePrint = () => {
    if (!compositedImage) return;
    const img = new window.Image();
    img.onload = () => {
      const pw = img.naturalWidth;
      const ph = img.naturalHeight;
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(`<!DOCTYPE html><html><head><style>
        @page{margin:0;size:${pw}px ${ph}px}
        *{margin:0;padding:0;box-sizing:border-box}
        body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#000}
        img{display:block;width:${pw}px;height:${ph}px;max-width:100vw;max-height:100vh;object-fit:contain}
        @media print{body{background:none}}
      </style></head><body><img src="${compositedImage}" /></body></html>`);
      win.document.close();
      setTimeout(() => { win.focus(); win.print(); }, 500);
    };
    img.src = compositedImage;
  };

  return (
    <div className={styles.resultActions}>
      <button className={styles.boothBtnPrimary} onClick={handleDownload}>
        <Download size={18} /> Download JPEG
      </button>
      <button className={styles.boothBtnSecondary} onClick={handlePrint}>
        <Printer size={18} /> Print
      </button>
      <button className={`${styles.boothBtnSecondary} ${styles.resultHomeBtn}`} onClick={onHome}>
        <HomeIcon size={18} /> Home
      </button>

      {downloadUrl && (
        <div className={styles.qrSection}>
          <div className={styles.qrDivider} />
          <p className={styles.qrLabel}>
            <Smartphone size={14} /> Scan to download on your phone
          </p>
          <canvas ref={qrRef} className={styles.qrCanvas} />
          <p className={styles.qrUrl}>{downloadUrl}</p>
        </div>
      )}
    </div>
  );
}
