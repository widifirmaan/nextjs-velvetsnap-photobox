import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { getSession } from '@/lib/require-admin';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    const filter: any = { finalImage: { $ne: '' }, showInCarousel: true };

    if (accountId) {
      if (accountId === 'root') filter.accountId = { $in: [null, undefined] };
      else filter.accountId = accountId;
    } else {
      const session = await getSession(req);
      if (session.accountId && !session.isRoot) {
        filter.accountId = session.accountId;
      } else if (!session.token) {
        // No session → root only
        filter.accountId = { $in: [null, undefined] };
      }
      // Root session → no filter (all)
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(7)
      .lean();

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
