// File: src/app/api/admin/accounts/route.ts
// Description: Auto-added top comment for easier file identification.

import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Account from '@/models/Account';
import { requireRoot } from '@/lib/utils/require-admin';
import { hashPassword } from '@/lib/utils/auth';
import { apiError } from '@/lib/utils/api-utils';

export async function GET(req: Request) {
  try {
    const forbidden = await requireRoot(req);
    if (forbidden) return forbidden;

    await connectDB();
    const accounts = await Account.find({})
      .select('username createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: accounts });
  } catch (error: unknown) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const forbidden = await requireRoot(req);
    if (forbidden) return forbidden;

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
  } catch (error: unknown) {
    return apiError(error);
  }
}
