// File: src/lib/utils/cloudinary.ts
// Description: Auto-added top comment for easier file identification.

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  secure: true,
});

export async function uploadBase64(dataUri: string, folder = 'velvetsnap', publicId?: string): Promise<string> {
  const base64data = dataUri.replace(/^data:[\w\/-]+;base64,/, '');
  const buffer = Buffer.from(base64data, 'base64');
  return new Promise((resolve, reject) => {
    const options: Record<string, any> = { folder, resource_type: 'image' };
    if (publicId) {
      options.public_id = publicId;
      options.overwrite = true;
      options.invalidate = true;
    }
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
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

export { getHighResUrl, isBase64, getOptimizedUrl } from './cloudinary-url';

async function deleteImage(url: string): Promise<void> {
  if (!url || !url.includes('res.cloudinary.com')) return;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex((p) => p === 'upload');
    if (uploadIndex === -1) return;
    const publicIdWithVersion = parts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithVersion.replace(/^v\d+\//, '').replace(/\.[^.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch (e) { console.error('deleteImage failed:', url, e); }
}

export async function deleteImages(urls: (string | undefined | null)[]): Promise<void> {
  await Promise.all(urls.filter(Boolean).map((u) => deleteImage(u!)));
}

export default cloudinary;
