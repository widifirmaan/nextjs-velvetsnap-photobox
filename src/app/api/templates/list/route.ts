import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import { normalizeTemplate } from '@/lib/normalize-template';

export async function GET() {
  try {
    await connectDB();
    const docs = await Template.find({}).sort({ createdAt: -1 }).lean();
    const data = docs.map(normalizeTemplate);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
