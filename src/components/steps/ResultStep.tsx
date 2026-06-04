'use client';

import { Download, Printer, Home as HomeIcon, Loader2 } from 'lucide-react';
import styles from '@/app/page.module.css';
import StepperBar from './StepperBar';

export default function ResultStep({ compositedImage, onHome }: { compositedImage: string | null; onHome: () => void }) {
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
    <div className={`${styles.stepPage} ${styles.stepPageResult}`}>
      <StepperBar current={4} total={5} />
      <h2 className={styles.stepHeading} style={{ margin: '24px 0 8px' }}>Your Photos are Ready!</h2>
      <p style={{ color: '#888', marginBottom: '20px' }}>Download or print your photo strip.</p>
      <div className={styles.resultLayout}>
        <div className={styles.resultImage}>
          {compositedImage ? <img src={compositedImage} alt="Final strip" /> : <Loader2 className="spin" size={40} />}
        </div>
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
        </div>
      </div>
    </div>
  );
}
