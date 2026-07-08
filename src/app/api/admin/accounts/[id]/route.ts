// File: src/app/api/admin/accounts/[id]/route.ts
// Description: Auto-added top comment for easier file identification.

import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Account from '@/models/Account';
import { requireRoot } from '@/lib/utils/require-admin';
import { hashPassword } from '@/lib/utils/auth';
import { apiError } from '@/lib/utils/api-utils';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const forbidden = await requireRoot(req);
    if (forbidden) return forbidden;

    const { id } = await params;
    await connectDB();
    const account = await Account.findByIdAndDelete(id).lean();
    if (!account) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return apiError(error);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const forbidden = await requireRoot(req);
    if (forbidden) return forbidden;

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
  } catch (error: unknown) {
    return apiError(error);
  }
}
