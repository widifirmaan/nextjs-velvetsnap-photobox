import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import { normalizeTemplate } from '@/lib/normalize-template';
import { getSession } from '@/lib/require-admin';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const session = await getSession(req);

    let filter: any = {};
    if (session.isRoot) {
      // Root sees all
    } else if (session.accountId) {
      filter = { accountId: session.accountId };
    } else {
      // Public/kiosk sees root templates
      filter = { accountId: { $in: [null, undefined] } };
    }

    const qAccountId = searchParams.get('accountId');
    if (qAccountId) {
      if (qAccountId === 'root') filter = { accountId: { $in: [null, undefined] } };
      else filter = { accountId: qAccountId };
    }

    const docs = await Template.find(filter).sort({ createdAt: -1 })
      .select('templateId templateName name templateThumb thumbUrl thumbnail templateFull templateDesc description templatePrice price templateData.color templateData.type templateData.slots templateData.slotsLayout isActive accountId createdAt')
      .lean();
    const data = docs.map(normalizeTemplate);
    return NextResponse.json({ success: true, data }, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
