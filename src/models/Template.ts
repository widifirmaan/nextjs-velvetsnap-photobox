import mongoose, { Schema, Document } from 'mongoose';

export interface ISlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface IStripElement {
  id: string;
  type: 'photo-slot' | 'text' | 'sticker' | 'shape' | 'background';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  visible: boolean;
  props: {
    shape?: 'rectangle' | 'rounded' | 'circle' | 'heart' | 'star' | 'diamond' | 'polaroid' | 'hexagon';
    shapeType?: 'rect' | 'circle' | 'ellipse' | 'star' | 'line';
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    content?: string;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontStyle?: 'normal' | 'italic';
    stickerUrl?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    opacity?: number;
    searchBg?: boolean;
    letterSpacing?: number;
  };
}

export interface ITemplateData {
  elements: IStripElement[];
  slotsLayout: ISlot[];
  canvasWidth: number;
  canvasHeight: number;
  color: string;
  type: 'frame' | 'strip';
  slots: number;
}

export interface ITemplate extends Document {
  templateId: string;
  templateName: string;
  templateDesc: string;
  templatePrice: number;
  templateFull?: string;
  templateThumb?: string;
  templateData: ITemplateData;
  isActive: boolean;
  accountId?: string | null;
}

const StripElementSchema = new Schema<IStripElement>({
  id: { type: String, required: true },
  type: { type: String, enum: ['photo-slot', 'text', 'sticker', 'shape', 'background'], required: true },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  width: { type: Number, default: 20 },
  height: { type: Number, default: 20 },
  rotation: { type: Number, default: 0 },
  zIndex: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
  props: { type: Schema.Types.Mixed, default: {} }
}, { _id: false });

const TemplateDataSchema = new Schema<ITemplateData>({
  elements: [StripElementSchema],
  slotsLayout: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true }
  }],
  canvasWidth: { type: Number, default: 1000 },
  canvasHeight: { type: Number, default: 3000 },
  color: { type: String, default: '#007aff' },
  type: { type: String, enum: ['frame', 'strip'], default: 'frame' },
  slots: { type: Number, default: 1 },
}, { _id: false });

const TemplateSchema = new Schema<any>({
  templateId: { type: String, required: true, unique: true },
  templateName: { type: String, required: true },
  templateDesc: { type: String, default: '' },
  templatePrice: { type: Number, required: true },
  templateFull: { type: String },
  templateThumb: { type: String },
  templateData: { type: TemplateDataSchema, default: () => ({}) },
  isActive: { type: Boolean, default: true },
  accountId: { type: String, default: null, index: true },

  // Legacy flat fields — kept for backward compat with existing DB docs
  name: { type: String },
  description: { type: String },
  price: { type: Number },
  fullresUrl: { type: String },
  thumbUrl: { type: String },
  elements: [StripElementSchema],
  slotsLayout: [{ x: Number, y: Number, w: Number, h: Number }],
  canvasWidth: { type: Number },
  canvasHeight: { type: Number },
  color: { type: String },
  type: { type: String, enum: ['frame', 'strip'] },
  slots: { type: Number },
}, { timestamps: true });

TemplateSchema.index({ createdAt: -1 });

export default mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);
