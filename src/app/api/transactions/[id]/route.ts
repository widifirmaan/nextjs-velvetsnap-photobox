// File: src/app/api/transactions/[id]/route.ts
// Description: Auto-added top comment for easier file identification.

import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Transaction from '@/models/Transaction';
import { getSession } from '@/lib/utils/require-admin';
import { apiError } from '@/lib/utils/api-utils';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const tx = await Transaction.findById(id).lean();
    if (!tx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    const session = await getSession(_req);
    if (session.accountId && tx.accountId && tx.accountId !== session.accountId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: tx });
  } catch (error: unknown) {
    return apiError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const session = await getSession(req);
    const existing = await Transaction.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }
    if (session.accountId && existing.accountId && existing.accountId !== session.accountId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (body.showInCarousel === true) {
      const activeCount = await Transaction.countDocuments({ showInCarousel: true, _id: { $ne: id } });
      if (activeCount >= 7) {
        return NextResponse.json({ success: false, error: 'Maksimal 7 strip yang dapat ditampilkan' }, { status: 400 });
      }
    }

    const tx = await Transaction.findByIdAndUpdate(id, { showInCarousel: body.showInCarousel }, { new: true }).lean();
    return NextResponse.json({ success: true, data: tx });
  } catch (error: unknown) {
    return apiError(error);
  }
}
