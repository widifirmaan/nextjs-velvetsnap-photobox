'use client';

import { useRef, useEffect } from 'react';
import { Stage, Layer, Transformer, Rect, Circle, Text, Group, Image as KonvaImage, Ellipse, Star, Line, Path } from 'react-konva';
import type Konva from 'konva';
import type { IStripElement } from '@/models/Template';
import { useImage } from './useImage';

interface EditorCanvasProps {
  elements: IStripElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, patch: Partial<IStripElement>) => void;
  canvasSize: { w: number; h: number };
}

export default function EditorCanvas({ elements, selectedId, onSelect, onUpdate, canvasSize }: EditorCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const trRef = useRef<Konva.Transformer>(null);

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

  const sorted = [...elements]
    .filter((el) => el.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  const handleDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onUpdate(id, { x: node.x(), y: node.y() });
  };

  const handleTransformEnd = (id: string, e: Konva.KonvaEventObject<Event>) => {
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
  };

  return (
    <Stage
      ref={stageRef}
      width={canvasSize.w}
      height={canvasSize.h}
      style={{
        background: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
      }}
      onClick={(e) => {
        if (e.target === e.target.getStage()) onSelect(null);
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
        />
      </Layer>
    </Stage>
  );
}

function CanvasElement({
  element,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: {
  element: IStripElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
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

    case 'background':
      return (
        <Rect
          {...common}
          x={0}
          y={0}
          width={element.width}
          height={element.height}
          fill={p.backgroundColor || '#F6F0D7'}
          draggable={false}
          listening={false}
        />
      );

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
  const fill = 'rgba(0,0,0,0.06)';

  switch (shape) {
    case 'circle': {
      const r = Math.min(el.width, el.height) / 2;
      return (
        <Group {...common} x={el.x + el.width / 2} y={el.y + el.height / 2}>
          <Circle radius={r} fill={fill} stroke={bc} strokeWidth={bw} />
          <Circle radius={r - 6} stroke="rgba(255,255,255,0.3)" strokeWidth={1} dash={[4, 4]} />
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
          <Rect x={4} y={4} width={el.width - 8} height={el.height - 20} fill="rgba(255,255,255,0.2)" cornerRadius={1} />
          <Rect x={el.width * 0.2} y={el.height - 14} width={el.width * 0.6} height={8} fill={bc} cornerRadius={1} />
        </Group>
      );
    case 'hexagon':
      return <HexagonShape el={el} common={common} fill={fill} stroke={bc} strokeWidth={bw} />;
    default:
      return (
        <Group {...common}>
          <Rect x={0} y={0} width={el.width} height={el.height} fill={fill} stroke={bc} strokeWidth={bw} cornerRadius={br} />
          <Rect x={4} y={4} width={el.width - 8} height={el.height - 8} fill="rgba(255,255,255,0.1)" cornerRadius={Math.max(2, br - 2)} />
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
  return <KonvaImage {...common} image={image} />;
}
