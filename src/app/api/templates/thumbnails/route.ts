import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Template from '@/models/Template';
import mongoose from 'mongoose';
import { normalizeTemplate } from '@/lib/normalize-template';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ _id: id }, { templateId: id }] }
        : { templateId: id };
      const template = await Template.findOne(query)
        .select('templateId templateName templateDesc templatePrice templateFull templateThumb templateData isActive')
        .lean();
      if (!template) {
        return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: [normalizeTemplate(template)],
      }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
    }

    const templates = await Template.find({})
      .select('templateId templateName templateDesc templatePrice templateThumb templateData templateFull isActive')
      .lean();
    const data = templates.map(normalizeTemplate);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
