import type { StyleSpecification } from "maplibre-gl";
import { Code, mark } from "../Code.tsx";
import { Knob } from "../Knob.tsx";
import { LazyMap } from "../LazyMap.tsx";
import { Frame, Pane } from "../Pane.tsx";
import { Section, Term } from "../Section.tsx";
import { TabbedPane } from "../TabbedPane.tsx";

type Props = {
  roadScale: number;
  onRoadScale: (value: number) => void;
  mapStyle: StyleSpecification | null;
};

export function ZoomSection({ roadScale, onRoadScale, mapStyle }: Props) {
  const scale = roadScale.toFixed(2);
  const near = (0.6 * roadScale).toFixed(2);
  const far = (22 * roadScale).toFixed(2);

  const params = `{
  "roadScale": {
    "value": ${mark(scale)}
  }
}`;

  const source = `sizes = import "../derive/sizes.exp"

scale = sizes.roadScale

"line-width": std.byZoom(
  { "8": 0.6 * scale, "20": 22 * scale },
  1.2
)`;

  const emitted = `"line-width": [
  "interpolate",
  ["exponential", 1.2],
  ["zoom"],
  8, ${mark(near)},
  20, ${mark(far)}
]`;

  return (
    <Section
      title="Zoom curves"
      deck={
        <>
          A zoom-varying property is a list of stops. <Term>std.byZoom</Term> takes them as an
          object, sorts them ascending because MapLibre requires that order, and emits the
          interpolation. Pass a base for an exponential curve, or leave it out for a linear one.
        </>
      }
    >
      <div className="mt-8 grid gap-4 lg:grid-cols-[264px_minmax(0,1fr)_minmax(0,1fr)]">
        <Pane title="core.roadScale" bodyClassName="px-4 py-4">
          <Knob
            label="roadScale"
            value={roadScale}
            min={0.25}
            max={3}
            step={0.05}
            digits={2}
            onChange={onRoadScale}
          />
          <p className="mt-4 text-[12px] leading-[1.6] text-ink-muted">
            One parameter multiplies every road width stop. The hierarchy between road classes
            holds, because each class keeps its own stop values.
          </p>
        </Pane>

        <TabbedPane
          tabs={[
            { title: "layers/roads.exp", content: <Code source={source} /> },
            { title: "params/light/core.json", content: <Code source={params} lang="json" /> },
          ]}
        />

        <Pane title="style.json">
          <Code source={emitted} lang="json" />
        </Pane>
      </div>

      <Frame className="mt-4 h-[300px] md:h-[400px]">
        <LazyMap
          style={mapStyle}
          center={[21.0122, 52.2297]}
          zoom={13.6}
          label="Warsaw road network at the current road scale"
          className="size-full"
        />
      </Frame>
    </Section>
  );
}
