import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import Account from '@/models/Account';
import { getSession } from '@/lib/require-admin';
import { apiError } from '@/lib/api-utils';

const SENSITIVE_PATHS = ['security.password', 'security.passwordSalt', 'security.session'];
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

function mapAccountSettings(account: any) {
  const s = account.settings || {};
  return {
    appName: s.appName || 'VelvetSnap',
    appTagline: s.appTagline || 'AI-Powered Photobooth Experience',
    heroSubtitle: s.heroSubtitle || 'Pilih frame, foto, edit, dan dapatkan hasil cetakan berkualitas tinggi dalam hitungan menit',
    logo: s.logo || '',
    cardSmallHtml: s.cardSmallHtml || '',
    cardPromoHtml: s.cardPromoHtml || '',
    slideshowImages: Array.isArray(s.slideshowImages) ? s.slideshowImages : [],
    header: {
      location: s.header?.location || 'Jakarta',
      navItems: s.header?.navItems || '[{"label":"Instagram","url":"https://instagram.com"},{"label":"WhatsApp","url":"https://wa.me/628123456789"},{"label":"Templates","url":"/templates"},{"label":"Studio","url":"/strips-studio"}]',
    },
    footer: {
      text: s.footer?.text || 'VelvetSnap Photobooth Platform',
    },
    system: {
      primaryColor: s.system?.primaryColor || '#262626',
      accentColor: s.system?.accentColor || '#C5D89D',
      showPreloader: s.system?.showPreloader ?? true,
      showStrips: s.system?.showStrips ?? true,
      slideshowInterval: s.system?.slideshowInterval || 3000,
      sessionTimer: s.system?.sessionTimer ?? 600,
    },
    uiTheme: s.uiTheme || 'v1',
  };
}

async function getOrCreateRoot() {
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
    await connectDB();
    const { searchParams } = new URL(req.url);
    const session = await getSession(req);

    // Explicit accountId query param overrides session
    const qAccountId = searchParams.get('accountId');
    if (qAccountId || (session.accountId && !session.isRoot)) {
      const accountId = qAccountId || session.accountId;
      const account = await Account.findById(accountId).lean();
      if (account) {
        return NextResponse.json({ success: true, data: mapAccountSettings(account) }, {
          headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
        });
      }
    }

    // Root or public → return root settings
    const doc = await getOrCreateRoot(); // connectDB already called above
    return NextResponse.json({ success: true, data: cleanDoc(doc) }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error: unknown) {
    return apiError(error);
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const session = await getSession(req);

    // Account user → save to account settings
    if (session.accountId && !session.isRoot) {
      const body = await req.json();
      const $set: Record<string, any> = {};
      for (const [key, val] of Object.entries(body)) {
        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
          for (const [subKey, subVal] of Object.entries(val as Record<string, any>)) {
            $set[`settings.${key}.${subKey}`] = subVal;
          }
        } else {
          $set[`settings.${key}`] = val;
        }
      }
      const account = await Account.findByIdAndUpdate(session.accountId, { $set }, { new: true }).lean();
      return NextResponse.json({ success: true, data: mapAccountSettings(account) });
    }

    // Root → save to root settings (existing behavior)
    // connectDB already called above
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
    const doc = await Settings.collection.findOneAndUpdate({}, { $set }, { upsert: true, returnDocument: 'after' });
    return NextResponse.json({ success: true, data: cleanDoc(doc as any) });
  } catch (error: unknown) {
    return apiError(error);
  }
}
