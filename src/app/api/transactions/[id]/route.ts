import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const tx = await Transaction.findById(id).lean();
    if (!tx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: tx });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await connectDB();

    if (body.showInCarousel === true) {
      const activeCount = await Transaction.countDocuments({ showInCarousel: true, _id: { $ne: id } });
      if (activeCount >= 7) {
        return NextResponse.json({ success: false, error: 'Maksimal 7 strip yang dapat ditampilkan' }, { status: 400 });
      }
    }

    const tx = await Transaction.findByIdAndUpdate(id, { showInCarousel: body.showInCarousel }, { new: true }).lean();
    if (!tx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: tx });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
