const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const coll = db.collection('templates');

  const docs = await coll.find({}).toArray();
  console.log(`Found ${docs.length} templates`);

  let migrated = 0;
  let skipped = 0;

  for (const doc of docs) {
    if (doc.templateName || doc.templateData) {
      skipped++;
      continue;
    }

    const update = {
      $set: {
        templateName: doc.name || '',
        templateDesc: doc.description || '',
        templatePrice: doc.price ?? 0,
        templateFull: doc.fullresUrl || doc.frameImage || '',
        templateThumb: doc.thumbUrl || doc.thumbnail || '',
        templateData: {
          elements: doc.elements || [],
          slotsLayout: doc.slotsLayout || [],
          canvasWidth: doc.canvasWidth || 1000,
          canvasHeight: doc.canvasHeight || 3000,
          color: doc.color || '#ffffff',
          type: doc.type || 'frame',
          slots: doc.slots ?? 1,
        },
      },
    };

    await coll.updateOne({ _id: doc._id }, update);
    migrated++;
    if (migrated % 10 === 0) console.log(`  ${migrated} migrated...`);
  }

  console.log(`\nDone: ${migrated} migrated, ${skipped} skipped`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
