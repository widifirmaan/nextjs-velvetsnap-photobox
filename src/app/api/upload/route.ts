import { NextResponse } from 'next/server';
import { uploadBase64, isBase64 } from '@/lib/cloudinary';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { dataUri, folder, publicId } = await req.json();
    if (!dataUri || !isBase64(dataUri)) {
      return NextResponse.json({ success: false, error: 'Invalid data URI' }, { status: 400 });
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
