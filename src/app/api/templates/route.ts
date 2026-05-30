import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';

export async function GET() {
  try {
    await connectDB();
    const templates = await Template.find({});
    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const template = await Template.create(body);
    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
