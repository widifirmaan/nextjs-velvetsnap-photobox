// File: src/app/api/midtrans/notification/route.ts
// Description: Auto-added top comment for easier file identification.

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/utils/db';
import Transaction from '@/models/Transaction';
import { apiError } from '@/lib/utils/api-utils';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = body.order_id;
    const transactionStatus = body.transaction_status;
    const transactionId = body.transaction_id;
    const paymentType = body.payment_type;
    const fraudStatus = body.fraud_status;
    const grossAmount = body.gross_amount;
    const statusCode = body.status_code;
    const signatureKey = body.signature_key;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Missing order_id' }, { status: 400 });
    }

    if (typeof orderId !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid order_id' }, { status: 400 });
    }

    // Signature verification
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const computed = crypto
      .createHash('sha512')
      .update(orderId + statusCode + grossAmount + serverKey)
      .digest('hex');
    if (computed !== signatureKey) {
      console.error('Midtrans signature mismatch:', { computed, received: signatureKey });
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 });
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

    await Transaction.findOneAndUpdate({ orderId }, updateData);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Midtrans notification error:', error);
    return apiError(error);
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'Midtrans notification endpoint ready' });
}
