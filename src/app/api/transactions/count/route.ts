import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    await connectDB();
    const total = await Transaction.countDocuments({});
    return NextResponse.json({ success: true, total });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
