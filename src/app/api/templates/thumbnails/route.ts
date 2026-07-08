// File: src/app/api/templates/thumbnails/route.ts
// Description: Auto-added top comment for easier file identification.

import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Template from '@/models/Template';
import mongoose from 'mongoose';
import { normalizeTemplate } from '@/lib/utils/normalize-template';
import { apiError } from '@/lib/utils/api-utils';
import { buildAccountFilter } from '@/lib/utils/require-admin';

export async function GET(req: Request) {
  try {
    await connectDB();
    const accountFilter = await buildAccountFilter(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const query = { ...accountFilter, ...(mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ _id: id }, { templateId: id }] }
        : { templateId: id }) };
      const template = await Template.findOne(query)
        .select('templateId templateName templateDesc templatePrice templateFull templateThumb templateData isActive accountId')
        .lean();
      if (!template) { return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 }); }
      return NextResponse.json({ success: true, data: [normalizeTemplate(template)] }, { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } });
    }

    const templates = await Template.find(accountFilter)
      .select('templateId templateName templateDesc templatePrice templateThumb templateData templateFull isActive accountId')
      .lean();
    const data = templates.map(normalizeTemplate);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return apiError(error);
  }
}
