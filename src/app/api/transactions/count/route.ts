import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { getSession } from '@/lib/require-admin';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const filter: Record<string, unknown> = {};
    const accountId = searchParams.get('accountId');

    if (accountId) {
      if (accountId === 'root') filter.accountId = { $in: [null, undefined] };
      else filter.accountId = accountId;
    } else {
      const session = await getSession(req);
      if (session.accountId && !session.isRoot) {
        filter.accountId = session.accountId;
      } else if (!session.token) {
        filter.accountId = { $in: [null, undefined] };
      }
    }

    const total = await Transaction.countDocuments(filter);
    return NextResponse.json({ success: true, total }, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60' } });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
