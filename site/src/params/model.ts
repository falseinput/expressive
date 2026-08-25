export type Hsl = { h: number; s: number; l: number; a?: number };
export type ParamValue = number | boolean | Hsl;

export type Param = {
  title: string;
  description: string;
  value: ParamValue;
  min?: number;
  max?: number;
};

export type ParamFile = Record<string, Param>;

export type ParamKind = "color" | "number" | "boolean";

export function kindOf(value: ParamValue): ParamKind {
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "color";
}

export function toCss(color: Hsl): string {
  return `hsl(${color.h} ${color.s}% ${color.l}% / ${color.a ?? 1})`;
}

/** Applies value overrides to a parameter file's JSON text. */
export function applyOverrides(source: string, overrides: Record<string, ParamValue>): string {
  const parsed = JSON.parse(source) as ParamFile;
  for (const [key, value] of Object.entries(overrides)) {
    if (parsed[key]) parsed[key] = { ...parsed[key], value };
  }
  return JSON.stringify(parsed, null, 2);
}

export function parseParams(source: string): ParamFile {
  return JSON.parse(source) as ParamFile;
}

/** Slider step derived from the span a numeric parameter covers. */
export function stepFor(min: number, max: number): number {
  const span = max - min;
  if (span <= 4) return 0.05;
  if (span <= 40) return 0.5;
  return 1;
}
