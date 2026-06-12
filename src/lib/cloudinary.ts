import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  secure: true,
});

export async function uploadBase64(dataUri: string, folder = 'velvetsnap'): Promise<string> {
  const base64data = dataUri.replace(/^data:[\w\/-]+;base64,/, '');
  const buffer = Buffer.from(base64data, 'base64');
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result.secure_url);
        else reject(new Error('Upload returned no result'));
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function uploadBase64Array(dataUris: string[], folder = 'velvetsnap'): Promise<string[]> {
  return Promise.all(dataUris.map((uri) => uploadBase64(uri, folder)));
}

export function getHighResUrl(url: string, w = 1000, h = 3000): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/image/upload/', `/image/upload/w_${w},h_${h},c_fill,e_upscale,q_auto,f_auto/`);
}

export function isBase64(str: string): boolean {
  return str.startsWith('data:');
}

export function getOptimizedUrl(url: string, h = 360): string {
  return url.replace('/upload/', `/upload/c_fill,h_${h}/`);
}

export async function deleteImage(url: string): Promise<void> {
  if (!url || !url.includes('res.cloudinary.com')) return;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex((p) => p === 'upload');
    if (uploadIndex === -1) return;
    const publicIdWithVersion = parts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithVersion.replace(/^v\d+\//, '').replace(/\.[^.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch {}
}

export async function deleteImages(urls: (string | undefined | null)[]): Promise<void> {
  await Promise.all(urls.filter(Boolean).map((u) => deleteImage(u!)));
}

export default cloudinary;
