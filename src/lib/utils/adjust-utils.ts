// File: src/lib/utils/adjust-utils.ts
// Description: Auto-added top comment for easier file identification.

import { DEFAULT_ADJUST, type PhotoAdjust } from '@/lib/types';

export function clampPhotoAdjust(prev: PhotoAdjust[], idx: number, patch: Partial<PhotoAdjust>): PhotoAdjust[] {
  const next = prev.map((a) => ({ ...a }));
  if (!next[idx]) next[idx] = { ...DEFAULT_ADJUST };
  if ('scale' in patch) {
    const s = patch.scale || 1;
    const maxT = Math.max(0, (1 - 1 / s) / 2 * 100);
    next[idx].x = Math.max(-maxT, Math.min(maxT, next[idx].x || 0));
    next[idx].y = Math.max(-maxT, Math.min(maxT, next[idx].y || 0));
  } else {
    const s = next[idx].scale || 1;
    const maxT = Math.max(0, (1 - 1 / s) / 2 * 100);
    if ('x' in patch) patch.x = Math.max(-maxT, Math.min(maxT, patch.x!));
    if ('y' in patch) patch.y = Math.max(-maxT, Math.min(maxT, patch.y!));
  }
  Object.assign(next[idx], patch);
  return next;
}

export function computeSlotCssFilter(adjust: PhotoAdjust | undefined): string {
  if (!adjust) return '';
  const t = adjust.temperature;
  const hueRotate = t * 0.25;
  const warmSepia = t > 0 ? t * 0.08 : 0;
  return `brightness(${adjust.brightness}%) contrast(${adjust.contrast}%) saturate(${adjust.saturation}%) hue-rotate(${hueRotate}deg) sepia(${warmSepia}%)`;
}
