'use client';

import { useRef, useLayoutEffect, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Transformer, Rect, Circle, Text, Group, Image as KonvaImage, Ellipse, Star, Line, Path } from 'react-konva';
import Konva from 'konva';
import type { IStripElement } from '@/models/Template';
import { useImage } from './useImage';
import { createSlotShapeNodes, type SlotShape } from '@/lib/shapes';

const SNAP_THRESHOLD = 6;
const GUIDE_WIDTH = 1;
const GRID_STEP = 10;

const snapToGrid = (v: number) => Math.round(v / GRID_STEP) * GRID_STEP;

interface GuideLine {
  x1: number; y1: number; x2: number; y2: number;
}

interface Bounds {
  left: number; right: number; centerX: number;
  top: number; bottom: number; centerY: number;
}

interface EditorCanvasProps {
  elements: IStripElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, patch: Partial<IStripElement>) => void;
  canvasSize: { w: number; h: number };
  canvasBg: string;
}

function getBounds(el: IStripElement): Bounds {
  return {
    left: el.x,
    right: el.x + el.width,
    centerX: el.x + el.width / 2,
    top: el.y,
    bottom: el.y + el.height,
    centerY: el.y + el.height / 2,
  };
}

interface SnapResult {
  guides: GuideLine[];
  snapX: number | null;
  snapY: number | null;
}

function computeGuides(
  b: Bounds,
  others: IStripElement[],
  cw: number, ch: number,
  elW: number, elH: number
): SnapResult {
  const guides: GuideLine[] = [];
  let snapX: number | null = null;
  let snapY: number | null = null;
  let bestDistX = SNAP_THRESHOLD;
  let bestDistY = SNAP_THRESHOLD;


  const canvasTargets: Bounds[] = [
    { left: 0, right: cw, centerX: cw / 2, top: 0, bottom: ch, centerY: ch / 2 },
  ];

  const elemTargets = others.filter(e => e.visible).map(getBounds);
  const targets = [...canvasTargets, ...elemTargets];

  for (const t of targets) {
    const checks: { bPos: number; tPos: number; offset: number; kind: 'x' | 'y' }[] = [
      { bPos: b.left, tPos: t.left, offset: 0, kind: 'x' },
      { bPos: b.left, tPos: t.right, offset: 0, kind: 'x' },
      { bPos: b.left, tPos: t.centerX, offset: 0, kind: 'x' },
      { bPos: b.right, tPos: t.left, offset: -elW, kind: 'x' },
      { bPos: b.right, tPos: t.right, offset: -elW, kind: 'x' },
      { bPos: b.right, tPos: t.centerX, offset: -elW, kind: 'x' },
      { bPos: b.centerX, tPos: t.left, offset: -elW / 2, kind: 'x' },
      { bPos: b.centerX, tPos: t.right, offset: -elW / 2, kind: 'x' },
      { bPos: b.centerX, tPos: t.centerX, offset: -elW / 2, kind: 'x' },
      { bPos: b.top, tPos: t.top, offset: 0, kind: 'y' },
      { bPos: b.top, tPos: t.bottom, offset: 0, kind: 'y' },
      { bPos: b.top, tPos: t.centerY, offset: 0, kind: 'y' },
      { bPos: b.bottom, tPos: t.top, offset: -elH, kind: 'y' },
      { bPos: b.bottom, tPos: t.bottom, offset: -elH, kind: 'y' },
      { bPos: b.bottom, tPos: t.centerY, offset: -elH, kind: 'y' },
      { bPos: b.centerY, tPos: t.top, offset: -elH / 2, kind: 'y' },
      { bPos: b.centerY, tPos: t.bottom, offset: -elH / 2, kind: 'y' },
      { bPos: b.centerY, tPos: t.centerY, offset: -elH / 2, kind: 'y' },
    ];

    for (const c of checks) {
      const dist = Math.abs(c.bPos - c.tPos);
      if (c.kind === 'x' && dist < bestDistX) {
        bestDistX = dist;
        snapX = c.tPos + c.offset;
        const y1 = Math.min(b.top, t.top);
        const y2 = Math.max(b.bottom, t.bottom);
        guides.push({ x1: c.tPos, y1, x2: c.tPos, y2 });
      }
      if (c.kind === 'y' && dist < bestDistY) {
        bestDistY = dist;
        snapY = c.tPos + c.offset;
        const x1 = Math.min(b.left, t.left);
        const x2 = Math.max(b.right, t.right);
        guides.push({ x1, y1: c.tPos, x2, y2: c.tPos });
      }
    }
  }

  return { guides, snapX, snapY };
}

export interface EditorCanvasHandle {
  getThumbnail: () => string;
  getFrameImage: () => string;
}

