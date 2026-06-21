import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Device from '@/models/Device';
export async function GET(req: Request) {
  try {
    await connectDB();
    const devices = await Device.find({});
    return NextResponse.json({ success: true, data: devices });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const device = await Device.create(body);
    return NextResponse.json({ success: true, data: device });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
