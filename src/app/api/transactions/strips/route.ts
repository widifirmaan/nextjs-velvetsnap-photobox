import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    const filter: any = { finalImage: { $ne: '' }, showInCarousel: true };
    if (accountId === 'root') {
      filter.accountId = { $in: [null, undefined] };
    } else if (accountId) {
      filter.accountId = accountId;
    } else {
      // Public/kiosk — root strips only
      filter.accountId = { $in: [null, undefined] };
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