const EditorCanvas = forwardRef<EditorCanvasHandle, EditorCanvasProps>(function EditorCanvas({ elements, selectedId, onSelect, onUpdate, canvasSize, canvasBg }, ref) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const guideLayerRef = useRef<Konva.Layer>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const [scale, setScale] = useState(0);
  const accentRef = useRef('#C5D89D');

  useEffect(() => {
    accentRef.current = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#C5D89D';
  }, []);

  useImperativeHandle(ref, () => ({
    getThumbnail: () => stageRef.current?.toDataURL({ mimeType: 'image/png', pixelRatio: 0.3 }) || '',
    getFrameImage: () => {
      const stage = stageRef.current;
      if (!stage) return '';
      if (trRef.current) trRef.current.nodes([]);
      const groups = (stage as any).find('.photo-slot-group');
      const bgs = (stage as any).find('.bg-element');
      const saved: { node: any; visible: boolean }[] = [];
      groups.forEach((g: any) => {
        g.getChildren().forEach((child: any) => {
          saved.push({ node: child, visible: child.visible() });
          child.visible(false);
        });
      });
      bgs.forEach((g: any) => {
        saved.push({ node: g, visible: g.visible() });
        g.visible(false);
      });
      stage.batchDraw();
      const pr = scale > 0 ? 1 / scale : 1;
      const url = stage.toDataURL({ mimeType: 'image/png', pixelRatio: pr });
      saved.forEach(({ node, visible }) => { node.visible(visible); });
      stage.batchDraw();
      return url;
    },
  }), [scale]);

  useLayoutEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;
    const update = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const s = Math.min(1, (w - 8) / canvasSize.w, (h - 8) / canvasSize.h);
      if (s > 0) setScale(s);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [canvasSize]);

  useEffect(() => {
    if (!trRef.current || !layerRef.current) return;
    const el = elements.find(e => e.id === selectedId);
    if (el?.type === 'background') {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
      return;
    }
    const selectedNode = layerRef.current.findOne(`#${selectedId}`);
    if (selectedNode) {
      trRef.current.nodes([selectedNode]);
      trRef.current.getLayer()?.batchDraw();
    } else {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, elements]);

  const clampBg = useCallback((el: IStripElement, newX: number, newY: number) => {
    if (el.type !== 'background') return { x: newX, y: newY };
    return {
      x: Math.min(0, Math.max(newX, canvasSize.w - el.width)),
      y: Math.min(0, Math.max(newY, canvasSize.h - el.height)),
    };
  }, [canvasSize]);

  const sorted = elements
    .filter((el) => el.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  const others = elements.filter(el => el.id !== selectedId);

  const handleDragEnd = useCallback((id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const el = elements.find(el => el.id === id);
    if (el?.type === 'background') {
      const { x, y } = clampBg(el, node.x(), node.y());
      node.x(x); node.y(y);
      onUpdate(id, { x, y });
    } else {
      onUpdate(id, { x: node.x(), y: node.y() });
    }
    setGuides([]);
    guideLayerRef.current?.batchDraw();
  }, [onUpdate, elements, clampBg]);

  const handleDragMove = useCallback((id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const el = elements.find(el => el.id === id);
    if (!el) return;

    if (el.type === 'background') {
      const { x, y } = clampBg(el, node.x(), node.y());
      node.x(x); node.y(y);
      setGuides([]);
      guideLayerRef.current?.batchDraw();
      return;
    }

    const b: Bounds = {
      left: node.x(),
      right: node.x() + el.width,
      centerX: node.x() + el.width / 2,
      top: node.y(),
      bottom: node.y() + el.height,
      centerY: node.y() + el.height / 2,
    };

    const { guides: g, snapX, snapY } = computeGuides(b, others, canvasSize.w, canvasSize.h, el.width, el.height);
    if (snapX !== null) node.x(snapX);
    if (snapY !== null) node.y(snapY);
    setGuides(g);
    guideLayerRef.current?.batchDraw();
  }, [elements, others, canvasSize, clampBg]);

  const handleTransformMove = useCallback((e: Konva.KonvaEventObject<Event>) => {
    if (!selectedId) return;
    const node = trRef.current?.nodes()?.[0];
    if (!node) return;
    const el = elements.find(el => el.id === selectedId);
    if (!el) return;

    const bx = node.x();
    const by = node.y();
    const bw = node.width() * node.scaleX();
    const bh = node.height() * node.scaleY();

    const b: Bounds = {
      left: bx, right: bx + bw, centerX: bx + bw / 2,
      top: by, bottom: by + bh, centerY: by + bh / 2,
    };

    const { guides: g } = computeGuides(b, others, canvasSize.w, canvasSize.h, bw, bh);
    setGuides(g);
    guideLayerRef.current?.batchDraw();
  }, [selectedId, elements, others, canvasSize]);

  const handleTransformEnd = useCallback((id: string, e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    let w = Math.max(10, node.width() * scaleX);
    let h = Math.max(10, node.height() * scaleY);
    let x = node.x();
    let y = node.y();
    const el = elements.find(el => el.id === id);
    if (el?.type === 'background') {
      w = Math.max(w, canvasSize.w);
      h = Math.max(h, canvasSize.h);
      const clamped = clampBg({ ...el, width: w, height: h }, x, y);
      x = clamped.x; y = clamped.y;
    }
    onUpdate(id, { x, y, width: w, height: h, rotation: node.rotation() });
    setGuides([]);
    guideLayerRef.current?.batchDraw();
  }, [onUpdate, canvasSize, elements, clampBg]);

  return (
    <div ref={containerRef}>
        <Stage
      ref={stageRef}
      width={canvasSize.w * scale}
      height={canvasSize.h * scale}
      scaleX={scale}
      scaleY={scale}
      style={{
        background: canvasBg,
        border: '1px solid #000',
      }}
      onClick={(e) => {
        if (e.target === e.target.getStage()) { onSelect(null); setGuides([]); }
      }}
    >
      <Layer listening={false}>
        {Array.from({ length: Math.ceil(canvasSize.w / GRID_STEP) + 1 }).map((_, i) => (
          <Line key={`gv${i}`} x={i * GRID_STEP} y={0} points={[0, 0, 0, canvasSize.h]} stroke="rgba(0,0,0,0.04)" strokeWidth={1} listening={false} />
        ))}
        {Array.from({ length: Math.ceil(canvasSize.h / GRID_STEP) + 1 }).map((_, i) => (
          <Line key={`gh${i}`} x={0} y={i * GRID_STEP} points={[0, 0, canvasSize.w, 0]} stroke="rgba(0,0,0,0.04)" strokeWidth={1} listening={false} />
        ))}
      </Layer>
      <Layer ref={layerRef}>
        <Rect x={0} y={0} width={canvasSize.w} height={canvasSize.h} fill={canvasBg} listening={false} />
        {sorted.map((el) => (
          <CanvasElement
            key={el.id}
            element={el}
            isSelected={el.id === selectedId}
            onSelect={() => onSelect(el.id)}
            onDragEnd={(e) => handleDragEnd(el.id, e)}
            onDragMove={(e) => handleDragMove(el.id, e)}
            onTransformEnd={(e) => handleTransformEnd(el.id, e)}
            accentColor={accentRef.current}
          />
        ))}
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) return oldBox;
            const el = elements.find(e => e.id === selectedId);
            if (el?.type === 'photo-slot') {
              newBox.x = snapToGrid(newBox.x);
              newBox.y = snapToGrid(newBox.y);
              newBox.width = snapToGrid(newBox.width);
              newBox.height = snapToGrid(newBox.height);
            }
            return newBox;
          }}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right']}
          borderStroke={accentRef.current}
          borderStrokeWidth={2}
          anchorFill="#fff"
          anchorStroke={accentRef.current}
          anchorSize={10}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          onTransform={handleTransformMove}
        />
      </Layer>
      <Layer ref={guideLayerRef} listening={false}>
        {guides.map((g, i) => (
          <Line
            key={i}
            x={0}
            y={0}
            points={[g.x1, g.y1, g.x2, g.y2]}
            stroke={accentRef.current}
            strokeWidth={GUIDE_WIDTH}
            dash={[4, 3]}
          />
        ))}
      </Layer>
      </Stage>
    </div>
  );
});

