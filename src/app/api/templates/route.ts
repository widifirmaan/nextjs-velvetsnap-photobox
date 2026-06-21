import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import { getSession, buildAccountFilter } from '@/lib/require-admin';
import { normalizeTemplate } from '@/lib/normalize-template';
import { apiError } from '@/lib/api-utils';

export async function GET(req: Request) {
  try {
    await connectDB();
    const filter = await buildAccountFilter(req);

    const templates = await Template.find(filter).sort({ createdAt: -1 }).lean();

    const data = templates.map((t) => normalizeTemplate(t as unknown as Record<string, unknown>));

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session.token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const doc = await Template.create({
      templateId: body.templateId,
      templateName: body.templateName,
      templateDesc: body.templateDesc || '',
      templatePrice: body.templatePrice ?? 35000,
      templateFull: body.templateFull || '',
      templateThumb: body.templateThumb || '',
      templateData: {
        elements: body.templateData?.elements || [],
        slotsLayout: body.templateData?.slotsLayout || [],
        canvasWidth: body.templateData?.canvasWidth || 1000,
        canvasHeight: body.templateData?.canvasHeight || 3000,
        color: body.templateData?.color || '#ffffff',
        type: body.templateData?.type || 'strip',
        slots: body.templateData?.slots ?? 1,
      },
      isActive: body.isActive !== undefined ? body.isActive : true,
      accountId: session.accountId || null,
    });

    return NextResponse.json({ success: true, data: normalizeTemplate(doc.toObject()) }, { status: 201 });
  } catch (error: unknown) {
    return apiError(error);
  }
}
