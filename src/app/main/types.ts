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

export const TEMPLATE_CONFIGS: Record<string, { name: string; slots: number }> = {
  'newspaper': { name: 'Newspaper', slots: 4 },
  'classic': { name: 'Classic', slots: 3 },
  'polaroid': { name: 'Polaroid', slots: 2 },
};
