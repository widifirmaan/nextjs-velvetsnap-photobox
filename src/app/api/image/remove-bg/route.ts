import { NextResponse } from 'next/server';
import { removeBackground } from '@imgly/background-removal-node';

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'imageUrl is required' }, { status: 400 });
    }

    console.log('Starting remove-bg for:', imageUrl);

    // Remove background using local on-device engine
    // Pass URL directly so the library handles download + decoding
    const resultBlob = await removeBackground(imageUrl, {
      model: 'medium',
      output: { format: 'image/png' },
    });

    const resultBuffer = await resultBlob.arrayBuffer();
    const base64 = Buffer.from(resultBuffer).toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;

    return NextResponse.json({ success: true, data: { url: dataUri } });
  } catch (error: any) {
    console.error('remove-bg error:', error?.message || error, error?.stack || '');
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 });
  }
}
