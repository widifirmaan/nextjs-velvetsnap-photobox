import { NextResponse } from 'next/server';
import { uploadBase64, isBase64 } from '@/lib/cloudinary';
import { getSession } from '@/lib/require-admin';
export const runtime = 'nodejs';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session.token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { dataUri, folder, publicId } = await req.json();
    if (!dataUri || !isBase64(dataUri)) {
      return NextResponse.json({ success: false, error: 'Invalid data URI' }, { status: 400 });
    }

    // Validate file size from base64
    const base64Data = dataUri.split(',')[1] || dataUri;
    const fileBytes = Math.round((base64Data.length * 3) / 4);
    if (fileBytes > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ success: false, error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Validate image MIME type
    const mimeMatch = dataUri.match(/^data:image\/(\w+);base64,/);
    if (!mimeMatch || !['jpeg', 'png', 'webp', 'gif'].includes(mimeMatch[1])) {
      return NextResponse.json({ success: false, error: 'Invalid image type. Supported: jpeg, png, webp, gif' }, { status: 400 });
    }

    const url = await uploadBase64(dataUri, folder || 'velvetsnap/templates', publicId);
    return NextResponse.json({ success: true, url });
  } catch (error: unknown) {
    const cloudErr = error as { message?: string; http_code?: number; code?: string };
    const msg = cloudErr.message || String(error);
    console.error('/api/upload error:', msg, cloudErr.http_code, cloudErr.code);
    return NextResponse.json(
      { success: false, error: msg, info: { http_code: cloudErr.http_code, code: cloudErr.code } },
      { status: 500 }
    );
  }
}
