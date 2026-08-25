/**
 * WCAG relative luminance and contrast, in HSL.
 *
 * The compiler emits `hsla()` strings, the parameters are HSL objects, and the
 * page derives its own surfaces from both. Working in the same space avoids a
 * conversion step and keeps `ensureContrast` a single-channel search.
 *
 * `std.colorContrast` in the Expressive standard library answers a narrower
 * question: black or white, whichever contrasts more. The page needs a tinted
 * answer, so it computes the ratio itself with the same formula.
 */

export type Hsl = { h: number; s: number; l: number };

export function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

export function hsl(h: number, s: number, l: number): Hsl {
  return { h: ((h % 360) + 360) % 360, s: clamp(s, 0, 100), l: clamp(l, 0, 100) };
}

export function css(color: Hsl, alpha = 1): string {
  const h = Math.round(color.h * 10) / 10;
  const s = Math.round(color.s * 10) / 10;
  const l = Math.round(color.l * 10) / 10;
  return alpha === 1 ? `hsl(${h} ${s}% ${l}%)` : `hsl(${h} ${s}% ${l}% / ${alpha})`;
}

function channel(p: number, q: number, t: number): number {
  let x = t;
  if (x < 0) x += 1;
  if (x > 1) x -= 1;
  if (x < 1 / 6) return p + (q - p) * 6 * x;
  if (x < 1 / 2) return q;
  if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
  return p;
}

/** sRGB components in 0..1. */
export function toRgb(color: Hsl): [number, number, number] {
  const h = color.h / 360;
  const s = color.s / 100;
  const l = color.l / 100;
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [channel(p, q, h + 1 / 3), channel(p, q, h), channel(p, q, h - 1 / 3)];
}

function linear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function luminance(color: Hsl): number {
  const [r, g, b] = toRgb(color);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function contrast(a: Hsl, b: Hsl): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Moves lightness by the smallest amount that reaches `ratio` against
 * `background`, keeping hue and saturation. When no lightness reaches the
 * ratio, returns the highest-contrast lightness available, so the result
 * degrades to the most readable option rather than to the requested one.
 */
export function ensureContrast(foreground: Hsl, background: Hsl, ratio: number): Hsl {
  if (contrast(foreground, background) >= ratio) return foreground;

  let best: Hsl | null = null;
  let bestDistance = Infinity;
  let fallback = foreground;
  let fallbackRatio = contrast(foreground, background);

  for (let l = 0; l <= 100; l += 1) {
    const candidate: Hsl = { h: foreground.h, s: foreground.s, l };
    const found = contrast(candidate, background);
    if (found > fallbackRatio) {
      fallbackRatio = found;
      fallback = candidate;
    }
    if (found >= ratio) {
      const distance = Math.abs(l - foreground.l);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }
  }

  return best ?? fallback;
}

/**
 * `ensureContrast` against several backgrounds at once.
 *
 * Running the single-background version twice can undo itself: the lightness
 * that satisfies one surface can be the wrong side of the other. This picks the
 * lightness nearest the seed that clears `ratio` on every background, and
 * otherwise the lightness with the best worst case.
 */
export function ensureContrastAll(foreground: Hsl, backgrounds: Hsl[], ratio: number): Hsl {
  const worst = (candidate: Hsl) =>
    backgrounds.reduce((low, background) => Math.min(low, contrast(candidate, background)), Infinity);

  if (worst(foreground) >= ratio) return foreground;

  let best: Hsl | null = null;
  let bestDistance = Infinity;
  let fallback = foreground;
  let fallbackRatio = worst(foreground);

  for (let l = 0; l <= 100; l += 1) {
    const candidate: Hsl = { h: foreground.h, s: foreground.s, l };
    const found = worst(candidate);
    if (found > fallbackRatio) {
      fallbackRatio = found;
      fallback = candidate;
    }
    if (found >= ratio) {
      const distance = Math.abs(l - foreground.l);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }
  }

  return best ?? fallback;
}

/** Parses the `hsla(h, s%, l%, a)` strings the compiler emits for colors. */
export function parseHsla(value: unknown): Hsl | null {
  if (typeof value !== "string") return null;
  const match = /^hsla?\(\s*(-?[\d.]+)[\s,]+([\d.]+)%[\s,]+([\d.]+)%/.exec(value.trim());
  if (!match) return null;
  const [, h, s, l] = match;
  return hsl(Number(h), Number(s), Number(l));
}
