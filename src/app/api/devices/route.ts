// File: src/app/api/devices/route.ts
// Description: Auto-added top comment for easier file identification.

import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Device from '@/models/Device';
import { apiError } from '@/lib/utils/api-utils';
export async function GET(_req: Request) {
  try {
    await connectDB();
    const devices = await Device.find({});
    return NextResponse.json({ success: true, data: devices });
  } catch (error: unknown) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const device = await Device.create(body);
    return NextResponse.json({ success: true, data: device });
  } catch (error: unknown) {
    return apiError(error);
  }
}
