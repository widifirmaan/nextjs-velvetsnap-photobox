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
