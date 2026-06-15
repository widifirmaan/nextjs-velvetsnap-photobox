import { NextResponse } from 'next/server';
import { getSession } from '@/lib/require-admin';

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session.token) {
      return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
    }
    return NextResponse.json({ success: true, isRoot: session.isRoot, accountId: session.accountId, username: session.username });
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
