/**
 * Migration script: upload existing base64 images from MongoDB to Cloudinary.
 *
 * Usage:
 *   npx tsx scripts/migrate-cloudinary.ts
 */
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^"|"$/g, '');
  process.env[key] = val;
}

// Parse CLOUDINARY_URL: cloudinary://api_key:api_secret@cloud_name
const cu = process.env.CLOUDINARY_URL || '';
const m = cu.match(/cloudinary:\/\/(\w+):([\w-]+)@(\w+)/);
if (m) {
  cloudinary.config({
    cloud_name: m[3],
    api_key: m[1],
    api_secret: m[2],
    secure: true,
  });
} else {
  console.error('Invalid CLOUDINARY_URL. Ensure .env contains CLOUDINARY_URL.');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is required');
  process.exit(1);
}

cloudinary.config({
  secure: true,
});

// Schema definitions (inline to avoid import issues with standalone script)
const TransactionSchema = new mongoose.Schema({
  sessionId: String,
  templateId: String,
  price: Number,
  status: { type: String, default: 'PENDING' },
  captures: [String],
  finalImage: { type: String, default: '' },
}, { timestamps: true });

const StripElementSchema = new mongoose.Schema({
  id: String,
  type: { type: String, enum: ['photo-slot', 'text', 'sticker', 'shape', 'background'] },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  width: { type: Number, default: 20 },
  height: { type: Number, default: 20 },
  rotation: { type: Number, default: 0 },
  zIndex: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
  props: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false });

const TemplateSchema = new mongoose.Schema({
  templateId: { type: String, required: true, unique: true },
  name: String,
  description: String,
  slots: { type: Number, default: 3 },
  price: Number,
  color: { type: String, default: '#007aff' },
  isActive: { type: Boolean, default: true },
  type: { type: String, enum: ['frame', 'strip'], default: 'frame' },
  frameImage: String,
  slotsLayout: [{ x: Number, y: Number, w: Number, h: Number }],
  canvasWidth: { type: Number, default: 600 },
  canvasHeight: { type: Number, default: 900 },
  elements: [StripElementSchema],
  thumbnail: String,
}, { timestamps: true });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
const Template = mongoose.models.Template || mongoose.model('Template', TemplateSchema);

function isBase64(str: string): boolean {
  return typeof str === 'string' && str.startsWith('data:');
}

async function upload(dataUri: string, folder: string): Promise<string> {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
  });
  return result.secure_url;
}

async function migrateTransactions(): Promise<number> {
  const txs = await Transaction.find({}).lean();
  let count = 0;

  for (const tx of txs) {
    const updates: Record<string, any> = {};
    let needsUpdate = false;

    if (tx.finalImage && isBase64(tx.finalImage)) {
      try {
        const url = await upload(tx.finalImage, 'velvetsnap/final');
        updates.finalImage = url;
        needsUpdate = true;
        console.log(`  [tx ${tx.sessionId}] finalImage uploaded`);
      } catch (e) {
        console.error(`  [tx ${tx.sessionId}] finalImage failed:`, e);
      }
    }

    if (tx.captures?.length) {
      const urls: string[] = [];
      for (let i = 0; i < tx.captures.length; i++) {
        const cap = tx.captures[i];
        if (isBase64(cap)) {
          try {
            const url = await upload(cap, 'velvetsnap/captures');
            urls.push(url);
          } catch (e) {
            console.error(`  [tx ${tx.sessionId}] capture[${i}] failed:`, e);
            urls.push(cap);
          }
        } else {
          urls.push(cap);
        }
      }
      if (urls.some((u, i) => u !== tx.captures[i])) {
        updates.captures = urls;
        needsUpdate = true;
        console.log(`  [tx ${tx.sessionId}] captures uploaded`);
      }
    }

    if (needsUpdate) {
      await Transaction.updateOne({ _id: tx._id }, { $set: updates });
      count++;
    }
  }

  return count;
}

async function migrateTemplates(): Promise<number> {
  const tmpls = await Template.find({}).lean();
  let count = 0;

  for (const tmpl of tmpls) {
    const updates: Record<string, any> = {};
    let needsUpdate = false;

    if (tmpl.frameImage && isBase64(tmpl.frameImage)) {
      try {
        const url = await upload(tmpl.frameImage, 'velvetsnap/templates');
        updates.frameImage = url;
        needsUpdate = true;
        console.log(`  [template ${tmpl.templateId}] frameImage uploaded`);
      } catch (e) {
        console.error(`  [template ${tmpl.templateId}] frameImage failed:`, e);
      }
    }

    if (tmpl.thumbnail && isBase64(tmpl.thumbnail)) {
      try {
        const url = await upload(tmpl.thumbnail, 'velvetsnap/templates');
        updates.thumbnail = url;
        needsUpdate = true;
        console.log(`  [template ${tmpl.templateId}] thumbnail uploaded`);
      } catch (e) {
        console.error(`  [template ${tmpl.templateId}] thumbnail failed:`, e);
      }
    }

    if (needsUpdate) {
      await Template.updateOne({ _id: tmpl._id }, { $set: updates });
      count++;
    }
  }

  return count;
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.\n');

  console.log('Migrating transactions...');
  const txCount = await migrateTransactions();
  console.log(`  Done: ${txCount} transactions updated.\n`);

  console.log('Migrating templates...');
  const tmplCount = await migrateTemplates();
  console.log(`  Done: ${tmplCount} templates updated.\n`);

  console.log('Migration complete.');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
