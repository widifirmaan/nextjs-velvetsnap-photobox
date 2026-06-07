import { NextResponse } from 'next/server';
import { removeBackground } from '@imgly/background-removal-node';

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'imageUrl is required' }, { status: 400 });
    }

    // Download the image
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      return NextResponse.json({ success: false, error: 'Failed to download image' }, { status: 400 });
    }

    const imageBuffer = await imageRes.arrayBuffer();

    // Remove background using local on-device engine (no API key needed)
    const resultBlob = await removeBackground(imageBuffer, {
      model: 'small',
      output: { format: 'image/png' },
    });

    const resultBuffer = await resultBlob.arrayBuffer();
    const base64 = Buffer.from(resultBuffer).toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;

    return NextResponse.json({ success: true, data: { url: dataUri } });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
