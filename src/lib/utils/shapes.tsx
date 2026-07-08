// File: src/lib/utils/shapes.tsx
// Description: Auto-added top comment for easier file identification.

import React from 'react';

export type SlotShape = 'rectangle' | 'circle' | 'heart' | 'star' | 'diamond' | 'hexagon' | 'polaroid' | 'rounded';

export interface ShapeDrawOptions {
  shape: SlotShape;
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
}

function heartControlPoints(w: number, h: number) {
  const s = Math.min(w, h) * 0.45;
  const cx = w / 2;
  const cy = h * 0.4;
  const ds = s * 0.7;
  const d2 = s * 0.5;
  const d3 = s * 0.3;
  const d4 = s * 0.2;
  return { cx, cy, s, ds, d2, d3, d4 };
}

function starPoints(cx: number, cy: number, r: number): number[][] {
  const pts: number[][] = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const innerAngle = outerAngle + Math.PI / 5;
    pts.push([cx + r * Math.cos(outerAngle), cy + r * Math.sin(outerAngle)]);
    pts.push([cx + r * 0.4 * Math.cos(innerAngle), cy + r * 0.4 * Math.sin(innerAngle)]);
  }
  return pts;
}

function hexagonPoints(cx: number, cy: number, r: number): number[][] {
  const pts: number[][] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

// ==================== Canvas2D API ====================

export function drawSlotShape(ctx: CanvasRenderingContext2D, opts: ShapeDrawOptions): void {
  const { shape, x, y, w, h, fill, stroke, strokeWidth, borderRadius = 8 } = opts;
  const bw = strokeWidth ?? 2;

  ctx.save();
  if (fill) ctx.fillStyle = fill;
  if (stroke) ctx.strokeStyle = stroke;
  ctx.lineWidth = bw;

  switch (shape) {
    case 'circle': {
      const r = Math.min(w, h) / 2;
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      break;
    }
    case 'heart': {
      const { cx, cy, s, ds, d2, d3, d4 } = heartControlPoints(w, h);
      const hx = x + cx;
      const hy = y + cy;
      ctx.beginPath();
      ctx.moveTo(hx, hy + d3);
      ctx.bezierCurveTo(hx - ds, hy - d4, hx - s, hy - d2, hx, hy - ds);
      ctx.bezierCurveTo(hx + s, hy - d2, hx + ds, hy - d4, hx, hy + d3);
      ctx.closePath();
      break;
    }
    case 'star': {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const r = Math.min(w, h) / 2;
      const pts = starPoints(cx, cy, r);
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
        else ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.closePath();
      break;
    }
    case 'diamond': {
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(x + w, cy);
      ctx.lineTo(cx, y + h);
      ctx.lineTo(x, cy);
      ctx.closePath();
      break;
    }
    case 'hexagon': {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const r = Math.min(w, h) / 2;
      const pts = hexagonPoints(cx, cy, r);
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
        else ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.closePath();
      break;
    }
    case 'polaroid': {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.closePath();
      ctx.fill();
      if (stroke) ctx.stroke();
      ctx.fillStyle = stroke || '#ffffff';
      ctx.fillRect(x + w * 0.2, y + h - 14, w * 0.6, 8);
      return;
    }
    default: {
      const r = Math.min(borderRadius, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      break;
    }
  }

  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
  ctx.restore();
}

export function clipSlotShape(ctx: CanvasRenderingContext2D, opts: ShapeDrawOptions): void {
  const { shape, x, y, w, h, borderRadius = 8 } = opts;

  ctx.beginPath();
  switch (shape) {
    case 'circle': {
      const r = Math.min(w, h) / 2;
      ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2);
      break;
    }
    case 'heart': {
      const { cx, cy, s, ds, d2, d3, d4 } = heartControlPoints(w, h);
      const hx = x + cx;
      const hy = y + cy;
      ctx.moveTo(hx, hy + d3);
      ctx.bezierCurveTo(hx - ds, hy - d4, hx - s, hy - d2, hx, hy - ds);
      ctx.bezierCurveTo(hx + s, hy - d2, hx + ds, hy - d4, hx, hy + d3);
      break;
    }
    case 'star': {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const r = Math.min(w, h) / 2;
      const pts = starPoints(cx, cy, r);
      for (let i = 0; i < pts.length; i++) {
        if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
        else ctx.lineTo(pts[i][0], pts[i][1]);
      }
      break;
    }
    case 'diamond': {
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.moveTo(cx, y);
      ctx.lineTo(x + w, cy);
      ctx.lineTo(cx, y + h);
      ctx.lineTo(x, cy);
      break;
    }
    case 'hexagon': {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const r = Math.min(w, h) / 2;
      const pts = hexagonPoints(cx, cy, r);
      for (let i = 0; i < pts.length; i++) {
        if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
        else ctx.lineTo(pts[i][0], pts[i][1]);
      }
      break;
    }
    case 'polaroid':
    default: {
      const r = Math.min(borderRadius, w / 2, h / 2);
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      break;
    }
  }
  ctx.closePath();
  ctx.clip();
}

// ==================== Konva API ====================

import {
  Circle as KonvaCircle,
  Rect as KonvaRect,
  Line as KonvaLine,
  Path as KonvaPath,
  Star as KonvaStar,
  Text as KonvaText,
} from 'react-konva';

export function createSlotShapeNodes(
  shape: SlotShape,
  w: number,
  h: number,
  fill: string,
  stroke: string,
  strokeWidth: number,
  borderRadius: number,
  slotNumber?: number,
): React.ReactNode[] {
  const commonProps = { fill, stroke, strokeWidth };
  const nodes: React.ReactNode[] = [];

  switch (shape) {
    case 'circle': {
      const r = Math.min(w, h) / 2;
      nodes.push(
        <KonvaCircle key="shape" x={w / 2} y={h / 2} radius={r} {...commonProps} />
      );
      break;
    }
    case 'heart': {
      const { cx, cy, s, ds, d2, d3, d4 } = heartControlPoints(w, h);
      const d = [
        `M${cx},${cy + d3}`,
        `C${cx - ds},${cy - d4} ${cx - s},${cy - d2} ${cx},${cy - ds}`,
        `C${cx + s},${cy - d2} ${cx + ds},${cy - d4} ${cx},${cy + d3}`,
        'Z',
      ].join(' ');
      nodes.push(
        <KonvaPath key="shape" data={d} {...commonProps} />
      );
      break;
    }
    case 'star': {
      const r = Math.min(w, h) / 2;
      nodes.push(
        <KonvaStar key="shape" x={w / 2} y={h / 2} numPoints={5} innerRadius={r * 0.4} outerRadius={r} {...commonProps} />
      );
      break;
    }
    case 'diamond':
      nodes.push(
        <KonvaLine key="shape" x={0} y={0} points={[w / 2, 0, w, h / 2, w / 2, h, 0, h / 2]} closed {...commonProps} />
      );
      break;
    case 'polaroid':
      nodes.push(
        <KonvaRect key="shape" x={0} y={0} width={w} height={h} {...commonProps} cornerRadius={2} />,
        <KonvaRect key="bar" x={w * 0.2} y={h - 14} width={w * 0.6} height={8} fill={stroke} cornerRadius={1} />
      );
      break;
    case 'hexagon': {
      const r = Math.min(w, h) / 2;
      const pts = hexagonPoints(w / 2, h / 2, r).flat();
      nodes.push(
        <KonvaLine key="shape" x={0} y={0} points={pts} closed {...commonProps} />
      );
      break;
    }
    default: {
      nodes.push(
        <KonvaRect key="shape" x={0} y={0} width={w} height={h} cornerRadius={borderRadius} {...commonProps} />
      );
      break;
    }
  }

  if (slotNumber !== undefined) {
    nodes.push(
      <KonvaText
        key="number"
        text={String(slotNumber)}
        fontSize={Math.min(w, h) * 0.35}
        fill="rgba(0, 191, 99, 0.25)"
        align="center"
        verticalAlign="middle"
        width={w}
        height={h}
        x={0}
        y={0}
        listening={false}
      />
    );
  }

  return nodes;
}
