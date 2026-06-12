import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';

export async function GET() {
  try {
    await connectDB();
    const templates = await Template.find({}, 'templateId name slots price color isActive thumbnail type').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
