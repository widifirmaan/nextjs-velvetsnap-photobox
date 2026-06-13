import { NextResponse } from 'next/server';

export function getAdminToken(req: Request): string | null {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)admin_token=([^;]*)/);
  return match ? match[1] : null;
}

export function requireAdmin(req: Request): NextResponse | null {
  const token = getAdminToken(req);
  const expected = Buffer.from('admin:root').toString('base64');
  if (!token || token !== expected) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
