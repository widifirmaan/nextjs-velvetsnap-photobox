import { loadImage, loadImages, flipImageHorizontal, calcCoverFit, applyPhotoAdjustment } from './image-utils';
import { drawSlotShape, clipSlotShape } from './shapes';
import {
  CHROMA_KEY_GREEN, CHROMA_KEY_TARGET, CHROMA_KEY_THRESHOLD,
  COMPOSE_JPEG_QUALITY, STRIP_JPEG_QUALITY,
} from './constants';

export interface ISlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface IStripElement {
  id: string;
  type: 'photo-slot' | 'text' | 'sticker' | 'shape' | 'background';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  visible: boolean;
  props: Record<string, any>;
}

export const flipImage = flipImageHorizontal;

export async function composeFrameImage(
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

        const photoLoads: Promise<void>[] = [];
        for (let idx = 0; idx < slots.length; idx++) {
          const slot = slots[idx];
          const src = captures[idx];
          if (!src) continue;

          photoLoads.push((async () => {
            const sx = (slot.x / 100) * cw;
            const sy = (slot.y / 100) * ch;
            const sw = (slot.w / 100) * cw;
            const sh = (slot.h / 100) * ch;

            const photo = await loadImage(src);
            ctx.save();
            ctx.beginPath();
            ctx.rect(sx, sy, sw, sh);
            ctx.clip();

            applyPhotoAdjustment(ctx, photo, sx, sy, sw, sh, adjust[idx] || { scale: 1, x: 0, y: 0 });
            ctx.restore();
          })());
        }
        await Promise.all(photoLoads);

        ctx.drawImage(frameImg, 0, 0, cw, ch);
        resolve(canvas.toDataURL('image/jpeg', COMPOSE_JPEG_QUALITY));
      } catch (err) {
        reject(err);
      }
    };
    frameImg.onerror = () => reject(new Error('Failed to load frame'));
    frameImg.src = frameImageBase64;
  });
}

