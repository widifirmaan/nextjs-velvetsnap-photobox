import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import { getOptimizedUrl } from '@/lib/cloudinary';

export async function GET() {
  try {
    await connectDB();
    const templates = await Template.find({});

    const data = templates.map((t) => {
      const obj = t.toObject();
      if (obj.frameImage) {
        obj.frameImage = getOptimizedUrl(obj.frameImage, 280);
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
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
