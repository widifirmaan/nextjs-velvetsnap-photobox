function hexToHsl(hex: string): [number, number, number] {
  let r = 0, g = 0, b = 0;
  const h = hex.replace('#', '');
  if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16);
    g = parseInt(h[1] + h[1], 16);
    b = parseInt(h[2] + h[2], 16);
  } else if (h.length >= 6) {
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let hh = 0, s = 0, l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) hh = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (mx === g) hh = ((b - r) / d + 2) / 6;
    else hh = ((r - g) / d + 4) / 6;
  }
  return [hh * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function vintageAccent(hex?: string): { accent: string; accentHover: string } {
  const color = hex || '#c73e3e';
  const [h, s, l] = hexToHsl(color);

  // Force into warm range (rusty red / terracotta), clamp saturation & lightness
  const vH = h > 350 || h < 30 ? Math.max(0, Math.min(h, 20)) : 8;
  const vS = Math.min(s, 25);
  const vL = Math.max(30, Math.min(l, 48));

  const accent = hslToHex(vH, vS, vL);
  const accentHover = hslToHex(vH, vS, vL - 8);
  return { accent, accentHover };
}
