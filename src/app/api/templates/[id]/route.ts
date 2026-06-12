import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import { uploadBase64, isBase64, deleteImages } from '@/lib/cloudinary';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    // Upload element sticker images to Cloudinary
    if (body.elementImages && body.elements) {
      const entries = Object.entries(body.elementImages as Record<string, string>);
      for (const [eid, b64] of entries) {
        if (isBase64(b64)) {
          const url = await uploadBase64(b64, 'velvetsnap/templates').catch(
            (e: any) => { throw new Error('element ' + eid + ' upload failed: ' + e.message); }
          );
          const el = (body.elements as any[]).find((e: any) => e.id === eid);
          if (el) el.props.stickerUrl = url;
        }
      }
      delete body.elementImages;
    }

    const template = await Template.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const template = await Template.findById(id).lean();
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    const imageUrls: string[] = [];
    if (template.fullresUrl) imageUrls.push(template.fullresUrl);
    if (template.thumbUrl) imageUrls.push(template.thumbUrl);
    if (template.elements) {
      for (const el of template.elements) {
        if (el.props?.stickerUrl) imageUrls.push(el.props.stickerUrl);
      }
    }

    await deleteImages(imageUrls);
    await Template.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
