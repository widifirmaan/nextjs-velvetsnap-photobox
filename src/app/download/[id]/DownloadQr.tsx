// File: src/app/download/[id]/DownloadQr.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import { useEffect, useRef } from 'react';

export default function DownloadQr({ url }: { url: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    import('qrcode').then((QRCode) => {
      QRCode.toCanvas(ref.current!, url, {
        width: 140, margin: 2,
        color: { dark: '#1d1d1f', light: '#ffffff' },
      });
    });
  }, [url]);

  return <canvas ref={ref} style={{ border: '3px solid var(--np-border)', boxShadow: 'var(--np-shadow-sm)', maxWidth: '100%' }} />;
}
