import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';

const SENSITIVE_PATHS = ['security.password', 'security.passwordSalt', 'security.session', 'security.sessionExpires'];
const SENSITIVE_FLAT = ['adminPassword', 'adminPasswordSalt', 'adminSession', 'adminSessionExpires'];
const DEAD_FLAT = ['fontFamily', 'headingFontFamily', 'headingFontSize', 'bodyFontSize', 'textAlign', '__v'];

const OLD_FLAT_TO_NESTED: Record<string, [string, string]> = {
  headerLocation: ['header', 'location'],
  headerNavItems: ['header', 'navItems'],
  footerText: ['footer', 'text'],
  primaryColor: ['system', 'primaryColor'],
  accentColor: ['system', 'accentColor'],
  showPreloader: ['system', 'showPreloader'],
  showStrips: ['system', 'showStrips'],
  slideshowInterval: ['system', 'slideshowInterval'],
  sessionTimer: ['system', 'sessionTimer'],
  adminPassword: ['security', 'password'],
  adminPasswordSalt: ['security', 'passwordSalt'],
  adminSession: ['security', 'session'],
  adminSessionExpires: ['security', 'sessionExpires'],
};

function cleanDoc(doc: Record<string, any>) {
  const cleaned = { ...doc };
  for (const flat of SENSITIVE_FLAT) delete cleaned[flat];
  for (const flat of DEAD_FLAT) delete cleaned[flat];
  for (const path of SENSITIVE_PATHS) {
    const parts = path.split('.');
    if (parts.length === 2 && cleaned[parts[0]]) delete cleaned[parts[0]][parts[1]];
  }
  for (const [flat, [parent, child]] of Object.entries(OLD_FLAT_TO_NESTED)) {
    if (flat in cleaned) {
      if (!cleaned[parent]) cleaned[parent] = {};
      if (!(child in cleaned[parent])) cleaned[parent][child] = cleaned[flat];
      delete cleaned[flat];
    }
  }
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
  try {
    const doc = await getOrCreate();
    return NextResponse.json({ success: true, data: cleanDoc(doc) }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    for (const path of SENSITIVE_PATHS) {
      const parts = path.split('.');
      if (parts.length === 2 && body[parts[0]]) delete body[parts[0]][parts[1]];
    }

    const $set: Record<string, any> = {};
    for (const [key, val] of Object.entries(body)) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        for (const [subKey, subVal] of Object.entries(val as Record<string, any>)) {
          $set[`${key}.${subKey}`] = subVal;
        }
      } else {
        $set[key] = val;
      }
    }

    await Settings.collection.updateOne({}, { $set }, { upsert: true });
    const doc = await Settings.collection.findOne({});
    return NextResponse.json({ success: true, data: cleanDoc(doc as any) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
