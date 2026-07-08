// File: src/app/api/transactions/strips/route.ts
// Description: Auto-added top comment for easier file identification.

import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Transaction from '@/models/Transaction';
import { buildAccountFilter } from '@/lib/utils/require-admin';
import { apiError } from '@/lib/utils/api-utils';

export async function GET(req: Request) {
  try {
    await connectDB();

    const filter: Record<string, unknown> = { finalImage: { $ne: '' }, showInCarousel: true };
    const accountFilter = await buildAccountFilter(req);
    if (accountFilter.accountId) filter.accountId = accountFilter.accountId;

    const transactions = await Transaction.find(filter)
      .select('_id sessionId finalImage')
      .sort({ createdAt: -1 })
      .limit(7)
      .lean();

    return NextResponse.json({ success: true, data: transactions }, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=30' } });
  } catch (error: unknown) {
    return apiError(error);
  }
}
