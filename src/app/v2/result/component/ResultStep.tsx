'use client';
import { useEffect, useRef } from 'react';
import { Loader2, Download, Printer, Home as HomeIcon, Smartphone } from 'lucide-react';
import { PRINT_WINDOW_DELAY } from '@/lib/constants';
import styles from '../../page.module.css';

export default function ResultStep({ compositedImage, onHome, txId }: {
  compositedImage: string | null; onHome: () => void; txId?: string | null;
}) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const downloadUrl = txId ? `${window.location.origin}/download/${txId}` : null;

  useEffect(() => {
    if (!qrRef.current || !downloadUrl) return;
    import('qrcode').then((QRCode) => {
      QRCode.toCanvas(qrRef.current!, downloadUrl, {
        width: 140, margin: 2,
        color: { dark: '#1d1d1f', light: '#ffffff' },
      });
    });
  }, [downloadUrl]);

  const handleDownload = () => {
    if (downloadUrl) window.location.href = downloadUrl;
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
      setTimeout(() => { win.focus(); win.print(); }, PRINT_WINDOW_DELAY);
    };
    img.src = compositedImage;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className={styles.resultLayout}>
        <div className={styles.resultPreview}>
          <div className={styles.resultImage}>
            {compositedImage ? (
              <img src={compositedImage} alt="Final strip" />
            ) : (
              <Loader2 className="spin" size={32} style={{ color: 'var(--np-accent)' }} />
            )}
          </div>
        </div>
        <div className={styles.resultSidebar}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, margin: 0, textAlign: 'center', flexShrink: 0 }}>Your Photos are Ready!</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className={`${styles.boothBtn} ${styles.boothBtnPrimary}`} onClick={handleDownload}>
              <Download size={16} /> Download JPEG
            </button>
            <button className={styles.boothBtn} onClick={handlePrint}>
              <Printer size={16} /> Print
            </button>
            <button className={styles.boothBtn} onClick={onHome}>
              <HomeIcon size={16} /> Home
            </button>
          </div>
          {downloadUrl && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <div style={{ borderTop: '2px solid var(--np-border)', marginBottom: 12 }} />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--np-text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Smartphone size={14} /> Scan to download
              </p>
              <canvas ref={qrRef} className={styles.qrCanvas} style={{ border: '3px solid var(--np-border)', boxShadow: 'var(--np-shadow-sm)' }} />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--np-text-muted)', marginTop: 8, wordBreak: 'break-all' }}>{downloadUrl}</p>
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
  );
}
