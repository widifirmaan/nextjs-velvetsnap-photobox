import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import Account from '@/models/Account';

export interface SessionInfo {
  token: string | null;
  isRoot: boolean;
  accountId: string | null;
  username: string | null;
}

export function getAdminToken(req: Request): string | null {
  const auth = req.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)admin_session=([^;]*)/);
  return match ? match[1] : null;
}

export async function getSession(req: Request): Promise<SessionInfo> {
  const token = getAdminToken(req);
  if (!token) return { token: null, isRoot: false, accountId: null, username: null };

  try {
    await connectDB();

    // Check root session
    const settings = await Settings.findOne({}).lean();
    const rootToken = settings?.security?.session || settings?.adminSession;
    if (rootToken && rootToken === token) {
      return { token, isRoot: true, accountId: null, username: 'root' };
    }

    // Check account sessions
    const account = await Account.findOne({ session: token }).lean();
    if (account) {
      return { token, isRoot: false, accountId: account._id.toString(), username: account.username };
    }

    return { token: null, isRoot: false, accountId: null, username: null };
  } catch {
    return { token: null, isRoot: false, accountId: null, username: null };
  }
}

export async function requireAdmin(req: Request): Promise<NextResponse | null> {
  const session = await getSession(req);
  if (!session.token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function buildAccountFilter(req: Request): Promise<Record<string, unknown>> {
  const { searchParams } = new URL(req.url);
  const filter: Record<string, unknown> = {};
  const session = await getSession(req);

  const qAccountId = searchParams.get('accountId');
  if (qAccountId) {
    if (!session.isRoot && qAccountId !== session.accountId) {
      filter.accountId = session.accountId || { $in: [null, undefined] };
    } else if (qAccountId === 'root') {
      filter.accountId = { $in: [null, undefined] };
    } else {
      filter.accountId = qAccountId;
    }
  } else {
    if (session.accountId && !session.isRoot) {
      filter.accountId = session.accountId;
    } else if (!session.token) {
      filter.accountId = { $in: [null, undefined] };
    }
  }

  return filter;
}
