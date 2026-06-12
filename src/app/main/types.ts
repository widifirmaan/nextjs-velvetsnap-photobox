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
  props: Record<string, any>;
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

export const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80',
];

export const TEMPLATE_CONFIGS: Record<string, { name: string; slots: number }> = {
  'newspaper': { name: 'Newspaper', slots: 4 },
  'classic': { name: 'Classic', slots: 3 },
  'polaroid': { name: 'Polaroid', slots: 2 },
};

export const STEP_LABELS = ['Template', 'Photo', 'Edit', 'Pay', 'Cetak'];
