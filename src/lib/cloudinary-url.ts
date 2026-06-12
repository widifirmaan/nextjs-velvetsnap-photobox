export function getHighResUrl(url: string, w = 1000, h = 3000): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/image/upload/', `/image/upload/w_${w},h_${h},c_fill,e_upscale,q_auto,f_auto/`);
}

export function getOptimizedUrl(url: string, h = 360): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/image/upload/', `/image/upload/c_fill,h_${h},q_auto,f_auto/`);
}

export function isBase64(str: string): boolean {
  return str.startsWith('data:');
}
