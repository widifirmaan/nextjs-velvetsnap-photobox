import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  secure: true,
});

export async function uploadBase64(dataUri: string, folder = 'velvetsnap'): Promise<string> {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
  });
  return result.secure_url;
}

export async function uploadBase64Array(dataUris: string[], folder = 'velvetsnap'): Promise<string[]> {
  return Promise.all(dataUris.map((uri) => uploadBase64(uri, folder)));
}

export function isBase64(str: string): boolean {
  return str.startsWith('data:');
}

export function getOptimizedUrl(url: string, h = 360): string {
  return url.replace('/upload/', `/upload/c_fill,h_${h}/`);
}

export default cloudinary;
