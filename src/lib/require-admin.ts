import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';

export function getAdminToken(req: Request): string | null {
  const auth = req.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)admin_session=([^;]*)/);
  return match ? match[1] : null;
}

export async function requireAdmin(req: Request): Promise<NextResponse | null> {
  const token = getAdminToken(req);
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    const settings = await Settings.findOne({}).lean();
    const storedToken = settings?.security?.session || settings?.adminSession;
    if (!storedToken || storedToken !== token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return null;
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
