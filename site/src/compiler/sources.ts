/**
 * Loads the Expressive style sources into a virtual filesystem keyed by POSIX
 * path, rooted at the style directory.
 */
const modules = import.meta.glob("../../styles-src/styles/bright/**/*.{exp,json}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const PREFIX = "../../styles-src/styles/bright";

export type FileMap = Record<string, string>;

export const sources: FileMap = Object.fromEntries(
  Object.entries(modules)
    .filter(([key]) => !key.endsWith("/upstream.json"))
    .map(([key, contents]) => [key.slice(PREFIX.length), contents]),
);

export const entry = "/style.light.exp";

export const paramPaths = {
  core: "/params/light/core.json",
  detail: "/params/light/detail.json",
} as const;
