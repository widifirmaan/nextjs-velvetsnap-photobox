import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Device from '@/models/Device';
import { requireAdmin } from '@/lib/require-admin';

export async function GET(req: Request) {
  const u = await requireAdmin(req);
  if (u) return u;
  try {
    await connectDB();
    const devices = await Device.find({});
    return NextResponse.json({ success: true, data: devices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const u = await requireAdmin(req);
  if (u) return u;
  try {
    await connectDB();
    const body = await req.json();
    const device = await Device.create(body);
    return NextResponse.json({ success: true, data: device });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