export default EditorCanvas;

function CanvasElement({
  element,
  isSelected,
  onSelect,
  onDragEnd,
  onDragMove,
  onTransformEnd,
  accentColor = '#C5D89D',
}: {
  element: IStripElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
  accentColor?: string;
}) {
  const p = element.props || {};
  const common = {
    id: element.id,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation,
    draggable: element.type === 'background' ? p.searchBg === true : true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd,
    onDragMove,
    onTransformEnd,
    opacity: p.opacity ?? 1,
  };

  const elCommon = element.type === 'photo-slot'
    ? { ...common, name: 'photo-slot-group' }
    : element.type === 'background'
      ? { ...common, name: 'bg-element', listening: p.searchBg !== true }
      : common;

  switch (element.type) {
    case 'photo-slot':
      return <PhotoSlotShape el={element} common={elCommon as any} />;
    case 'text':
      return (
        <Text
          {...common}
          text={p.content || 'Text'}
          fontSize={p.fontSize || 48}
          fontFamily={p.fontFamily || 'Inter'}
          fill={p.color || '#3d2c2c'}
          fontStyle={(p.fontWeight === '700' ? 'bold ' : '') + (p.fontStyle || 'normal')}
          align={p.textAlign || 'left'}
          verticalAlign="middle"
          letterSpacing={p.letterSpacing ?? 0}
          stroke={p.strokeColor || undefined}
          strokeWidth={p.strokeWidth ?? 0}
        />
      );
    case 'background':
      return <BgElement el={element} common={common} />;
    case 'sticker':
      return <StickerElement el={element} common={common} />;
    case 'shape': {
      const shape = p.shapeType || 'rect';
      const fill = p.fillColor || accentColor;
      const stroke = p.strokeColor || '#9CAB84';
      const sw = p.strokeWidth || 2;
      if (shape === 'circle') {
        const r = Math.min(element.width, element.height) / 2;
        return <Circle {...common} x={element.x + element.width / 2} y={element.y + element.height / 2} radius={r} fill={fill} stroke={stroke} strokeWidth={sw} />;
      }
      if (shape === 'ellipse') {
        return <Ellipse {...common} x={element.x + element.width / 2} y={element.y + element.height / 2} radiusX={element.width / 2} radiusY={element.height / 2} fill={fill} stroke={stroke} strokeWidth={sw} />;
      }
      if (shape === 'star') {
        return <Star {...common} x={element.x + element.width / 2} y={element.y + element.height / 2} numPoints={5} innerRadius={element.width * 0.2} outerRadius={Math.min(element.width, element.height) / 2} fill={fill} stroke={stroke} strokeWidth={sw} />;
      }
      if (shape === 'line') {
        return <Line {...common} x={element.x} y={element.y} points={[0, 0, element.width, element.height]} stroke={stroke} strokeWidth={sw} fill={fill} />;
      }
      return <Rect {...common} fill={fill} stroke={stroke} strokeWidth={sw} cornerRadius={4} />;
    }
    default:
      return <Rect {...common} fill="#ccc" />;
  }
}

