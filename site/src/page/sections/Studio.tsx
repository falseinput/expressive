import type { StyleSpecification } from "maplibre-gl";
import { LazyMap } from "../LazyMap.tsx";
import { ParamControl } from "@/params/ParamControl.tsx";
import type { Param, ParamValue } from "@/params/model.ts";
import { cn } from "@/lib/utils.ts";

const REPO_URL = "https://github.com/falseinput/openfreemap-expressive";

const TIERS = ["core", "detail"] as const;
export type Tier = (typeof TIERS)[number];

type Props = {
  tier: Tier;
  onTier: (tier: Tier) => void;
  keys: string[];
  params: Record<string, Param>;
  overrides: Record<string, ParamValue>;
  onChange: (name: string, value: ParamValue) => void;
  onReset: () => void;
  pending: boolean;
  durationMs: number | null;
  errors: string[];
  mapStyle: StyleSpecification | null;
};

/**
 * The whole style, with every parameter exposed. The rail is derived from the
 * parameter files themselves, so a parameter added upstream shows up here with
 * no UI change.
 */
export function Studio({
  tier,
  onTier,
  keys,
  params,
  overrides,
  onChange,
  onReset,
  pending,
  durationMs,
  errors,
  mapStyle,
}: Props) {
  const changed = Object.keys(overrides).length;

  /** Saves the style the map is rendering, so it can be dropped into MapLibre. */
  function downloadStyle() {
    if (!mapStyle) return;

    const blob = new Blob([`${JSON.stringify(mapStyle, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "style.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="border-t border-line bg-page">
      <div className="grid h-[760px] grid-rows-[minmax(0,1fr)_300px] border-y border-line lg:h-[660px] lg:grid-cols-[320px_minmax(0,1fr)] lg:grid-rows-1">
        <div className="flex min-h-0 flex-col border-b border-line bg-page lg:border-r lg:border-b-0">
          <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
            {TIERS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => onTier(name)}
                aria-pressed={tier === name}
                className={cn(
                  "rounded px-2.5 py-1 font-mono text-[11px] capitalize",
                  tier === name
                    ? "bg-ink text-page"
                    : "bg-panel text-ink-muted hover:text-ink",
                )}
              >
                {name}
              </button>
            ))}
            <span className="ml-auto font-mono text-[10.5px] tabular-nums text-ink-muted">
              {pending ? "compiling" : durationMs !== null ? `${durationMs} ms` : "idle"}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {keys.map((name) => (
              <ParamControl
                key={name}
                name={name}
                param={params[name]}
                value={overrides[name] ?? params[name].value}
                modified={name in overrides}
                onChange={(value) => onChange(name, value)}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-line px-4 py-3">
            <div className="flex items-center justify-between font-mono text-[10.5px] text-ink-muted">
              <span>{changed === 0 ? "defaults" : `${changed} edited`}</span>
              <button
                type="button"
                onClick={onReset}
                disabled={changed === 0}
                className="rounded px-1 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:no-underline disabled:opacity-40"
              >
                Reset
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={downloadStyle}
                disabled={!mapStyle}
                className="rounded border border-line bg-control px-2.5 py-1.5 text-[12px] text-ink transition-colors hover:border-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
              >
                Download style.json
              </button>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-line px-2.5 py-1.5 text-[12px] text-ink-muted no-underline transition-colors hover:border-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Read the source
              </a>
            </div>
            <p className="text-[11px] leading-[1.5] text-ink-muted">
              The style compiles from the parameter files and the layer modules in the repository.
            </p>
          </div>
        </div>

        <div className="relative min-h-0">
          <LazyMap
            style={mapStyle}
            center={[21.0122, 52.2297]}
            zoom={12}
            navigation
            label="Warsaw rendered with the full compiled style"
            className="size-full"
          />
          {errors.length > 0 && (
            <div
              role="alert"
              className="absolute inset-x-3 bottom-9 rounded-md border border-line bg-page/95 p-3 backdrop-blur-[4px]"
            >
              <p className="font-mono text-[11px] font-semibold text-ink">Compile error</p>
              <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-ink-muted">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
