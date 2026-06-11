import { NextResponse } from 'next/server';
import { uploadBase64, isBase64 } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    const { dataUri, folder } = await req.json();
    if (!dataUri || !isBase64(dataUri)) {
      return NextResponse.json({ success: false, error: 'Invalid data URI' }, { status: 400 });
    }
    const url = await uploadBase64(dataUri, folder || 'velvetsnap/templates');
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
