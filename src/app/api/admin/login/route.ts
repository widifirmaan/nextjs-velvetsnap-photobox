import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { hashPassword, verifyPassword, generateSessionToken } from '@/lib/auth';
import { getAdminToken } from '@/lib/require-admin';

export async function POST(req: Request) {
  try {
    await connectDB();
    let settings = await Settings.findOne({});

    const existing = getAdminToken(req);
    if (existing && settings?.adminSession === existing && settings?.adminSessionExpires && new Date(settings.adminSessionExpires) > new Date()) {
      return NextResponse.json({ success: true });
    }

    if (!settings) {
      settings = await Settings.create({});
    }

    if (!settings.adminPassword) {
      const { hash, salt } = hashPassword('root');
      settings.adminPassword = hash;
      settings.adminPasswordSalt = salt;
      await settings.save();
    }

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 });
    }

    if (!verifyPassword(password, settings.adminPassword, settings.adminPasswordSalt)) {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }

    const token = generateSessionToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    settings.adminSession = token;
    settings.adminSessionExpires = expires;
    await settings.save();

    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires,
    });
    return res;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const token = getAdminToken(req);
    await connectDB();
    const settings = await Settings.findOne({});
    if (settings && token && settings.adminSession === token) {
      settings.adminSession = '';
      settings.adminSessionExpires = null;
      await settings.save();
    }
    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return res;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
