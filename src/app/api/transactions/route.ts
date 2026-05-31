import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const filter: any = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }
    await Transaction.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { templateId, price, status, captures, finalImage } = body;

    if (!templateId) {
      return NextResponse.json({ success: false, error: 'templateId is required' }, { status: 400 });
    }

    // Generate sessionId: YYMMDD + 10-digit auto-increment
    const now = new Date();
    const prefix =
      String(now.getFullYear()).slice(2) +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');

    // Find the highest counter for today
    const last = await Transaction.findOne(
      { sessionId: new RegExp(`^${prefix}`) },
      { sessionId: 1 },
      { sort: { sessionId: -1 } },
    ).lean();

    let counter = 1;
    if (last && last.sessionId) {
      const lastCounter = parseInt(last.sessionId.slice(6), 10);
      if (!isNaN(lastCounter)) counter = lastCounter + 1;
    }

    const sessionId = prefix + String(counter).padStart(10, '0');

    // Drop stale unique index on 'id' if it exists (legacy migration)
    try {
      await Transaction.collection.dropIndex('id_1');
    } catch {}

    const tx = await Transaction.create({
      sessionId,
      templateId,
      price: price || 35000,
      status: status || 'PAID',
      captures: captures || [],
      finalImage: finalImage || '',
    });

    return NextResponse.json({ success: true, transaction: tx });
  } catch (error: any) {
    console.error('Transaction POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
