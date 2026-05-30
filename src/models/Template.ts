import mongoose, { Schema, Document } from 'mongoose';

export interface ISlot {
  x: number;  // relative x percentage (0 - 100)
  y: number;  // relative y percentage (0 - 100)
  w: number;  // relative width percentage (0 - 100)
  h: number;  // relative height percentage (0 - 100)
}

export interface ITemplate extends Document {
  templateId: string;
  name: string;
  description: string;
  slots: number;
  price: number;
  color: string;
  isActive: boolean;
  frameImage?: string;
  slotsLayout?: ISlot[];
}

const TemplateSchema = new Schema<ITemplate>({
  templateId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  slots: { type: Number, required: true, default: 3 },
  price: { type: Number, required: true },
  color: { type: String, default: '#007aff' },
  isActive: { type: Boolean, default: true },
  frameImage: { type: String },
  slotsLayout: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true }
  }]
}, { timestamps: true });

export default mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);

