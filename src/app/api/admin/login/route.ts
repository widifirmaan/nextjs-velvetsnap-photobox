import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import Account from '@/models/Account';
import { hashPassword, verifyPassword, generateSessionToken } from '@/lib/auth';
import { getAdminToken } from '@/lib/require-admin';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!password) {
      return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 });
    }

    await connectDB();

    // Root login
    if (!username || username === 'root') {
      let settings = await Settings.findOne({});
      if (!settings) {
        settings = await Settings.create({});
      }

      // migrate old top-level fields to security nested object
      if (settings.adminPassword && !settings.security?.password) {
        settings.security = { password: settings.adminPassword, passwordSalt: settings.adminPasswordSalt, session: settings.adminSession || '', sessionExpires: null };
      } else if (!settings.security?.password) {
        const { hash, salt } = hashPassword('root');
        settings.security = { ...settings.security, password: hash, passwordSalt: salt };
      }
      await settings.save();

      const pwHash = settings.security?.password;
      const pwSalt = settings.security?.passwordSalt;
      if (!verifyPassword(password, pwHash, pwSalt)) {
        return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
      }

      const token = generateSessionToken();
      settings.security = { ...settings.security, session: token };
      await settings.save();

      const res = NextResponse.json({ success: true, token, isRoot: true, username: 'root' });
      res.cookies.set('admin_session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
      return res;
    }

    // Account login
    const account = await Account.findOne({ username });
    if (!account) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 401 });
    }

    if (!verifyPassword(password, account.password, account.passwordSalt)) {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }

    const token = generateSessionToken();
    account.session = token;
    await account.save();

    const res = NextResponse.json({ success: true, token, isRoot: false, accountId: account._id.toString(), username: account.username });
    res.cookies.set('admin_session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    return res;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const token = getAdminToken(req);
    await connectDB();

    if (token) {
      // Clear root session
      const settings = await Settings.findOne({});
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
    res.cookies.set('admin_session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
    return res;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
