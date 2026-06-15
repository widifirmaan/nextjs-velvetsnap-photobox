import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';
import { uploadBase64, uploadBase64Array, isBase64 } from '@/lib/cloudinary';
import { getSession } from '@/lib/require-admin';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const session = await getSession(req);

    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const filter: any = {};

    // Account filtering
    if (session.isRoot) {
      // Root sees all
    } else if (session.accountId) {
      filter.accountId = session.accountId;
    } else {
      // Public/unauth — no transactions (or root-only)
      filter.accountId = { $in: [null, undefined] };
    }

    const qAccountId = searchParams.get('accountId');
    if (qAccountId) {
      if (qAccountId === 'root') filter.accountId = { $in: [null, undefined] };
      else filter.accountId = qAccountId;
    }

    if (status && status !== 'ALL') filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .select('sessionId templateId price status createdAt finalImage showInCarousel accountId')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();

    return NextResponse.json({ success: true, data: transactions, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) { return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 }); }

    const session = await getSession(req);
    const tx = await Transaction.findById(id).lean();
    if (!tx) { return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 }); }
    if (session.accountId && tx.accountId && tx.accountId !== session.accountId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await Transaction.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getSession(req);
    const body = await req.json();
    const { templateId, price, status, captures, finalImage } = body;
    if (!templateId) { return NextResponse.json({ success: false, error: 'templateId is required' }, { status: 400 }); }

    const now = new Date();
    const prefix = String(now.getFullYear()).slice(2) + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');

    const last = await Transaction.findOne({ sessionId: new RegExp(`^${prefix}`) }, { sessionId: 1 }, { sort: { sessionId: -1 } }).lean();
    let counter = 1;
    if (last && last.sessionId) { const lastCounter = parseInt(last.sessionId.slice(6), 10); if (!isNaN(lastCounter)) counter = lastCounter + 1; }
    const sessionId = prefix + String(counter).padStart(10, '0');

    try { await Transaction.collection.dropIndex('id_1'); } catch {}

    let finalImageUrl = finalImage || '';
    let capturesUrls = captures || [];
    if (finalImage && isBase64(finalImage)) { finalImageUrl = await uploadBase64(finalImage, 'velvetsnap/final'); }
    if (captures?.length) {
      const b64Captures = captures.filter(isBase64);
      if (b64Captures.length) {
        const urls = await uploadBase64Array(b64Captures, 'velvetsnap/captures');
        let idx = 0;
        capturesUrls = captures.map((c: string) => isBase64(c) ? (urls[idx++] || c) : c);
      }
    }

    const tx = await Transaction.create({
      sessionId, templateId, price: price ?? 35000, status: status || 'PAID',
      captures: capturesUrls, finalImage: finalImageUrl,
      accountId: session.accountId || null,
    });
    return NextResponse.json({ success: true, data: tx });
  } catch (error: any) { console.error('Transaction POST error:', error); return NextResponse.json({ success: false, error: error.message }, { status: 500 }); }
}
