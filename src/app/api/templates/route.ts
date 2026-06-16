import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import { getSession } from '@/lib/require-admin';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    let filter: any = {};

    const qAccountId = searchParams.get('accountId');
    if (qAccountId) {
      if (qAccountId === 'root') filter = { accountId: { $in: [null, undefined] } };
      else filter = { accountId: qAccountId };
    } else {
      const session = await getSession(req);
      if (session.accountId && !session.isRoot) {
        filter = { accountId: session.accountId };
      } else if (!session.token) {
        filter = { accountId: { $in: [null, undefined] } };
      }
    }

    const templates = await Template.find(filter).sort({ createdAt: -1 }).lean();
    const { normalizeTemplate } = await import('@/lib/normalize-template');

    const data = templates.map((t: any) => normalizeTemplate(t));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
