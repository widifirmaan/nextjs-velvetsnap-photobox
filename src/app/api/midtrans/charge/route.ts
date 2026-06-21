import { NextResponse } from 'next/server';
import { Snap } from 'midtrans-client';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { sessionId, templateId, price, captures, finalImage } = await req.json();

    if (!sessionId || !templateId || !price) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const orderId = `VS-${sessionId}-${Date.now()}`;

    const snap = new Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
      credit_card: { secure: false },
      enabled_payments: ['qris'],
      expiry: { duration: 30, unit: 'minutes' },
      customer_details: {
        first_name: 'Photobooth',
        last_name: 'Customer',
      },
    };

    const midtransResponse = await snap.createTransaction(parameter);

    const existing = await Transaction.findOne({ sessionId });

    let tx;
    if (existing) {
      await Transaction.updateOne(
        { _id: existing._id },
        {
          orderId,
          price,
          status: 'PENDING',
          midtransStatus: 'pending',
          qrCodeUrl: midtransResponse.redirect_url,
        }
      );
      tx = await Transaction.findById(existing._id);
    } else {
      tx = await Transaction.create({
        sessionId,
        templateId,
        orderId,
        price,
        status: 'PENDING',
        captures: captures || [],
        finalImage: finalImage || '',
        midtransStatus: 'pending',
        qrCodeUrl: midtransResponse.redirect_url,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        token: midtransResponse.token,
        redirectUrl: midtransResponse.redirect_url,
        orderId,
        transactionId: tx._id,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
