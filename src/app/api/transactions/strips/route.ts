import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { Jimp } from 'jimp';

export async function GET() {
  try {
    await connectDB();
    const transactions = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(9)
      .lean();

    const data = await Promise.all(transactions.map(async (t) => {
      const obj: any = { ...t };
      if (obj.finalImage) {
        try {
          const base64Data = obj.finalImage.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const image = await Jimp.read(buffer);
          image.resize({ h: 360 });
          const thumb = await image.getBuffer('image/jpeg', { quality: 70 });
          obj.finalImage = `data:image/jpeg;base64,${thumb.toString('base64')}`;
        } catch (e) {
          console.error('Strip thumbnail failed:', e);
        }
      }
      return obj;
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
