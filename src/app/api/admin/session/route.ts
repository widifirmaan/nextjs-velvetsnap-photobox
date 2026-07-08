// File: src/app/api/admin/session/route.ts
// Description: Auto-added top comment for easier file identification.

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/utils/require-admin';
import { apiError } from '@/lib/utils/api-utils';

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
