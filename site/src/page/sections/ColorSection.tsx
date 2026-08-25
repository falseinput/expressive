import type { StyleSpecification } from "maplibre-gl";
import { Code, mark } from "../Code.tsx";
import { Knob } from "../Knob.tsx";
import { LazyMap } from "../LazyMap.tsx";
import { Frame, Pane } from "../Pane.tsx";
import { Section } from "../Section.tsx";
import { TabbedPane } from "../TabbedPane.tsx";
import { SOURCE_LAYERS, type SourceKey, readColorText } from "../theme.ts";

/** One token from each family the modifiers reach, with what derives from it. */
const EMITTED: Array<[SourceKey, string]> = [
  ["canvas", "land, and the warm neutral family under it"],
  ["water", "water bodies, a detail token the modifiers reach too"],
  ["vegetation", "parks, and woodland from them"],
  ["road", "motorways, and every major road casing"],
];

type Props = {
  hue: number;
  saturation: number;
  lightness: number;
  onHue: (value: number) => void;
  onSaturation: (value: number) => void;
  onLightness: (value: number) => void;
  style: unknown;
  mapStyle: StyleSpecification | null;
};

export function ColorSection({
  hue,
  saturation,
  lightness,
  onHue,
  onSaturation,
  onLightness,
  style,
  mapStyle,
}: Props) {
  const params = `{
  "paletteHue": {
    "value": ${mark(hue.toFixed(0))}
  },
  "paletteSaturation": {
    "value": ${mark(saturation.toFixed(2))}
  },
  "paletteLightness": {
    "value": ${mark(lightness.toFixed(0))}
  }
}`;

  const derive = `core = import "../params/light/core.json"

hueOffset = core.paletteHue.value
saturationScale = core.paletteSaturation.value
lightnessOffset = core.paletteLightness.value

// One token. The other 24 read the same three.
waterHue = core.water.value.h + hueOffset

{
  "water": {
    "h": when {
      waterHue >= 360 -> waterHue - 360,
      true -> waterHue
    },
    "s": min(100, core.water.value.s * saturationScale),
    "l": min(100, max(0, core.water.value.l + lightnessOffset))
  }
}`;

  return (
    <Section
      title="Color derivation"
      alt
      deck="One control moves the whole palette, and every derivation runs on the result."
    >
      <div className="mt-8 grid gap-4 lg:grid-cols-[264px_minmax(0,1fr)_minmax(0,1fr)]">
        <Pane title="core palette modifiers" bodyClassName="px-4 py-4">
          <div className="flex flex-col gap-3.5">
            <Knob label="hue" value={hue} min={0} max={360} step={1} unit="°" onChange={onHue} />
            <Knob
              label="saturation"
              value={saturation}
              min={0}
              max={2}
              step={0.05}
              digits={2}
              unit="×"
              onChange={onSaturation}
            />
            <Knob
              label="lightness"
              value={lightness}
              min={-70}
              max={10}
              step={1}
              onChange={onLightness}
            />
          </div>
          <p className="mt-4 text-[12px] leading-[1.6] text-ink-muted">
            The three modifiers reach all 25 base tokens. Derivation starts from the results, so
            labels and their halos follow the palette.
          </p>
        </Pane>

        <TabbedPane
          tabs={[
            {
              title: "params/light/core.json",
              content: <Code source={params} lang="json" />,
            },
            { title: "derive/tokens.exp", content: <Code source={derive} /> },
          ]}
        />

        <Pane title="style.json">
          <ul className="flex flex-col divide-y divide-line">
            {EMITTED.map(([key, note]) => {
              const [layerId, property] = SOURCE_LAYERS[key];
              const value = readColorText(style, key);
              return (
                <li key={key} className="flex items-start gap-3 px-4 py-3">
                  <span
                    className="mt-0.5 size-5 shrink-0 rounded-[3px] border border-line"
                    style={{ background: value ?? "transparent" }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[11px] text-ink">
                      {layerId} · {property}
                    </p>
                    <p className="truncate font-mono text-[11.5px] text-[var(--tok-st)]">
                      {value ? `"${value}"` : "…"}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-ink-muted">{note}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Pane>
      </div>

      <Frame className="mt-4 h-[300px] md:h-[400px]">
        <LazyMap
          style={mapStyle}
          center={[21.0122, 52.2297]}
          zoom={12.4}
          label="Warsaw rendered with the compiled style"
          className="size-full"
        />
      </Frame>
    </Section>
  );
}
