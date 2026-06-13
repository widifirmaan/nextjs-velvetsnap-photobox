import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { getAdminToken } from '@/lib/require-admin';

export async function GET(req: Request) {
  try {
    const token = getAdminToken(req);
    if (!token) {
      return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
    }
    await connectDB();
    const settings = await Settings.findOne({}).lean();
    const storedToken = settings?.security?.session || settings?.adminSession;
    if (!storedToken || storedToken !== token) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
