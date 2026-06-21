import { NextResponse } from 'next/server';
import { getSession } from '@/lib/require-admin';
import { apiError } from '@/lib/api-utils';

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session.token) {
      return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
    }
    return NextResponse.json({ success: true, isRoot: session.isRoot, accountId: session.accountId, username: session.username });
  } catch (error: unknown) {
    return apiError(error);
  }
}
