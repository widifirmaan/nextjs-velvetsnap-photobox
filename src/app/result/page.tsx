'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Printer, Home, Loader2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import styles from './page.module.css';

export interface ISlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TemplateData {
  templateId: string;
  name: string;
  description: string;
  slots: number;
  price: number;
  color: string;
  frameImage?: string;
  slotsLayout?: ISlot[];
}

// Helper to chromakey / remove green color #00bf63 from template frame image dynamically
function removeGreenScreen(base64: string): Promise<string> {
  return new Promise((resolve) => {
    if (!base64) {
      resolve('');
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_W = 1000;
      const scale = MAX_W / (img.naturalWidth || img.width);
      canvas.width = MAX_W;
      canvas.height = Math.round((img.naturalHeight || img.height) * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      let imgData;
      try {
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (e) {
        resolve(base64);
        return;
      }
      
      const data = imgData.data;
      const targetR = 0;
      const targetG = 191;
      const targetB = 99;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const diffR = r - targetR;
        const diffG = g - targetG;
        const diffB = b - targetB;
        const distSq = diffR * diffR + diffG * diffG + diffB * diffB;
        
        if (distSq < 1600) { // Tolerance threshold
          data[i + 3] = 0; // alpha to 0 (fully transparent)
        }
      }
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

export default function ResultPage() {
  const router = useRouter();
  const [captures, setCaptures] = useState<string[]>([]);
  const [template, setTemplate] = useState('t1');
  const [filter, setFilter] = useState('none');
  const [photoAdjust, setPhotoAdjust] = useState<{ scale: number; x: number; y: number }[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const [dbTemplate, setDbTemplate] = useState<TemplateData | null>(null);
  const [keyedFrameImage, setKeyedFrameImage] = useState<string>('');
  const [frameRatio, setFrameRatio] = useState<number>(2 / 3);
  const [loading, setLoading] = useState(true);
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCaptures = sessionStorage.getItem('photobooth_captures');
      const storedTemplate = sessionStorage.getItem('photobooth_template');
      const storedFilter = sessionStorage.getItem('photobooth_filter');
      const storedAdjust = sessionStorage.getItem('photobooth_adjust');

      if (storedCaptures) setCaptures(JSON.parse(storedCaptures));
      if (storedTemplate) setTemplate(storedTemplate);
      if (storedFilter) setFilter(storedFilter);
      if (storedAdjust) setPhotoAdjust(JSON.parse(storedAdjust));
    }
  }, []);

  useEffect(() => {
    if (!template) return;
    setLoading(true);
    setKeyedFrameImage('');
    setImagesReady(false);
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const matched = data.data.find((t: any) => t.templateId === template);
          if (matched) {
            setDbTemplate(matched);
            if (matched.frameImage) {
              return removeGreenScreen(matched.frameImage).then((keyed) => {
                setKeyedFrameImage(keyed);
                const img = new window.Image();
                img.onload = () => setFrameRatio(img.naturalWidth / img.naturalHeight);
                img.src = keyed;
              });
            }
          }
        }
      })
      .catch((err) => console.error('Error loading template details:', err))
      .finally(() => setLoading(false));
  }, [template]);

  useEffect(() => {
    if (loading || captures.length === 0) return;
    setImagesReady(false);
    const images = [...captures];
    if (keyedFrameImage) images.push(keyedFrameImage);
    if (images.length === 0) { setImagesReady(true); return; }
    Promise.all(
      images.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          })
      )
    ).then(() => setImagesReady(true));
  }, [captures, keyedFrameImage, loading]);

  const handleDownload = async () => {
    if (!printRef.current) return;
    try {
      const dataUrl = await htmlToImage.toJpeg(printRef.current, {
        quality: 0.95,
        pixelRatio: 3,
      });
      const link = document.createElement('a');
      link.download = `photobooth-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating image', err);
    }
  };

  const handlePrint = async () => {
    if (!printRef.current) return;
    try {
      const dataUrl = await htmlToImage.toJpeg(printRef.current, { quality: 0.95, pixelRatio: 3 });
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(`<!DOCTYPE html>
<html>
<head><style>
  @page { margin: 0; size: auto; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #000;
  }
  img {
    display: block;
    max-width: 100vw;
    max-height: 100vh;
    width: auto;
    height: auto;
    object-fit: contain;
  }
  @media print {
    @page { margin: 0; }
    body { background: none; }
    img { max-width: 100%; max-height: 100%; }
  }
</style></head>
<body><img src="${dataUrl}" onload="window.print()" /></body></html>`);
      win.document.close();
    } catch (err) {
      console.error('Error printing:', err);
    }
  };

  const handleHome = () => {
    router.push('/');
  };

  if (captures.length === 0) {
    return <div className="page-container"><p style={{ textAlign: 'center' }}>No photos found. Please start a session first.</p></div>;
  }

  return (
    <div className="page-container" style={{ alignItems: 'center' }}>
      {loading || !imagesReady ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <Loader2 className="spin" size={32} />
        </div>
      ) : (
        <>
          <h1 className="title">Your Photos are Ready!</h1>
          <p className="subtitle">Download or print your masterpiece</p>

      <div className={styles.workspace}>
        {dbTemplate && dbTemplate.frameImage && dbTemplate.slotsLayout ? (
          <div className={styles.printWrap}>
            <div 
              className={`${styles.dynamicPrintArea} dynamicPrintArea`}
              ref={printRef}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: frameRatio,
                backgroundColor: dbTemplate.color || '#ffffff',
                overflow: 'hidden',
                '--ar': frameRatio,
              } as React.CSSProperties}
            >
            {(dbTemplate.slotsLayout || []).map((slot, idx) => {
              const src = captures[idx];
              if (!src) return null;
              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                    width: `${slot.w}%`,
                    height: `${slot.h}%`,
                    overflow: 'hidden',
                    zIndex: 1
                  }}
                >
                  <img
                    src={src}
                    className={styles[filter]}
                    alt={`Captured slot ${idx}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: `scale(${photoAdjust[idx]?.scale || 1}) translate(${photoAdjust[idx]?.x || 0}%, ${photoAdjust[idx]?.y || 0}%)`,
                      transformOrigin: 'center',
                    }}
                  />
                </div>
              );
            })}

            <img
              src={keyedFrameImage || dbTemplate.frameImage}
              alt="Frame Overlay"
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%', height: '100%',
                zIndex: 2,
                pointerEvents: 'none'
              }}
            />
          </div>
          </div>
        ) : (
          /* Fallback static render for default classic grids */
          <div className={styles.printWrap}>
          <div className={styles.printArea} ref={printRef}>
            <div className={`${styles.frameLayout} ${styles[template]}`}>
              <div className={styles.frameHeader}>
                <h2>macOS Photobooth</h2>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
              
              <div className={styles.photosGrid}>
                {captures.map((src, i) => (
                  <div key={i} className={styles.photoWrapper}>
                    <img src={src} className={styles[filter]} alt={`Shot ${i}`} />
                  </div>
                ))}
              </div>
              
              <div className={styles.frameFooter}>
                <span>funcam.id clone</span>
              </div>
            </div>
          </div>
          </div>
        )}

        <div className={`glass-panel ${styles.actions}`}>
          <button className="mac-button" onClick={handleDownload}>
            <Download size={20} /> Download JPEG
          </button>
          
          <button className="mac-button secondary" onClick={handlePrint}>
            <Printer size={20} /> Print
          </button>
          
          <div style={{ marginTop: 'auto' }}>
            <button className="mac-button secondary" onClick={handleHome} style={{ width: '100%' }}>
              <Home size={20} /> Home
            </button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

