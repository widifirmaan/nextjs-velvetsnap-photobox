'use client';

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Transformer, Rect, Circle, Text, Group, Image as KonvaImage, Ellipse, Star, Line, Path } from 'react-konva';
import type Konva from 'konva';
import type { IStripElement } from '@/models/Template';
import { useImage } from './useImage';

const SNAP_THRESHOLD = 6;
const GUIDE_COLOR = '#C5D89D';
const GUIDE_WIDTH = 1;

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
}

const EditorCanvas = forwardRef<EditorCanvasHandle, EditorCanvasProps>(function EditorCanvas({ elements, selectedId, onSelect, onUpdate, canvasSize }, ref) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const guideLayerRef = useRef<Konva.Layer>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
        const s = Math.min(1, (w - 8) / canvasSize.w, (h - 8) / canvasSize.h);
      setScale(s);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [canvasSize.w, canvasSize.h]);

  useImperativeHandle(ref, () => ({
    getThumbnail: () => {
      return stageRef.current?.toDataURL({ mimeType: 'image/png', pixelRatio: 0.3 }) || '';
    },
  }), []);

  useEffect(() => {
    if (!trRef.current || !layerRef.current) return;
    const selectedNode = layerRef.current.findOne(`#${selectedId}`);
    if (selectedNode) {
      trRef.current.nodes([selectedNode]);
      trRef.current.getLayer()?.batchDraw();
    } else {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, elements]);

  const sorted = elements
    .filter((el) => el.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  const others = elements.filter(el => el.id !== selectedId);

  const handleDragEnd = useCallback((id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onUpdate(id, { x: node.x(), y: node.y() });
    setGuides([]);
    guideLayerRef.current?.batchDraw();
  }, [onUpdate]);

  const handleDragMove = useCallback((id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const el = elements.find(el => el.id === id);
    if (!el) return;

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
  }, [elements, others, canvasSize]);

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
    onUpdate(id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(10, node.width() * scaleX),
      height: Math.max(10, node.height() * scaleY),
      rotation: node.rotation(),
    });
    setGuides([]);
    guideLayerRef.current?.batchDraw();
  }, [onUpdate]);

  return (
    <div ref={containerRef}>
        <Stage
      ref={stageRef}
      width={canvasSize.w * scale}
      height={canvasSize.h * scale}
      scaleX={scale}
      scaleY={scale}
      style={{
        background: '#ffffff',
        border: '1px solid #000',
      }}
      onClick={(e) => {
        if (e.target === e.target.getStage()) { onSelect(null); setGuides([]); }
      }}
    >
      <Layer ref={layerRef}>
        {sorted.map((el) => (
          <CanvasElement
            key={el.id}
            element={el}
            isSelected={el.id === selectedId}
            onSelect={() => onSelect(el.id)}
            onDragEnd={(e) => handleDragEnd(el.id, e)}
            onDragMove={(e) => handleDragMove(el.id, e)}
            onTransformEnd={(e) => handleTransformEnd(el.id, e)}
          />
        ))}
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) return oldBox;
            return newBox;
          }}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right']}
          borderStroke="#C5D89D"
          borderStrokeWidth={2}
          anchorFill="#fff"
          anchorStroke="#C5D89D"
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
            stroke={GUIDE_COLOR}
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
}: {
  element: IStripElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}) {
  const p = element.props;
  const common = {
    id: element.id,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd,
    onDragMove,
    onTransformEnd,
    opacity: p.opacity ?? 1,
  };

  switch (element.type) {
    case 'photo-slot':
      return <PhotoSlotShape el={element} common={common} />;
    case 'text':
      return (
        <Text
          {...common}
          text={p.content || 'Text'}
          fontSize={p.fontSize || 24}
          fontFamily={p.fontFamily || 'Inter'}
          fill={p.color || '#3d2c2c'}
          fontStyle={(p.fontWeight === '700' ? 'bold ' : '') + (p.fontStyle || 'normal')}
          align={p.textAlign || 'left'}
          verticalAlign="middle"
        />
      );
    case 'sticker':
      return <StickerElement el={element} common={common} />;
    case 'shape': {
      const shape = p.shapeType || 'rect';
      const fill = p.fillColor || '#C5D89D';
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
  const p = el.props;
  const shape = p.shape || 'rounded';
  const bw = p.borderWidth ?? 2;
  const bc = p.borderColor || '#ffffff';
  const br = p.borderRadius ?? 8;
  const fill = '#00bf63';

  switch (shape) {
    case 'circle': {
      const r = Math.min(el.width, el.height) / 2;
      return (
        <Group {...common} x={el.x + el.width / 2} y={el.y + el.height / 2}>
          <Circle radius={r} fill={fill} stroke={bc} strokeWidth={bw} />
        </Group>
      );
    }
    case 'heart':
      return <HeartShape el={el} common={common} fill={fill} stroke={bc} strokeWidth={bw} />;
    case 'star': {
      const cx = el.width / 2;
      const cy = el.height / 2;
      const r = Math.min(el.width, el.height) / 2;
      return (
        <Group {...common}>
          <Star x={cx} y={cy} numPoints={5} innerRadius={r * 0.4} outerRadius={r} fill={fill} stroke={bc} strokeWidth={bw} />
        </Group>
      );
    }
    case 'diamond':
      return (
        <Group {...common}>
          <Line
            x={el.width / 2}
            y={0}
            points={[0, el.height / 2, el.width / 2, el.height, el.width, el.height / 2, el.width / 2, 0]}
            closed
            fill={fill}
            stroke={bc}
            strokeWidth={bw}
          />
        </Group>
      );
    case 'polaroid':
      return (
        <Group {...common}>
          <Rect x={0} y={0} width={el.width} height={el.height} fill={fill} stroke={bc} strokeWidth={bw} cornerRadius={2} />
          <Rect x={el.width * 0.2} y={el.height - 14} width={el.width * 0.6} height={8} fill={bc} cornerRadius={1} />
        </Group>
      );
    case 'hexagon':
      return <HexagonShape el={el} common={common} fill={fill} stroke={bc} strokeWidth={bw} />;
    default:
      return (
        <Group {...common}>
          <Rect x={0} y={0} width={el.width} height={el.height} fill={fill} stroke={bc} strokeWidth={bw} cornerRadius={br} />
        </Group>
      );
  }
}

function HeartShape({ el, common, fill, stroke, strokeWidth }: { el: IStripElement; common: any; fill: string; stroke: string; strokeWidth: number }) {
  const w = el.width;
  const h = el.height;
  const s = Math.min(w, h) * 0.45;
  const cx = w / 2;
  const cy = h * 0.4;
  const path = `M${cx},${cy + s * 0.3} C${cx - s * 0.7},${cy - s * 0.2} ${cx - s},${cy - s * 0.5} ${cx},${cy - s * 0.7} C${cx + s},${cy - s * 0.5} ${cx + s * 0.7},${cy - s * 0.2} ${cx},${cy + s * 0.3} Z`;
  return (
    <Group {...common}>
      <Path data={path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </Group>
  );
}

function HexagonShape({ el, common, fill, stroke, strokeWidth }: { el: IStripElement; common: any; fill: string; stroke: string; strokeWidth: number }) {
  const w = el.width;
  const h = el.height;
  const r = Math.min(w, h) / 2;
  const cx = w / 2;
  const cy = h / 2;
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    pts.push(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  return (
    <Group {...common}>
      <Line points={pts} closed fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </Group>
  );
}

function StickerElement({ el, common }: { el: IStripElement; common: any }) {
  const [image] = useImage(el.props.stickerUrl || '');
  if (!image || !el.props.stickerUrl) {
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
