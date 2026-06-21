import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import { uploadBase64 } from '@/lib/cloudinary';
import { apiError } from '@/lib/api-utils';

async function urlToBase64(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const mime = res.headers.get('content-type') || 'image/png';
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    await connectDB();
    const templates = await Template.find({}).lean();
    const results: any[] = [];

    for (const doc of templates) {
      const id = doc._id.toString();
      const folder = `velvetsnap/templates/${id}`;
      const name = doc.templateName || doc.name || 'Untitled';
      let status = 'ok';
      const errors: string[] = [];

      try {
        const fullUrl: string = doc.templateFull || doc.fullresUrl || '';
        const thumbUrl: string = doc.templateThumb || doc.thumbUrl || '';
        const els: any[] = doc.templateData?.elements || doc.elements || [];

        const updateFields: Record<string, any> = {};
        const updatedElements = JSON.parse(JSON.stringify(els));

        if (fullUrl && fullUrl.includes('res.cloudinary.com')) {
          const b64 = await urlToBase64(fullUrl);
          if (b64) {
            const url = await uploadBase64(b64, folder, 'templateFull');
            updateFields.templateFull = url;
            updateFields.fullresUrl = url;
          } else {
            errors.push('templateFull download failed');
          }
        }

        if (thumbUrl && thumbUrl.includes('res.cloudinary.com')) {
          const b64 = await urlToBase64(thumbUrl);
          if (b64) {
            const url = await uploadBase64(b64, folder, 'templateThumb');
            updateFields.templateThumb = url;
            updateFields.thumbUrl = url;
          } else {
            errors.push('templateThumb download failed');
          }
        }

        for (const el of updatedElements) {
          const stickerUrl: string = el.props?.stickerUrl;
          if (stickerUrl && stickerUrl.includes('res.cloudinary.com')) {
            const b64 = await urlToBase64(stickerUrl);
            if (b64) {
              const url = await uploadBase64(b64, folder, `el_${el.id}`);
              el.props.stickerUrl = url;
            } else {
              errors.push(`element ${el.id} download failed`);
            }
          }
        }

        if (updatedElements.length) {
          updateFields['templateData.elements'] = updatedElements;
          updateFields.elements = updatedElements;
        }

        await Template.findByIdAndUpdate(id, { $set: updateFields });

        if (errors.length) status = 'partial';
      } catch (e: unknown) {
        status = 'error';
        errors.push(e instanceof Error ? e.message : String(e));
      }

      results.push({ id, name, status, errors: errors.length ? errors : undefined });
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: unknown) {
    return apiError(error);
  }
}
