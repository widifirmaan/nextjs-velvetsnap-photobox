import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { requireAdmin } from '@/lib/require-admin';

const SENSITIVE_FIELDS = ['adminPassword', 'adminPasswordSalt', 'adminSession', 'adminSessionExpires'];

function stripSensitive(doc: Record<string, any>) {
  const cleaned = { ...doc };
  for (const field of SENSITIVE_FIELDS) delete cleaned[field];
  return cleaned;
}

async function getOrCreate() {
  await connectDB();
  let doc = await Settings.findOne({}).lean();
  if (!doc) {
    doc = await Settings.create({});
    doc = doc.toObject();
  }
  return doc;
}

export async function GET(req: Request) {
  const u = await requireAdmin(req);
  if (u) return u;
  try {
    const doc = await getOrCreate();
    return NextResponse.json({ success: true, data: stripSensitive(doc) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const u = await requireAdmin(req);
  if (u) return u;
  try {
    await connectDB();
    const body = await req.json();
    for (const field of SENSITIVE_FIELDS) delete body[field];
    const doc = await Settings.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true }
    ).lean();
    return NextResponse.json({ success: true, data: stripSensitive(doc) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
