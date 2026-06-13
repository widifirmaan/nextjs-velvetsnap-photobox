import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { hashPassword } from '@/lib/auth';
import { requireAdmin } from '@/lib/require-admin';

export async function PUT(req: Request) {
  const u = await requireAdmin(req);
  if (u) return u;
  try {
    const { password } = await req.json();
    if (!password || password.length < 4) {
      return NextResponse.json({ success: false, error: 'Password must be at least 4 characters' }, { status: 400 });
    }
    await connectDB();
    const { hash, salt } = hashPassword(password);
    const settings = await Settings.findOne({});
    if (settings) {
      settings.adminPassword = hash;
      settings.adminPasswordSalt = salt;
      await settings.save();
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
