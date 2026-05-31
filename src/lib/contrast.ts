// WCAG relative-luminance contrast ratio. Used for the live AA badge on color
// pickers (design-review: contrast checker on EFFECTIVE colors). Pure functions.

function srgbToLin(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Parse #rgb / #rrggbb to [r,g,b] 0-255, or null if invalid. */
export function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}

/** Contrast ratio between two hex colors (1..21), or null if either is invalid. */
export function contrastRatio(fg: string, bg: string): number | null {
  const a = parseHex(fg);
  const b = parseHex(bg);
  if (!a || !b) return null;
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export interface ContrastResult {
  ratio: number;
  passAA: boolean; // 4.5:1 normal text
  passAALarge: boolean; // 3:1 large text
}

export function checkContrast(fg: string, bg: string): ContrastResult | null {
  const ratio = contrastRatio(fg, bg);
  if (ratio == null) return null;
  return { ratio, passAA: ratio >= 4.5, passAALarge: ratio >= 3 };
}
