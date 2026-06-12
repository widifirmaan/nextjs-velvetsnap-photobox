import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';

export async function GET() {
  try {
    await connectDB();
    const templates = await Template.find({}, 'templateId name slots price color isActive fullresUrl thumbUrl thumbnail frameImage type').sort({ createdAt: -1 });
    const data = templates.map((t: any) => {
      const o = t.toObject ? t.toObject() : t;
      return { ...o, thumbUrl: o.thumbUrl || o.thumbnail, fullresUrl: o.fullresUrl || o.frameImage };
    });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
