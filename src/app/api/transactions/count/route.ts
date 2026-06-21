import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { buildAccountFilter } from '@/lib/require-admin';
import { apiError } from '@/lib/api-utils';

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
