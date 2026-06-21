import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import { uploadBase64, isBase64, deleteImages } from '@/lib/cloudinary';
import { normalizeTemplate } from '@/lib/normalize-template';
import { getSession } from '@/lib/require-admin';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const session = await getSession(req);
    const tData = body.templateData || {};

    // Scope check: account can only edit own templates
    const existing = await Template.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }
    if (session.accountId && existing.accountId && existing.accountId !== session.accountId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

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

    const folder = `velvetsnap/templates/${id}`;
    let templateFullUrl = templateFull;
    let templateThumbUrl = templateThumb;
    for (const u of toUpload) {
      const url = await uploadBase64(u.b64, folder, u.key).catch(
        (e: unknown) => { throw new Error(`${u.key} upload failed: ${e instanceof Error ? e.message : String(e)}`); }
      );
      if (u.key === 'templateFull') templateFullUrl = url;
      else if (u.key === 'templateThumb') templateThumbUrl = url;
      else {
        const eid = u.key.replace('el_', '');
        const el = elements.find((e: { id: string }) => e.id === eid);
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
        elements, slotsLayout,
        canvasWidth: tData.canvasWidth || body.canvasWidth || 1000,
        canvasHeight: tData.canvasHeight || body.canvasHeight || 3000,
        color: tData.color || body.color || '#ffffff',
        type: tData.type || body.type || 'frame',
        slots: tData.slots ?? body.slots ?? 1,
      },
    };
    if (body.isActive !== undefined) update.isActive = body.isActive;

    const doc = await Template.findByIdAndUpdate(id, update, { returnDocument: 'after' }).lean();
    return NextResponse.json({ success: true, data: normalizeTemplate(doc) });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const session = await getSession(req);

    const doc = await Template.findById(id).lean();
    if (!doc) { return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 }); }

    // Scope check
    if (session.accountId && doc.accountId && doc.accountId !== session.accountId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const imageUrls: string[] = [];
    const fullUrl = doc.templateFull || doc.fullresUrl;
    const thumbUrl = doc.templateThumb || doc.thumbUrl;
    if (fullUrl) imageUrls.push(fullUrl);
    if (thumbUrl) imageUrls.push(thumbUrl);
    const els = doc.templateData?.elements || doc.elements || [];
    for (const el of els) { if (el.props?.stickerUrl) imageUrls.push(el.props.stickerUrl); }

    await deleteImages(imageUrls);
    await Template.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
