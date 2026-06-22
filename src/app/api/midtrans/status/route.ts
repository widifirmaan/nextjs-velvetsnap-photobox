import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { apiError } from '@/lib/api-utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const orderId = searchParams.get('orderId');

    if (!sessionId && !orderId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId or orderId' }, { status: 400 });
    }

    await connectDB();

    const filter: Record<string, any> = {};
    if (orderId) filter.orderId = orderId;
    else filter.sessionId = sessionId;

    const tx = await Transaction.findOne(filter).lean();

    if (!tx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: tx._id,
        status: tx.status,
        midtransStatus: tx.midtransStatus,
        orderId: tx.orderId,
        qrCodeUrl: tx.qrCodeUrl,
        transactionId: tx.midtransTransactionId,
        paymentMethod: tx.paymentMethod,
      },
    });
  } catch (error: unknown) {
    return apiError(error);
  }
}
