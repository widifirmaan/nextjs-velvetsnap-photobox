import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const template = await Template.findOne({ templateId: id });
      if (!template) {
        return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
      }
      const obj = template.toObject();
      return NextResponse.json({
        success: true,
        data: [{
          _id: obj._id, templateId: obj.templateId, name: obj.name,
          description: obj.description, slots: obj.slots, price: obj.price,
          color: obj.color, isActive: obj.isActive,
          fullresUrl: obj.fullresUrl || obj.frameImage, slotsLayout: obj.slotsLayout,
          thumbUrl: obj.thumbUrl || obj.thumbnail, type: obj.type,
          canvasWidth: obj.canvasWidth, canvasHeight: obj.canvasHeight,
          elements: obj.elements,
        }],
      });
    }

    const templates = await Template.find({});
    const data = templates.map((t) => {
      const obj = t.toObject();
      return {
        _id: obj._id, templateId: obj.templateId, name: obj.name,
        description: obj.description, slots: obj.slots, price: obj.price,
        color: obj.color, isActive: obj.isActive,
        fullresUrl: obj.fullresUrl || obj.frameImage, slotsLayout: obj.slotsLayout,
        thumbUrl: obj.thumbUrl || obj.thumbnail, type: obj.type,
        canvasWidth: obj.canvasWidth, canvasHeight: obj.canvasHeight,
        elements: obj.elements,
      };
    });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
