import type { ISlot, IStripElement } from '@/lib/canvas-utils';

export interface TemplateData {
  _id: string;
  templateId: string;
  name: string;
  description: string;
  slots: number;
  price: number;
  color: string;
  isActive: boolean;
  fullresUrl?: string;
  slotsLayout?: ISlot[];
  thumbUrl?: string;
  type?: 'frame' | 'strip';
  canvasWidth?: number;
  canvasHeight?: number;
  elements?: IStripElement[];
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
  t1: { name: 'Classic Strips', slots: 3 },
  t2: { name: 'Retro Film', slots: 4 },
  t3: { name: 'Newspaper', slots: 1 },
};

export const STEP_LABELS = ['Template', 'Photo', 'Edit', 'Pay', 'Cetak'];
