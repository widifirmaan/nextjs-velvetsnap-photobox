// File: src/lib/types.ts
// Description: Auto-added top comment for easier file identification.

export interface ISlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ElementProps {
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
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
  searchBg?: boolean;
  letterSpacing?: number;
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
  props: ElementProps;
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

export interface TemplateData {
  templateId: string;
  _id?: string;
  templateName: string;
  templateDesc: string;
  templatePrice: number;
  templateFull?: string;
  templateThumb?: string;
  templateData: ITemplateData;
  isActive?: boolean;
}

export interface StripResult {
  _id: string;
  sessionId: string;
  finalImage: string;
}

export interface PhotoAdjust {
  scale: number;
  x: number;
  y: number;
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
}

export const DEFAULT_ADJUST: PhotoAdjust = {
  scale: 1,
  x: 0,
  y: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  temperature: 0,
};

export const STEP_LABELS = ['Template', 'Photo', 'Edit', 'Pay', 'Cetak'];

export const TEMPLATE_CONFIGS: Record<string, { name: string; slots: number }> = {
  newspaper: { name: 'Newspaper', slots: 4 },
  classic: { name: 'Classic', slots: 3 },
  polaroid: { name: 'Polaroid', slots: 2 },
  t1: { name: 'Classic Strips', slots: 3 },
  t2: { name: 'Retro Film', slots: 4 },
  t3: { name: 'Newspaper', slots: 1 },
};

export const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80',
];
