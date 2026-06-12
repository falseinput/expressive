# Expressive

Expressive is a toolkit and a DSL for creating MapLibre compatible styles.

Expressive Language compiles to MapLibre style specification JSON. It lets you split styles into multiple files, use variables, color functions, conditionals and write expressions using nice and readable syntax.

The `expc` CLI automatically compiles and serves local `style.exp` files, and provides diagnostics information such as type errors or warnings.

[Expressive Language Support](https://marketplace.visualstudio.com/items?itemName=falseinput.expressive-language-support) extension for Visual Studio Code provides syntax highlighting, autocomplete and more.


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

### docs

Print the Expressive language reference and exit.

```bash
expc docs
```

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

Copyright (c) 2026 Zbigniew Matysek

See full license in LICENSE.
