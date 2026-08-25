import type { ReactNode } from "react";
import { Code } from "../Code.tsx";
import { Pane } from "../Pane.tsx";
import { Section, Term } from "../Section.tsx";
import { cn } from "@/lib/utils.ts";

const PAIR = "mt-8 grid gap-4 lg:grid-cols-2";

export function Expressions() {
  return (
    <Section
      title="Infix maths and function calls"
      deck="MapLibre expressions are JSON arrays. Expressive parses infix arithmetic and function calls and emits those arrays. Arithmetic over constants reduces at compile time, so only the arrays that depend on feature data end up in the output."
    >
      <div className={PAIR}>
        <Pane title="layers/roads.exp">
          <Code
            source={`get("width") * 0.3 + 1

// zoom is a function call
zoom() > 14`}
          />
        </Pane>
        <Pane title="style.json">
          <Code
            lang="json"
            source={`["+", ["*", ["get", "width"], 0.3], 1]


[">", ["zoom"], 14]`}
          />
        </Pane>
      </div>
    </Section>
  );
}

export function Conditionals() {
  return (
    <Section
      title="Conditionals"
      alt
      deck={
        <>
          <Term>when</Term> branches on a value. Branch on a tag and it emits a{" "}
          <Term>match</Term> expression. Branch on a constant and it folds away at compile time.
        </>
      }
    >
      <div className={PAIR}>
        <Pane title="layers/roads.exp">
          <Code
            source={`when (get("class")) {
  "motorway" -> 14,
  "trunk" -> 12,
  else -> 7
}`}
          />
        </Pane>
        <Pane title="style.json">
          <Code
            lang="json"
            source={`[
  "match",
  ["get", "class"],
  "motorway", 14,
  "trunk", 12,
  7
]`}
          />
        </Pane>
      </div>
    </Section>
  );
}

const TREE = [
  ["styles/bright/", 0, true],
  ["params/light/core.json", 1, false],
  ["derive/colors.exp", 1, false],
  ["layers/water.exp", 1, false],
  ["layers/roads.exp", 1, false],
  ["layers/labels-places.exp", 1, false],
  ["style.light.exp", 1, true],
] as const;

export function Composition() {
  return (
    <Section
      title="Composition"
      deck={
        <>
          <Term>import</Term> splits a style across files. Spread copies a shared layer base and
          overrides what differs, then concatenates the modules in draw order.
        </>
      }
    >
      <div className="mt-8 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)]">
        <Pane title="file tree" bodyClassName="px-4 py-3.5">
          <ul className="flex flex-col gap-1.5 font-mono text-[11.5px] leading-tight">
            {TREE.map(([name, depth, strong]) => (
              <li
                key={name}
                style={{ paddingLeft: depth * 12 }}
                className={strong ? "text-ink" : "text-ink-muted"}
              >
                {name}
              </li>
            ))}
          </ul>
        </Pane>

        <Pane title="layers/roads.exp">
          <Code
            source={`colors = import "../derive/colors.exp"

road = {
  "type": "line",
  "source": "openmaptiles",
  "source-layer": "transportation"
}

{
  ...road,
  "id": "highway-motorway",
  "paint": {
    "line-color": colors.motorway
  }
}`}
          />
        </Pane>

        <Pane title="style.light.exp">
          <Code
            source={`water = import "./layers/water.exp"
roads = import "./layers/roads.exp"

"layers": [
  ...water.bodies,
  ...roads.tunnels,
  ...roads.surface,
  ...roads.bridges
]`}
          />
        </Pane>
      </div>
    </Section>
  );
}

type Card = { title: string; body: ReactNode; span: string };

const CARDS: Card[] = [
  {
    title: "No eval, no network, no filesystem",
    body: (
      <>
        You can compile a style you did not write. That is what lets this page run the compiler in
        your browser, and what makes an .exp file safe to build on a server.
      </>
    ),
    span: "lg:col-span-2",
  },
  {
    title: "Fast compilation",
    body: (
      <>
        Parse trees cache across compiles, so a 119 layer style rebuilds in tens of milliseconds.
        Every knob on this page recompiles the whole style.
      </>
    ),
    span: "lg:col-span-2",
  },
  {
    title: "Node and browser",
    body: (
      <>
        The same compiler runs in both targets. The CLI reads files from disk, and the browser build
        takes a file map. 64 KB gzipped, with no Node builtins.
      </>
    ),
    span: "lg:col-span-2",
  },
  {
    title: "Language server",
    body: (
      <>
        A VS Code extension reports type errors, completes the standard library, and follows go to
        definition through imports.
      </>
    ),
    span: "lg:col-span-2",
  },
  {
    title: "Useful error reporting",
    body: (
      <>
        Compile errors name the file, line, and column. Type mismatches, duplicate keys,
        unreachable branches, and missing properties fail the build.
      </>
    ),
    span: "lg:col-span-2",
  },
  {
    title: "Command line",
    body: (
      <>
        <Term>expc</Term> compiles a file, or watches a directory and serves every style in it with
        hot reload.
      </>
    ),
    span: "lg:col-span-2",
  },
];

export function Toolchain() {
  return (
    <Section title="More features" alt>
      <div className="mt-8 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-6">
        {CARDS.map((card) => (
          <div key={card.title} className={cn("bg-page px-5 py-5", card.span)}>
            <h3 className="font-mono text-[12px] font-semibold text-ink">{card.title}</h3>
            <p className="mt-2 text-[13.5px] leading-[1.6] text-ink-muted">{card.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
