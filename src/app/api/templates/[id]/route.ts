import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import { uploadBase64, isBase64, deleteImages } from '@/lib/cloudinary';
import { normalizeTemplate } from '@/lib/normalize-template';
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const tData = body.templateData || {};

    const templateFull = body.templateFull || body.fullresUrl || '';
    const templateThumb = body.templateThumb || body.thumbUrl || '';
    const elements = tData.elements || body.elements || [];
    const slotsLayout = tData.slotsLayout || body.slotsLayout || [];

    const toUpload: { key: string; b64: string }[] = [];
    if (templateFull && isBase64(templateFull)) toUpload.push({ key: 'templateFull', b64: templateFull });
    if (templateThumb && isBase64(templateThumb)) toUpload.push({ key: 'templateThumb', b64: templateThumb });

    if (body.elementImages && elements.length) {
      for (const [eid, b64] of Object.entries(body.elementImages as Record<string, string>)) {
        if (isBase64(b64)) toUpload.push({ key: `el_${eid}`, b64 });
      }
    }

    let templateFullUrl = templateFull;
    let templateThumbUrl = templateThumb;
    for (const u of toUpload) {
      const url = await uploadBase64(u.b64, 'velvetsnap/templates').catch(
        (e: any) => { throw new Error(`${u.key} upload failed: ${e.message}`); }
      );
      if (u.key === 'templateFull') templateFullUrl = url;
      else if (u.key === 'templateThumb') templateThumbUrl = url;
      else {
        const eid = u.key.replace('el_', '');
        const el = elements.find((e: any) => e.id === eid);
        if (el) el.props.stickerUrl = url;
      }
    }

    const update: any = {
      templateName: body.templateName || body.name,
      templateDesc: body.templateDesc ?? body.description,
      templatePrice: body.templatePrice ?? body.price,
      templateFull: templateFullUrl,
      templateThumb: templateThumbUrl,
      templateData: {
        elements,
        slotsLayout,
        canvasWidth: tData.canvasWidth || body.canvasWidth || 1000,
        canvasHeight: tData.canvasHeight || body.canvasHeight || 3000,
        color: tData.color || body.color || '#ffffff',
        type: tData.type || body.type || 'frame',
        slots: tData.slots ?? body.slots ?? 1,
      },
    };
    if (body.isActive !== undefined) update.isActive = body.isActive;

    const doc = await Template.findByIdAndUpdate(id, update, { new: true }).lean();
    return NextResponse.json({ success: true, data: normalizeTemplate(doc) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const doc = await Template.findById(id).lean();
    if (!doc) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    const imageUrls: string[] = [];
    const fullUrl = doc.templateFull || doc.fullresUrl;
    const thumbUrl = doc.templateThumb || doc.thumbUrl;
    if (fullUrl) imageUrls.push(fullUrl);
    if (thumbUrl) imageUrls.push(thumbUrl);
    const els = doc.templateData?.elements || doc.elements || [];
    for (const el of els) {
      if (el.props?.stickerUrl) imageUrls.push(el.props.stickerUrl);
    }

    await deleteImages(imageUrls);
    await Template.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
