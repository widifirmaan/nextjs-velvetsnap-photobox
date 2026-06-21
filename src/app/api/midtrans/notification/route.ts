import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = body.order_id;
    const transactionStatus = body.transaction_status;
    const transactionId = body.transaction_id;
    const paymentType = body.payment_type;
    const fraudStatus = body.fraud_status;

    console.log('Midtrans notification:', { orderId, transactionStatus, transactionId, paymentType });

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Missing order_id' }, { status: 400 });
    }

    await connectDB();

    let status: 'PENDING' | 'PAID' | 'COMPLETED' = 'PENDING';
    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      if (fraudStatus === 'accept' || fraudStatus === null || fraudStatus === undefined) {
        status = 'PAID';
      }
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
      status = 'PENDING';
    }

    const updateData: Record<string, any> = {
      midtransTransactionId: transactionId,
      midtransStatus: transactionStatus,
      paymentMethod: paymentType,
    };

    if (status === 'PAID') {
      updateData.status = 'PAID';
    }

    await (Transaction as any).findOneAndUpdate({ orderId }, updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Midtrans notification error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'Midtrans notification endpoint ready' });
}
