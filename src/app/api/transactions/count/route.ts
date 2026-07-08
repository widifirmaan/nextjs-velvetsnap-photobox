// File: src/app/api/transactions/count/route.ts
// Description: Auto-added top comment for easier file identification.

import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Transaction from '@/models/Transaction';
import { buildAccountFilter } from '@/lib/utils/require-admin';
import { apiError } from '@/lib/utils/api-utils';

export async function GET(req: Request) {
  try {
    await connectDB();
    const filter = await buildAccountFilter(req);

    const total = await Transaction.countDocuments(filter);
    return NextResponse.json({ success: true, total }, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60' } });
  } catch (error: unknown) {
    return apiError(error);
  }
}
