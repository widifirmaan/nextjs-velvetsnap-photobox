// File: src/app/api/transactions/migrate-images/route.ts
// Description: Auto-added top comment for easier file identification.

import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Transaction from '@/models/Transaction';
import { uploadBase64, uploadBase64Array, isBase64 } from '@/lib/utils/cloudinary';
import { apiError } from '@/lib/utils/api-utils';
import { buildAccountFilter } from '@/lib/utils/require-admin';

async function runMigration(accountFilter: Record<string, unknown>) {
  await connectDB();

  const allTxs = await Transaction.find(accountFilter).lean();
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

export async function GET(req: Request) {
  try {
    const accountFilter = await buildAccountFilter(req);
    const result = await runMigration(accountFilter);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const accountFilter = await buildAccountFilter(req);
    const result = await runMigration(accountFilter);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    return apiError(error);
  }
}
