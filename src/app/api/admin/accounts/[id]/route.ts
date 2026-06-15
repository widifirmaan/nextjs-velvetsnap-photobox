import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Account from '@/models/Account';
import { getSession } from '@/lib/require-admin';
import { hashPassword } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(req);
    if (!session.isRoot) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();
    const account = await Account.findByIdAndDelete(id).lean();
    if (!account) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(req);
    if (!session.isRoot) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { password } = await req.json();
    if (!password || password.length < 4) {
      return NextResponse.json({ success: false, error: 'Password minimal 4 karakter' }, { status: 400 });
    }

    const { id } = await params;
    await connectDB();

    const { hash, salt } = hashPassword(password);
    const account = await Account.findByIdAndUpdate(id, { password: hash, passwordSalt: salt, session: '' }, { new: true }).lean();

    if (!account) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
