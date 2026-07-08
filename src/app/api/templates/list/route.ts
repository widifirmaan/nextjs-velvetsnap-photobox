// File: src/app/api/templates/list/route.ts
// Description: Auto-added top comment for easier file identification.

import connectDB from '@/lib/utils/db';
import Template from '@/models/Template';
import { NextResponse } from 'next/server';
import { buildAccountFilter } from '@/lib/utils/require-admin';
import { normalizeTemplate } from '@/lib/utils/normalize-template';
import { apiError } from '@/lib/utils/api-utils';

export async function GET(req: Request) {
  try {
    await connectDB();
    const filter = await buildAccountFilter(req);

    const templates = await Template.find(filter)
      .select('-name -description -price -fullresUrl -thumbUrl -__v')
      .sort({ createdAt: -1 }).lean();

    const data = templates.map((t) => normalizeTemplate(t as unknown as Record<string, unknown>));

      return NextResponse.json({ success: true, data }, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60' } });
  } catch (error: unknown) {
    return apiError(error);
  }
}
