# Expressive

Expressive is a toolkit and a DSL for creating MapLibre compatible styles.

Expressive Language compiles to MapLibre style specification JSON. It lets you split styles into multiple files, use variables, color functions, conditionals and write expressions using nice and readable syntax.

The `expc` CLI automatically compiles and serves local `style.exp` files, and provides diagnostics information such as type errors or warnings.

[Expressive Language Support](https://marketplace.visualstudio.com/items?itemName=falseinput.expressive-language-support) extension for Visual Studio Code provides syntax highlighting, autocomplete and more.

## Try it

[falseinput.github.io/expressive](https://falseinput.github.io/expressive) compiles a style in your browser. Move a parameter and the map recompiles as you drag.

The page renders [openfreemap-expressive](https://github.com/falseinput/openfreemap-expressive), the OpenFreeMap Bright style rebuilt as parameters and layer modules. Read that repository to see how a full 119 layer style is put together, or fork it and change the parameters.

This repository holds the README and the page. The language source is published to npm as [@falseinput/expressive](https://www.npmjs.com/package/@falseinput/expressive).

See it in action:

```js
// colors.exp
base_saturation = 1

{
    "land": std.hsl(64, 25 * base_saturation, 91),
    "water": std.hsl(194, 98 * base_saturation, 50),
    "roads": std.hsl(60, 3 * base_saturation, 45)
}

// water-colors.exp
colors = import "./colors.exp"

{
    "ocean": when {
        zoom() > 16 -> std.lighten(colors.water, 20),
        zoom() > 10 -> std.lighten(colors.water, 10),
        true -> colors.water
    },
    "lake": std.lighten(colors.water, 15),
    "lagoon": std.darken(colors.water, 30)
}
```

## Install

Run

```bash
npm i -g @falseinput/expressive
```

## Use

### compile (default)

Compile an Expressive file to MapLibre style JSON.

```bash
expc -i <input> -o <output>
```

| Flag | Alias | Required | Description |
|------|-------|----------|-------------|
| `--input` | `-i` | yes | Path to the `.exp` source file |
| `--output` | `-o` | yes | Path to the output `.json` file |

Example:

```bash
expc -i style.exp -o style.json
```

### serve

Builds all `*style.exp` files in the current directory and serves them with hot reload.

```bash
expc serve [--port <port>]
```

| Flag | Alias | Default | Description |
|------|-------|---------|-------------|
| `--port` | `-p` | `3000` | Port to listen on |

Example:

```bash
expc serve --port 8080
```

### pack

Pack a style and everything it imports into a single `.expressive` archive, together with its metadata.

```bash
expc pack [target] [--output <file>]
```

| Argument | Default | Description |
|----------|---------|-------------|
| `target` | current dir | Style directory, or the `expressive.json` inside it |

| Flag | Alias | Default | Description |
|------|-------|---------|-------------|
| `--output` | `-o` | `<name>-<version>.expressive` | Path to write the archive to |

A style directory is described by an `expressive.json` at its root:

```json
{
    "name": "navigation-style",
    "version": "1.2.0",
    "entry": "style.exp",
    "author": { "name": "John Doe", "url": "https://example.com" },
    "license": "MIT",
    "description": "A dark basemap style"
}
```

`name` is a kebab-case identifier, `version` is the style's semver, `entry` is the style's entry point relative to the directory, and `license` is an [SPDX identifier](https://spdx.org/licenses/).

The archive records two more fields that `pack` fills in for you: `formatVersion`, the archive layout version, and `expressive`, the compiler that built it. Both describe the build rather than the style, so you never write them by hand — and every read checks them, refusing a pack from an incompatible version rather than half-understanding it.

One directory is one style: the manifest names the single entry point, so a manifest describes exactly one archive. A pack carries only `.exp` and `.json` files, and the style is compiled before the archive is written — so a pack that exists is a pack that builds.

```bash
expc pack ./navigation-style
```

### unpack

Extract an archive back to an editable style directory.

```bash
expc unpack <pack> [--output <dir>]
```

| Flag | Alias | Default | Description |
|------|-------|---------|-------------|
| `--output` | `-o` | `<name>-<version>` | Directory to extract into |

Sources are restored where the author had them, with `expressive.json` beside them, so packing the result again reproduces the same archive byte for byte.

Archives compile directly, with no need to unpack first:

```bash
expc -i navigation-style-1.2.0.expressive -o style.json
```

### docs

Print the Expressive language reference and exit.

```bash
expc docs
```

### Rewriting existing MapLibre styles

Start with changing style extension from .json to .exp and progressively split the style into smaller parts. Try using variables for things like sizes or colors.

## Library

The package also ships the compiler as a library. `compile` is one ES module with TypeScript declarations, and it runs the same on Node and in the browser.

`compile` takes the files it compiles and never reads a disk. Keys are absolute POSIX-style paths, and `entryPath` names the program to compile.

```js
import { compile } from "@falseinput/expressive";

const result = compile(
  {
    "/colors.exp": `{ "water": std.hsl(194, 98, 50) }`,
    "/style.exp": `colors = import "./colors.exp"\n{ "version": 8, "layers": [] }`,
  },
  "/style.exp",
);

if (result.ok) {
  console.log(result.json);
} else {
  console.error(result.errorDetails);
}
```

The map is the whole file system the compiler sees. Imports resolve inside the entry file's directory and cannot escape it, so the caller decides what a style can read by deciding what goes in the map.

On Node, `readStyle` fills that map from a directory. It collects `.exp` and `.json` files, keys them by their path below the directory, and skips symbolic links, `node_modules` and dot-directories, so nothing outside the directory reaches the map.

```js
import { compile } from "@falseinput/expressive";
import { readStyle } from "@falseinput/expressive/fs";

compile(readStyle("./styles/bright"), "/style.light.exp");
```

`compile` returns `{ ok: true, json }`, or `{ ok: false, errorDetails }` where each error carries `file`, `line`, `col`, `message` and `srcLine`.

### Exchange format

`@falseinput/expressive/pack` reads and writes `.expressive` archives. It runs on both hosts — a browser needs `unpack` to compile a pack it was handed — and returns errors as values rather than throwing.

```js
import { compile } from "@falseinput/expressive";
import { pack, unpack } from "@falseinput/expressive/pack";

const opened = unpack(bytes);
if (opened.ok) {
    const result = compile(opened.files, `/${opened.manifest.entry}`);
}
```

`unpack` returns the same file map shape `compile` takes, so a pack and the directory it came from compile to identical JSON with identical diagnostic paths. Archive entry names are treated as untrusted: paths that escape the source root, files outside the `.exp`/`.json` whitelist, and archives over the size caps are all rejected before anything is decompressed.

## Language server

Expressive comes with [Expressive Language Support](https://marketplace.visualstudio.com/items?itemName=falseinput.expressive-language-support) extension for Visual Studio Code.

Extension helps you catch errors like mismatched types and provides autocomplete for all standard library functions and expressions.

## Features

Expressive aims to provide everything you may need for creating complex map styles, without being overwhelming.

### Imports

Imported files are interpreted as Expressive. When an import ends with `.json`, the file is parsed as JSON. `import` can be assigned to a variable or used inside objects.

```js
typography = import "./typography.exp"
```

By convention, Expressive files have an `.exp` extension.

`import` evaluates to the last statement in the referenced file. To import multiple properties, you can put them in an object.

### Expression syntax

The default expression syntax was made for computers. Expressive fixes that.

```js
// Write expressions like normal functions
zoom(); // -> ["zoom"]

// Use math operators: *, /, +, -
get("road_width") * 0.3; // -> ["*", ["get", "road_width"], 0.3]

// Math operators eagerly reduce arguments if possible
2 * 3 + 1; // -> 7
```

### Zoom curves

Use `std.byZoom` and `std.stepByZoom` to write a zoom-varying value as its stops. Keys are zoom levels. Expressive sorts the stops by zoom ascending, the order MapLibre requires.

```js
// Interpolate between stops
std.byZoom({ 12: 0.5, 20: 13 });
// -> ["interpolate", ["linear"], ["zoom"], 12, 0.5, 20, 13]

// Pass a base for exponential interpolation
std.byZoom({ 12: 0.5, 20: 13 }, 1.2);
// -> ["interpolate", ["exponential", 1.2], ["zoom"], 12, 0.5, 20, 13]

// Step between stops. The first argument is the output below the first stop
std.stepByZoom(0, { 14: 1 });
// -> ["step", ["zoom"], 0, 14, 1]
```

Stop values are numbers, strings, colors, or expressions.

```js
water = std.hsl(194, 98, 50);
std.byZoom({ 8: water, 12: std.darken(water, 30) });
// -> ["interpolate", ["linear"], ["zoom"], 8, "hsla(194, 98%, 50%, 1)", 12, "hsla(194, 98%, 35%, 1)"]
```

### Color functions

Use color functions to manipulate and mix colors.

```js
// Define colors using safe constructors
base = std.hsl(210, 80, 60);
semi = std.hsla(210, 80, 60, 0.5);

// Manipulate colors
lighter = std.lighten(base, 20);
darker = std.darken(base, 10);
vivid = std.saturate(base, 30);
muted = std.desaturate(base, 15);
shifted = std.adjustHue(base, 30);

// Mix colors
blend = std.mix(base, std.hsl(0, 90, 50), 0.5);

// Return black or white for maximum contrast (WCAG)
label_color = std.colorContrast(base);
```

### Types

Expressive supports strings, numbers, booleans, arrays, and objects.

Strings interpret the JSON escape sequences `\n`, `\t`, `\r`, `\b`, `\f`, `\"`, `\\`, `\/` and `\uXXXX`. Any other escape is an error. Use `\n` to stack label lines in `text-field`.

```js
// string
variant = "light"

// number
default_font_size = 12

// boolean
is_beta = true

// array
default_fontstack = ["Noto-Sans", "sans-serif"]

// object
typography = {
    "sizes": {
        "s": default_font_size,
        "m": default_font_size * 1.2,
        "l": default_font_size * 1.4
    },
    "base_font": when {
        // A comment
        is_beta -> ["Arial", "sans-serif"], // Inline comment
        true -> default_fontstack
    }
}
```

### Object keys

An object key is a quoted string, a number, or a bare identifier. Every key becomes a string in the output.

```js
// A number reads well for zoom levels
{ 12: 0.5, 20: 13 }
// -> { "12": 0.5, "20": 13 }

// An identifier reads well for names you choose
{ water: "blue", land: "sand" }
// -> { "water": "blue", "land": "sand" }

// Quotes carry any other name, such as a hyphenated MapLibre property
{ "line-width": 3, "text-field": get("name") }
```

A numeric key normalizes to the number's value, the way JavaScript does. `1.50` and `1.5` are the same key `"1.5"`.

```js
{ 1.50: "a", 1.5: "b" }
// -> { "1.5": "b" }
```

Two keys that normalize to the same string are a duplicate, whichever forms they use. Expressive reports `{ 12: 1, "12": 2 }` as an error.

### Spread

`...` copies the members of an object into an object, or the elements of an array into an array.

```js
base = {
    "line-color": colors.roads,
    "line-width": 1
}

// Members are applied in order, so a later member wins
{ ...base, "line-width": 3 }
// Evaluates to:
// { "line-color": ..., "line-width": 3 }

// Arrays inline their elements at the position of the spread
default_fontstack = ["Noto-Sans", "sans-serif"]
[ "Arial", ...default_fontstack ]
```

Spread copies one level. Nest another spread to merge deeper.

```js
{ ...layer, "paint": { ...layer.paint, "line-width": 3 } }
```

## Conditionals

Expressive handles conditional logic with a `when` expression. `when` can be used to control program flow and as a replacement for the `match` MapLibre expression.

```js
variant = "dark"
when {
    variant == "light" -> "white",
    variant == "dark" -> "black",
    true -> "white"
}
// Evaluates to:
// "black"
```

When the subject or condition is a MapLibre expression (like `get()` or `zoom()`), `when` evaluates to a `match` expression.

```js
when (get("road_category")) {
    "motorway" -> 14,
    "trunk" -> 12,
    "primary" -> 10,
    else -> 7
}
// Evaluates to:
[
    "match",
    ["get", "road_category"],
    "motorway",
    14,
    "trunk",
    12,
    "primary",
    10,
    7
]
```

## Evaluation

Expressive evaluates to JSON. The last statement in a file is the program result.

## Limitations

Expressive is in an ALPHA state. Some of the things that you might expect to work are not yet implemented; some will never be.

No support:

- Logical operators (`and`, `or`, `not`)
- No type checks for layers and sources

Limited support:

- Type inference - it's done on a best-effort basis, in many cases types are not inferred, falling back to an "unknown" type that does not raise type error.

Not planned:

- Fetching data.
- Support for editors other than VSC.

## Support

Expressive is built after hours. If you like what you see here, you can **star this repo** and spread the word.

If you are considering supporting development of Expressive financially, you can do it through:

- [GitHub Sponsors](https://github.com/sponsors/falseinput)
- [Buy me a coffee](https://buymeacoffee.com/falseinput)

Thank you! <3

## License

MIT. Copyright (c) 2026 Zbigniew Matysek (falseinput).

See LICENSE for the full text, and for the notices covering sources this
project derives from.
