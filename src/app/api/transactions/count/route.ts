import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    const filter: any = {};
    if (accountId === 'root') {
      filter.accountId = { $in: [null, undefined] };
    } else if (accountId) {
      filter.accountId = accountId;
    } else {
      // Public/kiosk — root transactions only
      filter.accountId = { $in: [null, undefined] };
    }

    const total = await Transaction.countDocuments(filter);
    return NextResponse.json({ success: true, total });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
