// File: src/components/result/ResultActions.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { useEffect, useRef } from 'react';
import { Download, Printer, Home as HomeIcon, Smartphone } from 'lucide-react';
import { PRINT_WINDOW_DELAY } from '@/lib/utils/constants';
import type { CSSProperties } from 'react';

interface ResultActionsProps {
  compositedImage: string | null;
  onHome: () => void;
  txId?: string | null;
  wrapperClassName?: string;
  primaryButtonClassName?: string;
  secondaryButtonClassName?: string;
  homeButtonClassName?: string;
  qrSectionClassName?: string;
  qrDividerClassName?: string;
  qrLabelClassName?: string;
  qrCanvasClassName?: string;
  qrUrlClassName?: string;
  buttonStyle?: CSSProperties;
}

export default function ResultActions({
  compositedImage,
  onHome,
  txId,
  wrapperClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  homeButtonClassName,
  qrSectionClassName,
  qrDividerClassName,
  qrLabelClassName,
  qrCanvasClassName,
  qrUrlClassName,
  buttonStyle,
}: ResultActionsProps) {
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
    <div className={wrapperClassName} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button className={primaryButtonClassName} style={buttonStyle} onClick={handleDownload}>
        <Download size={18} /> Download JPEG
      </button>
      <button className={secondaryButtonClassName} style={buttonStyle} onClick={handlePrint}>
        <Printer size={18} /> Print
      </button>
      <button className={homeButtonClassName} style={buttonStyle} onClick={onHome}>
        <HomeIcon size={18} /> Home
      </button>

      {downloadUrl && (
        <div className={qrSectionClassName}>
          <div className={qrDividerClassName} />
          <p className={qrLabelClassName}>
            <Smartphone size={14} /> Scan to download
          </p>
          <canvas ref={qrRef} className={qrCanvasClassName} />
          <p className={qrUrlClassName}>{downloadUrl}</p>
        </div>
      )}
    </div>
  );
}
