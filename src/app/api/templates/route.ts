import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import { buildAccountFilter } from '@/lib/require-admin';
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