export function removeGreenScreen(base64: string, maxW: number = 1000): Promise<string> {
  return new Promise((resolve) => {
    if (!base64) { resolve(''); return; }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const s = maxW / (img.naturalWidth || img.width);
      canvas.width = maxW;
      canvas.height = Math.round((img.naturalHeight || img.height) * s);
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(base64); return; }
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      let imgData;
      try { imgData = ctx.getImageData(0, 0, canvas.width, canvas.height); }
      catch { resolve(base64); return; }
      const d = imgData.data;
      const [targetR, targetG, targetB] = CHROMA_KEY_TARGET;
      const threshold2 = CHROMA_KEY_THRESHOLD;
      const len = d.length;
      for (let i = 0; i < len; i += 4) {
        const dr = d[i] - targetR;
        const dg = d[i + 1] - targetG;
        const db = d[i + 2] - targetB;
        if (dr * dr + dg * dg + db * db < threshold2) { d[i + 3] = 0; }
      }
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

export function stripElementsToSlotsLayout(elements: IStripElement[], cw: number, ch: number): ISlot[] {
  return elements
    .filter((el) => el.type === 'photo-slot')
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((el) => ({
      x: Math.round((el.x / cw) * 1000) / 10,
      y: Math.round((el.y / ch) * 1000) / 10,
      w: Math.round((el.width / cw) * 1000) / 10,
      h: Math.round((el.height / ch) * 1000) / 10,
    }));
}

export function renderStripFrame(
  elements: IStripElement[],
  canvasWidth: number,
  canvasHeight: number,
  bgColor: string,
  maxW?: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const scale = maxW ? maxW / canvasWidth : 1;
    const cw = maxW || canvasWidth;
    const ch = Math.round(canvasHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('No context')); return; }
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = bgColor || '#ffffff';
    ctx.fillRect(0, 0, cw, ch);

    const sorted = [...elements]
      .filter((el) => el.visible)
      .sort((a, b) => a.zIndex - b.zIndex);

    const scaleEl = (el: IStripElement) => ({
      ...el,
      x: el.x * scale,
      y: el.y * scale,
      width: el.width * scale,
      height: el.height * scale,
      props: { ...el.props },
    });

    const drawSlot = (el: IStripElement) => {
      ctx.save();
      ctx.globalAlpha = el.props.opacity ?? 1;
      drawSlotShape(ctx, {
        shape: el.props.shape || 'rounded',
        x: el.x, y: el.y, w: el.width, h: el.height,
        fill: CHROMA_KEY_GREEN,
        stroke: el.props.borderColor || '#ffffff',
        strokeWidth: (el.props.borderWidth ?? 2) * scale,
        borderRadius: (el.props.borderRadius ?? 8) * scale,
      });
      ctx.restore();
    };

    const drawNonPhoto = (el: IStripElement, cache: Map<string, HTMLImageElement>) => {
      ctx.save();
      ctx.globalAlpha = el.props.opacity ?? 1;

      if (el.type === 'background') {
        if (el.props.stickerUrl) {
          const img = cache.get(el.props.stickerUrl);
          if (img) {
            const sc = Math.max(el.width / img.naturalWidth, el.height / img.naturalHeight);
            const dw = img.naturalWidth * sc;
            const dh = img.naturalHeight * sc;
            ctx.drawImage(img, el.x + (el.width - dw) / 2, el.y + (el.height - dh) / 2, dw, dh);
          }
        }
      } else if (el.type === 'text') {
        const fs = Math.round((el.props.fontSize || 24) * scale);
        ctx.font = `${el.props.fontWeight === '700' ? 'bold ' : ''}${fs}px ${el.props.fontFamily || 'Inter'}`;
        ctx.fillStyle = el.props.color || '#3d2c2c';
        const ta = el.props.textAlign || 'left';
        ctx.textAlign = ta as CanvasTextAlign;
        ctx.textBaseline = 'middle';
        const tx = ta === 'center' ? el.x + el.width / 2 : ta === 'right' ? el.x + el.width : el.x;
        ctx.fillText(el.props.content || 'Text', tx, el.y + el.height / 2, el.width);
      } else if (el.type === 'sticker') {
        if (el.props.stickerUrl) {
          const img = cache.get(el.props.stickerUrl);
          if (img) {
            const sc = Math.min(el.width / img.naturalWidth, el.height / img.naturalHeight);
            const dw = img.naturalWidth * sc;
            const dh = img.naturalHeight * sc;
            ctx.drawImage(img, el.x + (el.width - dw) / 2, el.y + (el.height - dh) / 2, dw, dh);
          }
        }
      } else if (el.type === 'shape') {
        const sx = el.props.shapeType || 'rect';
        const fill = el.props.fillColor || '#C5D89D';
        const stroke = el.props.strokeColor || '#9CAB84';
        const sw = (el.props.strokeWidth || 2) * scale;
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = sw;
        if (sx === 'circle') {
          const r = Math.min(el.width, el.height) / 2;
          ctx.beginPath(); ctx.arc(el.x + el.width / 2, el.y + el.height / 2, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        } else if (sx === 'ellipse') {
          ctx.beginPath(); ctx.ellipse(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, el.height / 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        } else {
          ctx.fillRect(el.x, el.y, el.width, el.height);
          ctx.strokeRect(el.x, el.y, el.width, el.height);
        }
      }
      ctx.restore();
    };

    (async () => {
      try {
        const scaledElements = sorted.map(scaleEl);

        const imageUrls = new Set<string>();
        for (const el of scaledElements) {
          if ((el.type === 'background' || el.type === 'sticker') && el.props.stickerUrl) {
            imageUrls.add(el.props.stickerUrl);
          }
        }
        const images = await loadImages(Array.from(imageUrls));
        const cache = new Map<string, HTMLImageElement>();
        const urls = Array.from(imageUrls);
        for (let i = 0; i < urls.length; i++) {
          if (images[i]) cache.set(urls[i], images[i]!);
        }

        for (const el of scaledElements) {
          if (el.type === 'photo-slot') {
            drawSlot(el);
          } else {
            drawNonPhoto(el, cache);
          }
        }
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    })();
  });
}

export async function composeStripImage(
  elements: IStripElement[],
  bgColor: string,
  captures: string[],
  adjusts: { scale: number; x: number; y: number }[],
  canvasWidth: number,
  canvasHeight: number,
  width: number = 960,
): Promise<string> {
  const scale = width / canvasWidth;
  const cw = width;
  const ch = Math.round(canvasHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No context');
  ctx.imageSmoothingQuality = 'high';

  ctx.fillStyle = bgColor || '#ffffff';
  ctx.fillRect(0, 0, cw, ch);

  const sorted = [...elements]
    .filter((el) => el.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  const loadImg = (url: string) => loadImage(url);

  let photoIdx = 0;

  for (const el of sorted) {
    const ex = el.x * scale;
    const ey = el.y * scale;
    const ew = el.width * scale;
    const eh = el.height * scale;

    ctx.save();
    ctx.globalAlpha = el.props.opacity ?? 1;

    if (el.type === 'photo-slot') {
      const src = captures[photoIdx];
      photoIdx++;
      if (!src) { ctx.restore(); continue; }
      const bw = (el.props.borderWidth ?? 2) * scale;
      const bc = el.props.borderColor || '#ffffff';

      clipSlotShape(ctx, {
        shape: el.props.shape || 'rounded',
        x: ex, y: ey, w: ew, h: eh,
        borderRadius: (el.props.borderRadius ?? 8) * scale,
      });

      try {
        const photo = await loadImg(src);
        applyPhotoAdjustment(ctx, photo, ex, ey, ew, eh, adjusts[photoIdx - 1] || { scale: 1, x: 0, y: 0 });
      } catch {}

      ctx.strokeStyle = bc;
      ctx.lineWidth = bw;
      ctx.strokeRect(ex, ey, ew, eh);
      ctx.restore();

    } else if (el.type === 'background') {
      if (el.props.stickerUrl) {
        try {
          const img = await loadImg(el.props.stickerUrl);
          const sc2 = Math.max(ew / img.naturalWidth, eh / img.naturalHeight);
          const dw = img.naturalWidth * sc2;
          const dh = img.naturalHeight * sc2;
          ctx.drawImage(img, ex + (ew - dw) / 2, ey + (eh - dh) / 2, dw, dh);
        } catch {}
      }
      ctx.restore();

    } else if (el.type === 'text') {
      ctx.font = `${el.props.fontWeight === '700' ? 'bold ' : ''}${Math.round((el.props.fontSize || 24) * scale)}px ${el.props.fontFamily || 'Inter'}`;
      ctx.fillStyle = el.props.color || '#3d2c2c';
      const ta = el.props.textAlign || 'left';
      ctx.textAlign = ta as CanvasTextAlign;
      ctx.textBaseline = 'middle';
      const tx = ta === 'center' ? ex + ew / 2 : ta === 'right' ? ex + ew : ex;
      ctx.fillText(el.props.content || 'Text', tx, ey + eh / 2, ew);
      ctx.restore();

    } else if (el.type === 'sticker') {
      if (el.props.stickerUrl) {
        try {
          const img = await loadImg(el.props.stickerUrl);
          const sc2 = Math.min(ew / img.naturalWidth, eh / img.naturalHeight);
          const dw = img.naturalWidth * sc2;
          const dh = img.naturalHeight * sc2;
          ctx.drawImage(img, ex + (ew - dw) / 2, ey + (dh - eh) / 2 + eh - dh, dw, dh);
          ctx.restore();
        } catch { ctx.restore(); }
      } else { ctx.restore(); }
    } else if (el.type === 'shape') {
      const sx = el.props.shapeType || 'rect';
      const fill = el.props.fillColor || '#C5D89D';
      const stroke = el.props.strokeColor || '#9CAB84';
      const sw = (el.props.strokeWidth || 2) * scale;
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = sw;
      if (sx === 'circle') {
        const r = Math.min(ew, eh) / 2;
        ctx.beginPath(); ctx.arc(ex + ew / 2, ey + eh / 2, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else if (sx === 'ellipse') {
        ctx.beginPath(); ctx.ellipse(ex + ew / 2, ey + eh / 2, ew / 2, eh / 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else {
        ctx.fillRect(ex, ey, ew, eh);
        ctx.strokeRect(ex, ey, ew, eh);
      }
      ctx.restore();
    } else {
      ctx.restore();
    }
  }

  return canvas.toDataURL('image/jpeg', STRIP_JPEG_QUALITY);
}