function PhotoSlotShape({ el, common }: { el: IStripElement; common: any }) {
  const p = el.props || {};
  const shape = (p.shape || 'rounded') as SlotShape;
  const bw = p.borderWidth ?? 2;
  const bc = p.borderColor || '#ffffff';
  const br = p.borderRadius ?? 8;
  const fill = 'rgba(0, 191, 99, 0.12)';
  const slotIndex = (parseInt(el.id.replace('slot-', ''), 10) || 0) + 1;

  const nodes = createSlotShapeNodes(shape, el.width, el.height, fill, bc, bw, br, slotIndex);

  return <Group {...common}>{nodes}</Group>;
}

function BgElement({ el, common }: { el: IStripElement; common: any }) {
  const p = el.props || {};
  const [image] = useImage(p.stickerUrl || '');
  if (!image || !p.stickerUrl) return null;
  if (p.searchBg) {
    const imgW = image.width;
    const imgH = image.height;
    const scale = Math.max(el.width / imgW, el.height / imgH);
    const dispW = imgW * scale;
    const dispH = imgH * scale;
    const offsetX = (el.width - dispW) / 2;
    const offsetY = (el.height - dispH) / 2;
    return (
      <Group {...common}>
        <KonvaImage image={image} x={offsetX} y={offsetY} width={dispW} height={dispH} />
      </Group>
    );
  }
  return (
    <Group {...common}>
      <KonvaImage image={image} width={el.width} height={el.height} />
    </Group>
  );
}

function StickerElement({ el, common }: { el: IStripElement; common: any }) {
  const p = el.props || {};
  const [image] = useImage(p.stickerUrl || '');
  if (!image || !p.stickerUrl) {
    return (
      <Group {...common}>
        <Rect width={el.width} height={el.height} fill="rgba(200,200,200,0.3)" stroke="#999" strokeWidth={1} dash={[4, 4]} cornerRadius={8} />
        <Text x={4} y={el.height / 2 - 8} width={el.width - 8} text="Sticker" fontSize={12} fill="#999" align="center" />
      </Group>
    );
  }
  const imgW = image.width;
  const imgH = image.height;
  const scale = Math.min(el.width / imgW, el.height / imgH);
  const dispW = imgW * scale;
  const dispH = imgH * scale;
  const offsetX = (el.width - dispW) / 2;
  const offsetY = (el.height - dispH) / 2;
  return (
    <Group {...common}>
      <KonvaImage image={image} x={offsetX} y={offsetY} width={dispW} height={dispH} />
    </Group>
  );
}
