import type { ReactNode } from "react";
import { Code, squiggle } from "../Code.tsx";
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
    title: "Agent ready",
    body: (
      <>
        The language is small and declarative, so a coding agent can read a whole style and change
        it. Point one at a style you already have and it rewrites it as parameters and modules, or
        have it write one from scratch.
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

export function Diagnostics() {
  return (
    <Section
      title="Errors point at the line"
      deck="A style is compiled, so a mistake stops the build. Every error names the file, the line, and the column that produced it, and marks the token it read."
      alt
    >
      <div className={PAIR}>
        <Pane title="derive/colors.exp">
          <Code
            source={`canvas = std.hsl(30, 36, 96)

{
  "background-color": canvas,
  "casing-color": std.${squiggle("lighen")}(canvas, 12),
  "label-color": ${squiggle("std.hsl")}(0, 20)
}`}
          />
        </Pane>

        <Pane title="expc">
          <div className="flex flex-col gap-3 p-3.5 font-mono text-[12px] leading-[1.6]">
            <Diagnostic
              message="Unknown stdlib function 'std.lighen'"
              where="derive/colors.exp:5:23"
              line={`  "casing-color": std.lighen(canvas, 12),`}
              caret={22}
            />
            <Diagnostic
              message="'std.hsl' expects at least 3 argument(s), got 2."
              where="derive/colors.exp:6:18"
              line={`  "label-color": std.hsl(0, 20)`}
              caret={17}
            />
            <p className="text-ink-muted">Compilation failed with 2 errors.</p>
          </div>
        </Pane>
      </div>
    </Section>
  );
}

function Diagnostic({
  message,
  where,
  line,
  caret,
}: {
  message: string;
  where: string;
  line: string;
  caret: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2">
        <svg
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="var(--tok-err)"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          className="mt-[3px] shrink-0"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16.5v.01" />
        </svg>
        <span className="text-[color:var(--tok-err)]">{message}</span>
      </div>
      <pre className="ml-[21px] overflow-x-auto text-ink-muted">
        {line}
        {"\n"}
        {" ".repeat(caret)}^
      </pre>
      <span className="ml-[21px] text-[11px] text-ink-muted">{where}</span>
    </div>
  );
}

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
