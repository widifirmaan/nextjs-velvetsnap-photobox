import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { getSession } from '@/lib/require-admin';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const filter: any = {};
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
    return NextResponse.json({ success: true, total });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
