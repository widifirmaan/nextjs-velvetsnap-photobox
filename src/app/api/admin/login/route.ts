import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import Account from '@/models/Account';
import { hashPassword, verifyPassword, generateSessionToken } from '@/lib/auth';
import { getAdminToken } from '@/lib/require-admin';
import { apiError } from '@/lib/api-utils';
import { COOKIE_NAME, COOKIE_BASE } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!password) {
      return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 });
    }

    await connectDB();

    // Root login
    if (!username || username === 'root') {
      let settings = await Settings.findOne({}).select('+security');
      if (!settings) {
        settings = await Settings.create({});
      }

      // migrate old top-level fields to security nested object
      if (settings.adminPassword && !settings.security?.password) {
        settings.security = { password: settings.adminPassword, passwordSalt: settings.adminPasswordSalt || '', session: settings.adminSession || '' };
      } else if (!settings.security?.password) {
        const { hash, salt } = hashPassword('root');
        settings.security = { ...settings.security, password: hash, passwordSalt: salt };
      }
      await settings.save();

      const pwHash = settings.security?.password;
      const pwSalt = settings.security?.passwordSalt || '';
      if (!pwHash || !verifyPassword(password, pwHash, pwSalt)) {
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
      }

      const token = generateSessionToken();
      settings.security = { ...settings.security, session: token };
      await settings.save();

      const res = NextResponse.json({ success: true, token, isRoot: true, username: 'root' });
      res.cookies.set(COOKIE_NAME, token, { ...COOKIE_BASE, secure: process.env.NODE_ENV === 'production' });
      return res;
    }

    // Account login
    const account = await Account.findOne({ username });
    if (!account) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (!verifyPassword(password, account.password, account.passwordSalt || '')) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateSessionToken();
    account.session = token;
    await account.save();

    const res = NextResponse.json({ success: true, token, isRoot: false, accountId: account._id.toString(), username: account.username });
    res.cookies.set(COOKIE_NAME, token, { ...COOKIE_BASE, secure: process.env.NODE_ENV === 'production' });
    return res;
  } catch (error: unknown) {
    return apiError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const token = getAdminToken(req);

    if (token) {
      await connectDB();
      // Clear root session
      const settings = await Settings.findOne({}).select('+security');
      if (settings) {
        const existingToken = settings.security?.session || settings.adminSession;
        if (existingToken === token) {
          settings.security = { ...settings.security, session: '' };
          await settings.save();
        }
      }

      // Clear account session
      await Account.updateOne({ session: token }, { $set: { session: '' } });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, '', { ...COOKIE_BASE, secure: process.env.NODE_ENV === 'production', maxAge: 0 });
    return res;
  } catch (error: unknown) {
    return apiError(error);
  }
}
