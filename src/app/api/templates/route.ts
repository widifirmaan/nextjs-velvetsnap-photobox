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

    if (body.fullresUrl && isBase64(body.fullresUrl)) {
      body.fullresUrl = await uploadBase64(body.fullresUrl, 'velvetsnap/templates').catch(
        (e: any) => { throw new Error('fullresUrl upload failed: ' + e.message); }
      );
    }
    if (body.thumbUrl && isBase64(body.thumbUrl)) {
      body.thumbUrl = await uploadBase64(body.thumbUrl, 'velvetsnap/templates').catch(
        (e: any) => { throw new Error('thumbUrl upload failed: ' + e.message); }
      );
    }
    if (body.elementImages && body.elements) {
      for (const [eid, b64] of Object.entries(body.elementImages as Record<string, string>)) {
        if (isBase64(b64)) {
          const url = await uploadBase64(b64, 'velvetsnap/templates').catch(
            (e: any) => { throw new Error('element ' + eid + ': ' + e.message); }
          );
          const el = (body.elements as any[]).find((e: any) => e.id === eid);
          if (el) el.props.stickerUrl = url;
        }
      }
      delete body.elementImages;
    }

    const template = await Template.create(body);
    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
