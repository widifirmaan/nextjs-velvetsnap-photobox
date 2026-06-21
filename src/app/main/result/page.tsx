'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Printer, Home, Smartphone, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { composeStripImage, renderStripFrame } from '@/lib/canvas-utils';
import { getHighResUrl } from '@/lib/cloudinary-url';
import styles from './page.module.css';

export interface ISlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface IStripElement {
  id: string; type: 'text' | 'background' | 'photo-slot' | 'sticker' | 'shape';
  x: number; y: number; width: number; height: number;
  rotation: number; zIndex: number; visible: boolean; props: any;
}

export interface TemplateData {
  templateId: string;
  templateName: string;
  templateDesc: string;
  templatePrice: number;
  templateFull?: string;
  templateThumb?: string;
  templateData: {
    slots: number;
    color: string;
    type?: 'frame' | 'strip';
    elements?: IStripElement[];
    slotsLayout?: ISlot[];
    canvasWidth?: number;
    canvasHeight?: number;
  };
}

// Helper to chromakey / remove green color #00bf63 from template frame image dynamically
async function composeFrameImage(
  frameImageBase64: string,
  slots: ISlot[],
  captures: string[],
  adjust: { scale: number; x: number; y: number }[],
  color: string,
  width: number = 960,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const frameImg = new window.Image();
    frameImg.crossOrigin = 'anonymous';
    frameImg.onload = async () => {
      try {
        const ar = frameImg.naturalWidth / frameImg.naturalHeight;
        const cw = width;
        const ch = Math.round(width / ar);
        const canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('No context')); return; }

        ctx.fillStyle = color || '#ffffff';
        ctx.fillRect(0, 0, cw, ch);

        for (let idx = 0; idx < slots.length; idx++) {
          const slot = slots[idx];
          const src = captures[idx];
          if (!src) continue;

          const sx = (slot.x / 100) * cw;
          const sy = (slot.y / 100) * ch;
          const sw = (slot.w / 100) * cw;
          const sh = (slot.h / 100) * ch;

          const photo = await new Promise<HTMLImageElement>((res, rej) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => res(img);
            img.onerror = () => rej(new Error('Photo load failed'));
            img.src = src;
          });

          ctx.save();
          ctx.beginPath();
          ctx.rect(sx, sy, sw, sh);
          ctx.clip();

          const adj = adjust[idx] || { scale: 1, x: 0, y: 0 };
          const ia = photo.naturalWidth / photo.naturalHeight;
          const sa = sw / sh;
          let dw = sw, dh = sh, dx = sx, dy = sy;
          if (ia > sa) {
            dh = sh;
            dw = sh * ia;
            dx = sx - (dw - sw) / 2;
            dy = sy;
          } else {
            dw = sw;
            dh = sw / ia;
            dx = sx;
            dy = sy - (dh - sh) / 2;
          }

          const sc = adj.scale || 1;
          const cx2 = dx + dw / 2;
          const cy2 = dy + dh / 2;
          dw *= sc; dh *= sc;
          dx = cx2 - dw / 2;
          dy = cy2 - dh / 2;
          dx += (adj.x || 0) / 100 * sw;
          dy += (adj.y || 0) / 100 * sh;

          ctx.drawImage(photo, dx, dy, dw, dh);
          ctx.restore();
        }

        ctx.drawImage(frameImg, 0, 0, cw, ch);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (err) {
        reject(err);
      }
    };
    frameImg.onerror = () => reject(new Error('Failed to load frame'));
    frameImg.src = frameImageBase64;
  });
}

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

  const [dbTemplate, setDbTemplate] = useState<TemplateData | null>(null);
  const [keyedFrameImage, setKeyedFrameImage] = useState<string>('');
  const [frameRatio, setFrameRatio] = useState<number>(2 / 3);
  const [loading, setLoading] = useState(true);
  const [imagesReady, setImagesReady] = useState(false);
  const [compositedImage, setCompositedImage] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCaptures = sessionStorage.getItem('photobooth_captures');
      const storedTemplate = sessionStorage.getItem('photobooth_template');
      const storedFilter = sessionStorage.getItem('photobooth_filter');
      const storedAdjust = sessionStorage.getItem('photobooth_adjust');
      const storedComposited = sessionStorage.getItem('photobooth_composited');
      const storedTxId = sessionStorage.getItem('photobooth_txId');
      if (storedTxId) setTxId(storedTxId);

      if (storedComposited) {
        setCompositedImage(storedComposited);
        setImagesReady(true);
        setLoading(false);
      }
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
      .then(async (data) => {
        if (data.success) {
          const matched = data.data.find((t: any) => t.templateId === template);
          if (matched) {
            setDbTemplate(matched);
            const cw = matched.templateData.canvasWidth || 1000;
            const ch = matched.templateData.canvasHeight || 3000;

            // Convert legacy (frameImage + slotsLayout) to elements
            if (!matched.templateData.elements?.length && matched.templateFull && matched.templateData.slotsLayout?.length) {
              const els: any[] = [];
              els.push({
                id: 'bg', type: 'background',
                x: 0, y: 0, width: cw, height: ch,
                rotation: 0, zIndex: 0, visible: true,
                props: { stickerUrl: getHighResUrl(matched.templateFull, cw, ch), opacity: 1 },
              });
              (matched.templateData.slotsLayout || []).forEach((slot: any, i: number) => {
                els.push({
                  id: `slot-${i}`, type: 'photo-slot',
                  x: (slot.x / 100) * cw, y: (slot.y / 100) * ch,
                  width: (slot.w / 100) * cw, height: (slot.h / 100) * ch,
                  rotation: 0, zIndex: 1, visible: true,
                  props: { borderWidth: 2, borderColor: '#ffffff', borderRadius: 8, shape: 'rounded', opacity: 1 },
                });
              });
              matched.templateData.elements = els;
              matched.templateData.type = 'strip';
            }

            if (matched.templateData.elements?.length) {
              matched.templateData.elements = matched.templateData.elements.map((el: any) =>
                el.type === 'background' && el.props?.stickerUrl
                  ? { ...el, props: { ...el.props, stickerUrl: getHighResUrl(el.props.stickerUrl, cw, ch) } }
                  : el
              );
              try {
                const frameDataUrl = await renderStripFrame(matched.templateData.elements, cw, ch, matched.templateData.color || '#ffffff');
                const bgFrameDataUrl = await removeGreenScreen(frameDataUrl);
                setKeyedFrameImage(bgFrameDataUrl);
                const img = new window.Image();
                img.onload = () => setFrameRatio(img.naturalWidth / img.naturalHeight);
                img.src = bgFrameDataUrl;
              } catch {}
            } else if (matched.templateFull) {
              setKeyedFrameImage(matched.templateFull);
              const img = new window.Image();
              img.onload = () => setFrameRatio(img.naturalWidth / img.naturalHeight);
              img.src = matched.templateFull;
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

  useEffect(() => {
    if (!imagesReady || compositedImage || !dbTemplate) return;
    if (!dbTemplate.templateData.slotsLayout || dbTemplate.templateData.slotsLayout.length === 0) return;
    setRendering(true);
    const outW = dbTemplate.templateData.canvasWidth || 1000;
    const doComposite = dbTemplate.templateData.type === 'strip' && dbTemplate.templateData.elements?.length && dbTemplate.templateData.slotsLayout?.length
      ? composeStripImage(
          dbTemplate.templateData.elements, dbTemplate.templateData.color || '#ffffff',
          captures, photoAdjust,
          outW, dbTemplate.templateData.canvasHeight || 3000, outW,
        )
      : (() => {
          const frameSrc = keyedFrameImage || dbTemplate.templateFull || '';
          if (!frameSrc) return Promise.reject('No frame');
          return composeFrameImage(frameSrc, dbTemplate.templateData.slotsLayout!, captures, photoAdjust, dbTemplate.templateData.color || '#ffffff', outW);
        })();
    doComposite.then((dataUrl) => {
      setCompositedImage(dataUrl);
      sessionStorage.setItem('photobooth_composited', dataUrl);
    }).catch(console.error)
    .finally(() => setRendering(false));
  }, [imagesReady, compositedImage, dbTemplate, keyedFrameImage, captures, photoAdjust]);

  const downloadUrl = txId ? (typeof window !== 'undefined' ? `${window.location.origin}/download/${txId}` : null) : null;

  useEffect(() => {
    if (qrRef.current && downloadUrl) {
      QRCode.toCanvas(qrRef.current, downloadUrl, {
        width: 140,
        margin: 2,
        color: { dark: '#1d1d1f', light: '#ffffff' },
      });
    }
  }, [downloadUrl]);

  const handleDownload = () => {
    const dataUrl = compositedImage;
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `photobooth-${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  const handlePrint = () => {
    const dataUrl = compositedImage;
    if (!dataUrl) return;
    const img = new window.Image();
    img.onload = () => {
      const pw = img.naturalWidth;
      const ph = img.naturalHeight;
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(`<!DOCTYPE html>
<html>
<head><style>
  @page { margin: 0; size: ${pw}px ${ph}px; }
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
    width: ${pw}px;
    height: ${ph}px;
    max-width: 100vw;
    max-height: 100vh;
    object-fit: contain;
  }
  @media print {
    body { background: none; }
    img { max-width: none; max-height: none; object-fit: cover; }
  }
</style></head>
<body><img src="${dataUrl}" onload="setTimeout(()=>window.print(),100)" /></body></html>`);
      win.document.close();
    };
    img.src = dataUrl;
  };

  const handleHome = () => {
    sessionStorage.clear();
    sessionStorage.setItem('skipPreloader', '1');
    router.replace('/main');
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
        {compositedImage ? (
          <div className={styles.printWrap}>
            <img src={compositedImage} alt="Final result" className={styles.resultImage} />
          </div>
        ) : rendering ? (
          <div className={styles.printWrap} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
            <Loader2 className="spin" size={32} />
          </div>
        ) : null}

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
          {downloadUrl && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: '100%', height: 1, background: 'var(--mn-border, #e5e5e5)', margin: '4px 0' }} />
              <p style={{ fontSize: 12, color: '#888', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Smartphone size={14} /> Scan to download on your phone
              </p>
              <canvas ref={qrRef} style={{ borderRadius: 8, border: '1px solid var(--mn-border, #e5e5e5)' }} />
              <p style={{ fontSize: 10, color: '#aaa', margin: 0, wordBreak: 'break-all', textAlign: 'center', maxWidth: '100%' }}>{downloadUrl}</p>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}

