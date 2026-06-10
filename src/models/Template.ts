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

export interface ITemplate extends Document {
  templateId: string;
  name: string;
  description: string;
  slots: number;
  price: number;
  color: string;
  isActive: boolean;
  type: 'frame' | 'strip';
  frameImage?: string;
  slotsLayout?: ISlot[];
  canvasWidth?: number;
  canvasHeight?: number;
  elements?: IStripElement[];
  thumbnail?: string;
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

const TemplateSchema = new Schema<ITemplate>({
  templateId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  slots: { type: Number, required: true, default: 3 },
  price: { type: Number, required: true },
  color: { type: String, default: '#007aff' },
  isActive: { type: Boolean, default: true },
  type: { type: String, enum: ['frame', 'strip'], default: 'frame' },
  frameImage: { type: String },
  slotsLayout: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true }
  }],
  canvasWidth: { type: Number, default: 600 },
  canvasHeight: { type: Number, default: 900 },
  elements: [StripElementSchema],
  thumbnail: { type: String }
}, { timestamps: true });

export default mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);

