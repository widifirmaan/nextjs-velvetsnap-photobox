// File: src/lib/utils/image-utils.ts
// Description: Auto-added top comment for easier file identification.

export function loadImage(url: string, crossOrigin: string | null = 'anonymous'): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url.slice(0, 80)}`));
    img.src = url;
  });
}

export function loadImages(urls: string[], crossOrigin = 'anonymous'): Promise<(HTMLImageElement | null)[]> {
  return Promise.all(
    urls.map(async (url) => {
      try { return await loadImage(url, crossOrigin); } catch { return null; }
    })
  );
}

export function compressImage(dataUrl: string, maxDim = 1920, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        const s = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * s);
        h = Math.round(h * s);
      }
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d')!.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function flipImageHorizontal(dataUrl: string): Promise<string> {
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

// DSLR capture: try the local DigiCamControl web server directly from the kiosk
// browser (only works when it runs on the same machine and allows CORS), then
// fall back to the API endpoint (which reports a clear error from the cloud).
export async function captureDslrPhoto(): Promise<string> {
  const localBase = 'http://127.0.0.1:5513';
  try {
    const capRes = await fetch(`${localBase}/capture`, { method: 'POST', signal: AbortSignal.timeout(15000) });
    if (capRes.ok) {
      const imgRes = await fetch(`${localBase}/image/latest`, { signal: AbortSignal.timeout(10000) });
      if (imgRes.ok) {
        const blob = await imgRes.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read captured image'));
          reader.readAsDataURL(blob);
        });
      }
    }
  } catch { /* local capture unavailable — fall back to the API */ }
  const res = await fetch('/api/camera/capture', { method: 'POST' });
  const data = await res.json().catch(() => ({ success: false, error: 'Camera service unavailable' }));
  if (!data.success) throw new Error(data.error || 'Unknown error');
  return data.dataUrl;
}

export function calcCoverFit(imgW: number, imgH: number, boxW: number, boxH: number): {dw:number;dh:number;dx:number;dy:number} {
  const ia = imgW / imgH;
  const sa = boxW / boxH;
  let dw: number, dh: number, dx: number, dy: number;
  if (ia > sa) {
    dh = boxH;
    dw = boxH * ia;
    dx = boxW / 2 - dw / 2;
    dy = 0;
  } else {
    dw = boxW;
    dh = boxW / ia;
    dx = 0;
    dy = boxH / 2 - dh / 2;
  }
  return { dw, dh, dx, dy };
}

export function applyPhotoAdjustment(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  adj: { scale?: number; x?: number; y?: number },
): void {
  const fit = calcCoverFit(img.naturalWidth, img.naturalHeight, w, h);
  const sc = adj.scale ?? 1;
  const cx2 = x + fit.dx + fit.dw / 2;
  const cy2 = y + fit.dy + fit.dh / 2;
  const dw = fit.dw * sc;
  const dh = fit.dh * sc;
  const dx = cx2 - dw / 2 + ((adj.x ?? 0) / 100) * w;
  const dy = cy2 - dh / 2 + ((adj.y ?? 0) / 100) * h;
  ctx.drawImage(img, dx, dy, dw, dh);
}
