import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { uploadBase64, uploadBase64Array, isBase64 } from '@/lib/cloudinary';

async function runMigration() {
  await connectDB();

  const allTxs = await Transaction.find({}).lean();
  let migratedCount = 0;
  let failedCount = 0;

  for (const tx of allTxs) {
    const updates: Record<string, any> = {};
    let dirty = false;

    if (tx.finalImage && isBase64(tx.finalImage)) {
      try {
        const url = await uploadBase64(tx.finalImage, 'velvetsnap/final');
        updates.finalImage = url;
        dirty = true;
      } catch {
        failedCount++;
      }
    }

    if (tx.captures?.length) {
      const b64Indices: number[] = [];
      tx.captures.forEach((c: string, i: number) => {
        if (isBase64(c)) b64Indices.push(i);
      });
      if (b64Indices.length) {
        try {
          const b64Items = b64Indices.map((i) => tx.captures[i]);
          const urls = await uploadBase64Array(b64Items, 'velvetsnap/captures');
          const newCaptures = [...tx.captures];
          b64Indices.forEach((i, idx) => { newCaptures[i] = urls[idx]; });
          updates.captures = newCaptures;
          dirty = true;
        } catch {
          failedCount++;
        }
      }
    }

    if (dirty) {
      await Transaction.updateOne({ _id: tx._id }, { $set: updates });
      migratedCount++;
    }
  }

  return { migrated: migratedCount, failed: failedCount, total: allTxs.length };
}

export async function GET() {
  try {
    const result = await runMigration();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await runMigration();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
