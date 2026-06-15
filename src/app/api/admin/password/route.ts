import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import Account from '@/models/Account';
import { hashPassword } from '@/lib/auth';
import { getSession } from '@/lib/require-admin';

export async function PUT(req: Request) {
  try {
    const { password } = await req.json();
    if (!password || password.length < 4) {
      return NextResponse.json({ success: false, error: 'Password must be at least 4 characters' }, { status: 400 });
    }

    const session = await getSession(req);
    if (!session.token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { hash, salt } = hashPassword(password);

    if (session.isRoot) {
      const settings = await Settings.findOne({});
      if (settings) {
        settings.security = { ...settings.security, password: hash, passwordSalt: salt };
        await settings.save();
      }
    } else if (session.accountId) {
      await Account.findByIdAndUpdate(session.accountId, { password: hash, passwordSalt: salt });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
