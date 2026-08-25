/**
 * Derives the page's own surfaces from the compiled style.
 *
 * The page reads the colors MapLibre reads: it looks up paint properties on
 * named layers of the compiled JSON, then folds them into a bounded set of
 * tints. Lightness and saturation are clamped, and every text tint is pushed
 * through `ensureContrast` before it is written, so a visitor can drive the
 * canvas to any hue, to full saturation, or to near black and the page still
 * meets AA.
 */
import {
  type Hsl,
  clamp,
  css,
  ensureContrast,
  ensureContrastAll,
  hsl,
  luminance,
  parseHsla,
} from "./wcag.ts";

type StyleLike = { layers?: Array<{ id?: string; paint?: Record<string, unknown> }> };

/** Layers the page reads. Each id exists in the compiled Bright style. */
export const SOURCE_LAYERS = {
  canvas: ["background", "background-color"],
  water: ["water", "fill-color"],
  vegetation: ["park", "fill-color"],
  road: ["highway-motorway", "line-color"],
  casing: ["highway-primary-casing", "line-color"],
  wood: ["landcover-wood", "fill-color"],
  labelStrong: ["label_city", "text-color"],
  labelSecondary: ["poi_r1", "text-color"],
} as const;

export type SourceKey = keyof typeof SOURCE_LAYERS;

export function readColor(style: unknown, key: SourceKey): Hsl | null {
  const [layerId, property] = SOURCE_LAYERS[key];
  const layers = (style as StyleLike | null)?.layers;
  if (!Array.isArray(layers)) return null;
  const layer = layers.find((candidate) => candidate?.id === layerId);
  return parseHsla(layer?.paint?.[property]);
}

export function readColorText(style: unknown, key: SourceKey): string | null {
  const [layerId, property] = SOURCE_LAYERS[key];
  const layers = (style as StyleLike | null)?.layers;
  if (!Array.isArray(layers)) return null;
  const value = layers.find((candidate) => candidate?.id === layerId)?.paint?.[property];
  return typeof value === "string" ? value : null;
}

const ANCHOR_CANVAS = hsl(30, 36, 96);
const ANCHOR_ROAD = hsl(34, 100, 77);

/** Token hues stay fixed so code reads the same way at every canvas setting. */
const TOKENS: Array<[string, number, number]> = [
  ["--tok-kw", 300, 46],
  ["--tok-fn", 255, 52],
  ["--tok-st", 150, 44],
  ["--tok-nu", 28, 62],
];

/**
 * The luminance band where neither black nor white text clears AA against the
 * page and the two surfaces stepped off it. A canvas that lands inside it is
 * pushed to the nearer edge, so the page always resolves to a readable light
 * or a readable dark. Dragging lightness through the band reads as the page
 * flipping side, which is what the map does at the same moment.
 */
const DEAD_BAND: [number, number] = [0.11, 0.3];

function readable(hue: number, saturation: number, start: number): Hsl {
  let l = start;
  let color = hsl(hue, saturation, l);
  let lum = luminance(color);
  if (lum <= DEAD_BAND[0] || lum >= DEAD_BAND[1]) return color;

  const goDark = lum - DEAD_BAND[0] <= DEAD_BAND[1] - lum;
  const direction = goDark ? -1 : 1;
  while (l > 0 && l < 100) {
    l += direction;
    color = hsl(hue, saturation, l);
    lum = luminance(color);
    if (goDark ? lum <= DEAD_BAND[0] : lum >= DEAD_BAND[1]) break;
  }
  return color;
}

export type Tints = Record<string, string>;

export function deriveTints(style: unknown): Tints {
  const canvas = readColor(style, "canvas") ?? ANCHOR_CANVAS;
  const road = readColor(style, "road") ?? ANCHOR_ROAD;

  const hue = canvas.h;
  const saturation = clamp(canvas.s, 0, 30);
  const page = readable(hue, saturation, clamp(canvas.l, 4, 99));
  const lightness = page.l;
  const dark = luminance(page) <= DEAD_BAND[0];
  const sign = dark ? 1 : -1;

  // Surfaces step away from the page toward the ink side, never past it.
  const step = (distance: number, share = 0.85) =>
    hsl(hue, saturation * share, lightness + sign * distance);

  const panel = step(3.5);
  const panel2 = step(7);
  const line = step(11, 0.7);
  const lineStrong = ensureContrast(step(24, 0.6), page, 3);
  const control = dark ? step(30, 0.5) : hsl(hue, saturation * 0.4, lightness + 2.5);

  // Text sits on three surfaces, so every text tint clears its ratio on all
  // three at once. Hue survives, chroma is capped, lightness does the work.
  const surfaces = [page, panel, panel2];
  const inkSeed = hsl(hue, Math.min(saturation, 12), dark ? 94 : 17);
  const ink = ensureContrastAll(inkSeed, surfaces, 8);
  const mutedSeed = hsl(hue, Math.min(saturation, 14), dark ? 74 : 44);
  const inkMuted = ensureContrastAll(mutedSeed, surfaces, 4.6);

  const accentSeed = hsl(road.h, clamp(road.s, 32, 82), dark ? 68 : 40);
  const accent = ensureContrastAll(accentSeed, surfaces, 4.6);

  // The highlight behind a knob-written literal. Visible against the pane, and
  // carrying its own ink so the number on it stays AA whatever the pane does.
  const markSeed = hsl(road.h, clamp(road.s, 24, 88), dark ? 26 : 87);
  const mark = ensureContrast(markSeed, panel, 1.3);
  const markInk = ensureContrast(hsl(28, 62, dark ? 78 : 34), mark, 4.6);

  const tints: Tints = {
    "--tint-page": css(page),
    "--tint-panel": css(panel),
    "--tint-panel-2": css(panel2),
    "--tint-line": css(line),
    "--tint-line-strong": css(lineStrong),
    "--tint-control": css(control),
    "--tint-ink": css(ink),
    "--tint-ink-muted": css(inkMuted),
    "--tint-accent": css(accent),
    "--tint-mark": css(mark),
    "--tint-mark-ink": css(markInk),
  };

  // Code sits on the pane surface only, so tokens are measured against it.
  for (const [name, tokenHue, tokenSaturation] of TOKENS) {
    const seed = hsl(tokenHue, tokenSaturation, dark ? 72 : 42);
    tints[name] = css(ensureContrastAll(seed, [panel], 4.6));
  }
  tints["--tok-cm"] = css(
    ensureContrastAll(hsl(hue, Math.min(saturation, 10), dark ? 62 : 52), [panel], 4.6),
  );

  return tints;
}

/** Applied to :root, the outermost container, so the scroll gutter tints too. */
export function applyTints(tints: Tints): void {
  const root = document.documentElement;
  for (const [name, value] of Object.entries(tints)) root.style.setProperty(name, value);
}
