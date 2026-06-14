import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import { uploadBase64, isBase64 } from '@/lib/cloudinary';
import { normalizeTemplate } from '@/lib/normalize-template';
export async function GET(req: Request) {
  try {
    await connectDB();
    const docs = await Template.find({})
      .select('templateId templateName name templateDesc description templatePrice price templateData templateFull fullresUrl frameImage templateThumb thumbUrl thumbnail canvasWidth canvasHeight color type slots elements slotsLayout isActive createdAt')
      .lean();
    return NextResponse.json({ success: true, data: docs.map(normalizeTemplate) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const tData = body.templateData || {};

    // Backward compat: accept both new (templateFull) and old (fullresUrl) field names
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

    const folder = body.templateId ? `velvetsnap/templates/${body.templateId}` : 'velvetsnap/templates';
    let templateFullUrl = templateFull;
    let templateThumbUrl = templateThumb;
    for (const u of toUpload) {
      const url = await uploadBase64(u.b64, folder, u.key).catch(
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

    const doc = await Template.create({
      templateId: body.templateId || body._id,
      templateName: body.templateName || body.name || 'Untitled',
      templateDesc: body.templateDesc || body.description || '',
      templatePrice: body.templatePrice ?? body.price ?? 0,
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
      isActive: body.isActive ?? true,
    });

    return NextResponse.json({ success: true, data: normalizeTemplate(doc.toObject()) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
