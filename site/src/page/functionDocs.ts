/**
 * Hover text for the built-in functions the code panes show.
 *
 * Each entry follows the shape the Expressive language server renders on hover:
 * a fenced `expressive` block holding the signature, then a description. A
 * parameter reads as `name: type`, a standard library method carries the `std.`
 * prefix, an optional parameter ends in `?`, and a variadic one ends in `...`.
 *
 * The entries are written for this page. Add a key when a pane gains a call,
 * and key it `std.<name>` for a standard library method and `<name>` for a bare
 * built-in, which is how `tokenize.ts` looks a token up.
 */
export const FUNCTION_DOCS: Record<string, string> = {
  "std.byZoom": [
    "```expressive",
    "std.byZoom(stops: any, base: number?)",
    "```",
    "",
    "Interpolates a value across zoom levels. Takes the stops as an object of zoom level to value, sorts them ascending, and emits an `interpolate` expression on `zoom`. A base argument makes the curve exponential.",
  ].join("\n"),

  get: [
    "```expressive",
    "get(property_name: string, object: any?)",
    "```",
    "",
    "Reads a property of the feature being styled, or of a second argument when you pass one. Returns null when the property is missing.",
  ].join("\n"),

  zoom: [
    "```expressive",
    "zoom()",
    "```",
    "",
    "Returns the zoom level the map is rendering at. In a layout or paint property it stands as the input to a top-level `step` or `interpolate`.",
  ].join("\n"),

  min: [
    "```expressive",
    "min(values: number...)",
    "```",
    "",
    "Returns the smallest of its arguments. Folds to a literal when every argument is one.",
  ].join("\n"),

  max: [
    "```expressive",
    "max(values: number...)",
    "```",
    "",
    "Returns the largest of its arguments. Folds to a literal when every argument is one.",
  ].join("\n"),
};
