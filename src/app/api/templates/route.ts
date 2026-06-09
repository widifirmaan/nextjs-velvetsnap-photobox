import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import { uploadBase64, isBase64 } from '@/lib/cloudinary';

export async function GET() {
  try {
    await connectDB();
    const templates = await Template.find({});
    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Upload images to Cloudinary
    if (body.frameImage && isBase64(body.frameImage)) {
      body.frameImage = await uploadBase64(body.frameImage, 'velvetsnap/templates');
    }
    if (body.thumbnail && isBase64(body.thumbnail)) {
      body.thumbnail = await uploadBase64(body.thumbnail, 'velvetsnap/templates');
    }
    // Upload element sticker images to Cloudinary
    if (body.elementImages && body.elements) {
      const uploaded = await Promise.all(
        Object.entries(body.elementImages as Record<string, string>).map(async ([id, b64]) => {
          if (isBase64(b64)) {
            const url = await uploadBase64(b64, 'velvetsnap/templates');
            return { id, url };
          }
          return null;
        })
      );
      for (const item of uploaded) {
        if (!item) continue;
        const el = (body.elements as any[]).find((e: any) => e.id === item.id);
        if (el) el.props.stickerUrl = item.url;
      }
      delete body.elementImages;
    }

    const template = await Template.create(body);
    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
