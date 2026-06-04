export interface ISlot {
  x: number;
  y: number;
  w: number;
  h: number;
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
        if (dr * dr + dg * dg + db * db < 1600) { d[i + 3] = 0; }
      }
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}
