import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/Account';
import { getSession } from '@/lib/require-admin';
import { hashPassword, generateSessionToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session.isRoot) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const accounts = await Account.find({})
      .select('username createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: accounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session.isRoot) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { username, password } = await req.json();
    if (!username || username.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Username minimal 2 karakter' }, { status: 400 });
    }
    if (!password || password.length < 4) {
      return NextResponse.json({ success: false, error: 'Password minimal 4 karakter' }, { status: 400 });
    }

    if (username === 'root') {
      return NextResponse.json({ success: false, error: 'Username "root" tidak dapat digunakan' }, { status: 400 });
    }

    await connectDB();
    const existing = await Account.findOne({ username: username.trim() }).lean();
    if (existing) {
      return NextResponse.json({ success: false, error: 'Username sudah digunakan' }, { status: 409 });
    }

    const { hash, salt } = hashPassword(password);
    const account = await Account.create({
      username: username.trim(),
      password: hash,
      passwordSalt: salt,
      session: '',
    });

    return NextResponse.json({ success: true, data: { _id: account._id, username: account.username, createdAt: account.createdAt } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
