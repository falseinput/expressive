import { Code } from "./Code.tsx";
import { CopyCommand } from "./CopyCommand.tsx";

const SOURCE = `"line-width": std.byZoom(
  { "8": 0.6, "20": 22 },
  1.2
)`;

const EMITTED = `"line-width": [
  "interpolate",
  ["exponential", 1.2],
  ["zoom"],
  8, 0.6,
  20, 22
]`;

export function Hero() {
  return (
    <div id="top" className="bg-page">
      <div className="mx-auto w-full max-w-[1240px] px-5 pt-14 pb-14 sm:px-8 md:pt-20 md:pb-20 lg:px-14">
        <div className="grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end">
          <h1 className="max-w-[9ch] font-sans text-[48px] leading-[0.96] font-bold tracking-[-0.035em] text-ink sm:text-[76px] lg:text-[104px]">
            DSL for MapLibre
          </h1>

          <div className="lg:pb-2">
            <p className="max-w-[54ch] text-[16px] leading-[1.6] text-ink-muted">
              Expressive is a DSL that compiles to MapLibre style JSON. Expressive lets you build
              a design system using variables, color functions, zoom curves, conditionals and
              imports.
            </p>
            <div className="mt-5 flex flex-col gap-2 font-mono text-[12px] sm:flex-row sm:flex-wrap">
              <CopyCommand command="npm i @falseinput/expressive" />
              <CopyCommand command="expc -i style.exp -o style.json" />
            </div>
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-lg border border-line bg-panel md:mt-16">
          <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="min-w-0 px-4 py-5 md:px-7 md:py-7">
              <p className="mb-2.5 font-mono text-[10.5px] text-ink-muted">style.exp</p>
              <Code source={SOURCE} className="px-0 py-0 text-[13px] md:text-[15px]" />
            </div>

            <div className="min-w-0 border-t border-line px-4 py-5 md:border-t-0 md:border-l md:px-7 md:py-7">
              <p className="mb-2.5 font-mono text-[10.5px] text-ink-muted">style.json</p>
              <Code
                source={EMITTED}
                lang="json"
                className="px-0 py-0 text-[13px] md:text-[15px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
