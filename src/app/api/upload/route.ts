import { NextResponse } from 'next/server';
import { uploadBase64, isBase64 } from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/require-admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const u = await requireAdmin(req);
  if (u) return u;
  try {
    const { dataUri, folder } = await req.json();
    if (!dataUri || !isBase64(dataUri)) {
      return NextResponse.json({ success: false, error: 'Invalid data URI' }, { status: 400 });
    }
    const prefix = dataUri.substring(0, 60);
    const url = await uploadBase64(dataUri, folder || 'velvetsnap/templates');
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('/api/upload error:', error.message, error.http_code, error.code);
    return NextResponse.json(
      { success: false, error: error.message, info: { http_code: error.http_code, code: error.code } },
      { status: 500 }
    );
  }
}
