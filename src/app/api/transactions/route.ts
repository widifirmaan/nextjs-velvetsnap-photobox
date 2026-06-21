import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { getSession } from '@/lib/require-admin';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { sessionId, templateId, price, status, captures, finalImage, orderId, qrCodeUrl } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 });
    }

    const txData: any = {
      sessionId: sessionId || uuidv4(),
      templateId: templateId || 't1',
      price: price || 35000,
      status: status || 'PAID',
      captures: captures || [],
      finalImage: finalImage || '',
      orderId: orderId || null,
      qrCodeUrl: qrCodeUrl || null,
    };

    const existing = await Transaction.findOne({ sessionId });
    let tx;
    if (existing) {
      tx = await Transaction.findOneAndUpdate({ sessionId }, txData, { new: true }).lean();
    } else {
      tx = await Transaction.create(txData);
    }

    return NextResponse.json({ success: true, data: tx }, { status: existing ? 200 : 201 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const filter: any = {};

    const qAccountId = searchParams.get('accountId');
    if (qAccountId) {
      if (qAccountId === 'root') filter.accountId = { $in: [null, undefined] };
      else filter.accountId = qAccountId;
    } else {
      const session = await getSession(req);
      if (session.accountId && !session.isRoot) {
        filter.accountId = session.accountId;
      } else if (!session.token) {
        filter.accountId = { $in: [null, undefined] };
      }
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Transaction.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: transactions,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
