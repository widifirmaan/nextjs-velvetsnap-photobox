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

export function flipImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      ctx.scale(-1, 1);
      ctx.drawImage(img, -canvas.width, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

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

export function removeGreenScreen(base64: string): Promise<string> {
  return new Promise((resolve) => {
    if (!base64) { resolve(''); return; }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_W = 1000;
      const scale = MAX_W / (img.naturalWidth || img.width);
      canvas.width = MAX_W;
      canvas.height = Math.round((img.naturalHeight || img.height) * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(base64); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      let imgData;
      try { imgData = ctx.getImageData(0, 0, canvas.width, canvas.height); }
      catch { resolve(base64); return; }
      const d = imgData.data;
      const targetR = 0, targetG = 191, targetB = 99;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const dr = r - targetR, dg = g - targetG, db = b - targetB;
        if (dr * dr + dg * dg + db * db < 5000) { d[i + 3] = 0; }
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
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('No context')); return; }

    // Fill background color first
    ctx.fillStyle = bgColor || '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const sorted = [...elements]
      .filter((el) => el.visible)
      .sort((a, b) => a.zIndex - b.zIndex);

    const loadImage = (url: string): Promise<HTMLImageElement> =>
      new Promise((res, rej) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res(img);
        img.onerror = () => rej(new Error(`Failed to load: ${url}`));
        img.src = url;
      });

    const drawPhotoSlot = (el: IStripElement) => {
      const bw = el.props.borderWidth ?? 2;
      const bc = el.props.borderColor || '#ffffff';
      const br = el.props.borderRadius ?? 8;
      const shape = el.props.shape || 'rounded';

      ctx.save();
      ctx.globalAlpha = el.props.opacity ?? 1;

      // Draw green fill (will be removed by removeGreenScreen)
      ctx.fillStyle = '#00bf63';
      ctx.strokeStyle = bc;
      ctx.lineWidth = bw;

      if (shape === 'circle') {
        const r = Math.min(el.width, el.height) / 2;
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.stroke();
      } else if (shape === 'heart') {
        const s = Math.min(el.width, el.height) * 0.45;
        const hx = el.x + el.width / 2;
        const hy = el.y + el.height * 0.4;
        ctx.beginPath();
        ctx.moveTo(hx, hy + s * 0.3);
        ctx.bezierCurveTo(hx - s * 0.7, hy - s * 0.2, hx - s, hy - s * 0.5, hx, hy - s * 0.7);
        ctx.bezierCurveTo(hx + s, hy - s * 0.5, hx + s * 0.7, hy - s * 0.2, hx, hy + s * 0.3);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      } else if (shape === 'star') {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const r = Math.min(el.width, el.height) / 2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const innerAngle = outerAngle + Math.PI / 5;
          const px = cx + r * Math.cos(outerAngle);
          const py = cy + r * Math.sin(outerAngle);
          const ix = cx + r * 0.4 * Math.cos(innerAngle);
          const iy = cy + r * 0.4 * Math.sin(innerAngle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
          ctx.lineTo(ix, iy);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
      } else if (shape === 'diamond') {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        ctx.beginPath();
        ctx.moveTo(cx, el.y);
        ctx.lineTo(el.x + el.width, cy);
        ctx.lineTo(cx, el.y + el.height);
        ctx.lineTo(el.x, cy);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      } else if (shape === 'hexagon') {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const hr = Math.min(el.width, el.height) / 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 2;
          const px = cx + hr * Math.cos(a);
          const py = cy + hr * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
      } else if (shape === 'polaroid') {
        ctx.fillRect(el.x, el.y, el.width, el.height);
        ctx.strokeRect(el.x, el.y, el.width, el.height);
        ctx.fillStyle = bc;
        ctx.fillRect(el.x + el.width * 0.2, el.y + el.height - 14, el.width * 0.6, 8);
      } else {
        // rounded rect (default)
        const r = Math.min(br, el.width / 2, el.height / 2);
        ctx.beginPath();
        ctx.moveTo(el.x + r, el.y);
        ctx.lineTo(el.x + el.width - r, el.y);
        ctx.quadraticCurveTo(el.x + el.width, el.y, el.x + el.width, el.y + r);
        ctx.lineTo(el.x + el.width, el.y + el.height - r);
        ctx.quadraticCurveTo(el.x + el.width, el.y + el.height, el.x + el.width - r, el.y + el.height);
        ctx.lineTo(el.x + r, el.y + el.height);
        ctx.quadraticCurveTo(el.x, el.y + el.height, el.x, el.y + el.height - r);
        ctx.lineTo(el.x, el.y + r);
        ctx.quadraticCurveTo(el.x, el.y, el.x + r, el.y);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    };

    const drawNonPhotoElement = async (el: IStripElement): Promise<void> => {
      ctx.save();
      ctx.globalAlpha = el.props.opacity ?? 1;

      if (el.type === 'background') {
        if (el.props.stickerUrl) {
          try {
            const img = await loadImage(el.props.stickerUrl);
            const scale = Math.max(el.width / img.naturalWidth, el.height / img.naturalHeight);
            const dw = img.naturalWidth * scale;
            const dh = img.naturalHeight * scale;
            const dx = (el.width - dw) / 2;
            const dy = (el.height - dh) / 2;
            ctx.drawImage(img, el.x + dx, el.y + dy, dw, dh);
          } catch {}
        }
      } else if (el.type === 'text') {
        ctx.font = `${el.props.fontWeight === '700' ? 'bold ' : ''}${el.props.fontSize || 24}px ${el.props.fontFamily || 'Inter'}`;
        ctx.fillStyle = el.props.color || '#3d2c2c';
        const ta = el.props.textAlign || 'left';
        ctx.textAlign = ta as CanvasTextAlign;
        ctx.textBaseline = 'middle';
        const tx = ta === 'center' ? el.x + el.width / 2 : ta === 'right' ? el.x + el.width : el.x;
        ctx.fillText(el.props.content || 'Text', tx, el.y + el.height / 2, el.width);
      } else if (el.type === 'sticker') {
        if (el.props.stickerUrl) {
          try {
            const img = await loadImage(el.props.stickerUrl);
            const scale = Math.min(el.width / img.naturalWidth, el.height / img.naturalHeight);
            const dw = img.naturalWidth * scale;
            const dh = img.naturalHeight * scale;
            const dx = (el.width - dw) / 2;
            const dy = (el.height - dh) / 2;
            ctx.drawImage(img, el.x + dx, el.y + dy, dw, dh);
          } catch {}
        }
      } else if (el.type === 'shape') {
        const sx = el.props.shapeType || 'rect';
        const fill = el.props.fillColor || '#C5D89D';
        const stroke = el.props.strokeColor || '#9CAB84';
        const sw = el.props.strokeWidth || 2;
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
        for (const el of sorted) {
          if (el.type === 'photo-slot') {
            drawPhotoSlot(el);
          } else {
            await drawNonPhotoElement(el);
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

  ctx.fillStyle = bgColor || '#ffffff';
  ctx.fillRect(0, 0, cw, ch);

  const sorted = [...elements]
    .filter((el) => el.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  const loadImg = (url: string): Promise<HTMLImageElement> =>
    new Promise((res, rej) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res(img);
      img.onerror = () => rej(new Error(`Failed: ${url}`));
      img.src = url;
    });

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
      const br = (el.props.borderRadius ?? 8) * scale;
      const shape = el.props.shape || 'rounded';

      // Clip to shape
      ctx.beginPath();
      if (shape === 'circle') {
        const r = Math.min(ew, eh) / 2;
        ctx.arc(ex + ew / 2, ey + eh / 2, r, 0, Math.PI * 2);
      } else if (shape === 'heart') {
        const s = Math.min(ew, eh) * 0.45;
        const hx = ex + ew / 2;
        const hy = ey + eh * 0.4;
        ctx.moveTo(hx, hy + s * 0.3);
        ctx.bezierCurveTo(hx - s * 0.7, hy - s * 0.2, hx - s, hy - s * 0.5, hx, hy - s * 0.7);
        ctx.bezierCurveTo(hx + s, hy - s * 0.5, hx + s * 0.7, hy - s * 0.2, hx, hy + s * 0.3);
      } else if (shape === 'star') {
        const cx2 = ex + ew / 2, cy2 = ey + eh / 2, r = Math.min(ew, eh) / 2;
        for (let i = 0; i < 5; i++) {
          const oa = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const ia = oa + Math.PI / 5;
          const px = cx2 + r * Math.cos(oa), py = cy2 + r * Math.sin(oa);
          const ix = cx2 + r * 0.4 * Math.cos(ia), iy = cy2 + r * 0.4 * Math.sin(ia);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
          ctx.lineTo(ix, iy);
        }
      } else if (shape === 'diamond') {
        const cx2 = ex + ew / 2, cy2 = ey + eh / 2;
        ctx.moveTo(cx2, ey); ctx.lineTo(ex + ew, cy2);
        ctx.lineTo(cx2, ey + eh); ctx.lineTo(ex, cy2);
      } else if (shape === 'hexagon') {
        const cx2 = ex + ew / 2, cy2 = ey + eh / 2, hr = Math.min(ew, eh) / 2;
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 2;
          const px = cx2 + hr * Math.cos(a), py = cy2 + hr * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      } else {
        const r = Math.min(br, ew / 2, eh / 2);
        ctx.moveTo(ex + r, ey);
        ctx.lineTo(ex + ew - r, ey);
        ctx.quadraticCurveTo(ex + ew, ey, ex + ew, ey + r);
        ctx.lineTo(ex + ew, ey + eh - r);
        ctx.quadraticCurveTo(ex + ew, ey + eh, ex + ew - r, ey + eh);
        ctx.lineTo(ex + r, ey + eh);
        ctx.quadraticCurveTo(ex, ey + eh, ex, ey + eh - r);
        ctx.lineTo(ex, ey + r);
        ctx.quadraticCurveTo(ex, ey, ex + r, ey);
      }
      ctx.closePath();
      ctx.clip();

      // Draw photo
      try {
        const photo = await loadImg(src);
        const adj = adjusts[photoIdx - 1] || { scale: 1, x: 0, y: 0 };
        const ia = photo.naturalWidth / photo.naturalHeight;
        const sa = ew / eh;
        let dw = ew, dh = eh, dx = ex, dy = ey;
        if (ia > sa) { dh = eh; dw = eh * ia; dx = ex - (dw - ew) / 2; }
        else { dw = ew; dh = ew / ia; dx = ex; dy = ey - (dh - eh) / 2; }
        const sc = adj.scale || 1;
        const cx2 = dx + dw / 2, cy2 = dy + dh / 2;
        dw *= sc; dh *= sc;
        dx = cx2 - dw / 2; dy = cy2 - dh / 2;
        dx += (adj.x || 0) / 100 * ew;
        dy += (adj.y || 0) / 100 * eh;
        ctx.drawImage(photo, dx, dy, dw, dh);
      } catch {}

      // Draw border
      ctx.strokeStyle = bc;
      ctx.lineWidth = bw;
      ctx.beginPath();
      // need to re-create the path for stroke
      // same shape logic — simplified: use rect with stroke
      ctx.stroke();

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
          const dw = img.naturalWidth * sc2, dh = img.naturalHeight * sc2;
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

  return canvas.toDataURL('image/jpeg', 0.95);
}
