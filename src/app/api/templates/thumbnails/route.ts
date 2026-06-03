import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import { Jimp } from 'jimp';
import { isBase64, getOptimizedUrl } from '@/lib/cloudinary';

export async function GET() {
  try {
    await connectDB();
    const templates = await Template.find({});

    const data = await Promise.all(templates.map(async (t) => {
      const obj = t.toObject();
      if (obj.frameImage) {
        if (isBase64(obj.frameImage)) {
          try {
            const base64Data = obj.frameImage.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const image = await Jimp.read(buffer);
            image.resize({ w: 280 });
            const thumb = await image.getBuffer('image/jpeg', { quality: 70 });
            obj.frameImage = `data:image/jpeg;base64,${thumb.toString('base64')}`;
          } catch (e) {
            console.error('Thumbnail generation failed:', e);
          }
        } else {
          obj.frameImage = getOptimizedUrl(obj.frameImage, 280);
        }
      }
      return {
        _id: obj._id,
        templateId: obj.templateId,
        name: obj.name,
        description: obj.description,
        slots: obj.slots,
        price: obj.price,
        color: obj.color,
        isActive: obj.isActive,
        frameImage: obj.frameImage,
        slotsLayout: obj.slotsLayout,
      };
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
