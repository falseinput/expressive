import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StyleSpecification } from "maplibre-gl";
import { useCompiler } from "./compiler/useCompiler.ts";
import { entry, paramPaths, sources } from "./compiler/sources.ts";
import { applyOverrides, parseParams, type ParamValue } from "./params/model.ts";
import { Footer } from "./page/Footer.tsx";
import { Hero } from "./page/Hero.tsx";
import { Masthead } from "./page/Masthead.tsx";
import { applyTints, deriveTints } from "./page/theme.ts";
import { ColorSection } from "./page/sections/ColorSection.tsx";
import { Studio, type Tier } from "./page/sections/Studio.tsx";
import {
  Composition,
  Diagnostics,
  Conditionals,
  Expressions,
  Toolchain,
} from "./page/sections/StaticSections.tsx";
import { ZoomSection } from "./page/sections/ZoomSection.tsx";

export default function App() {
  const [tier, setTier] = useState<Tier>("core");
  const [overrides, setOverrides] = useState<Record<string, ParamValue>>({});
  const { style, errors, pending, durationMs, compile } = useCompiler();

  const ready = Boolean(sources[paramPaths.core] && sources[entry]);

  const params = useMemo(() => {
    if (!ready) return {};
    return {
      ...parseParams(sources[paramPaths.core]),
      ...parseParams(sources[paramPaths.detail] ?? "{}"),
    };
  }, [ready]);

  const files = useMemo(() => {
    if (!ready) return null;
    const next = { ...sources };
    for (const path of [paramPaths.core, paramPaths.detail]) {
      if (next[path]) next[path] = applyOverrides(next[path], overrides);
    }
    return next;
  }, [ready, overrides]);

  useEffect(() => {
    if (!files) return;
    const timer = setTimeout(() => compile(files, entry), 120);
    return () => clearTimeout(timer);
  }, [files, compile]);

  // A compile error clears the style. The maps keep the last style that
  // compiled, so a bad intermediate state never tears the page down.
  const lastGood = useRef<unknown>(null);
  if (style) lastGood.current = style;
  const shown = style ?? lastGood.current;

  // The signature: page surfaces come out of the same compiled JSON MapLibre
  // reads, clamped and contrast-checked on the way in.
  useEffect(() => {
    applyTints(deriveTints(shown));
  }, [shown]);

  const setParam = useCallback((name: string, value: ParamValue) => {
    setOverrides((prev) => ({ ...prev, [name]: value }));
  }, []);

  const tierKeys = useMemo(() => {
    if (!ready) return [];
    const source = tier === "core" ? sources[paramPaths.core] : sources[paramPaths.detail];
    return source ? Object.keys(parseParams(source)) : [];
  }, [ready, tier]);

  const paletteHue = (overrides.paletteHue ?? params.paletteHue?.value ?? 0) as number;
  const paletteSaturation = (overrides.paletteSaturation ??
    params.paletteSaturation?.value ??
    1) as number;
  const paletteLightness = (overrides.paletteLightness ??
    params.paletteLightness?.value ??
    0) as number;
  const roadScale = (overrides.roadScale ?? params.roadScale?.value ?? 1) as number;
  const mapStyle = (shown as StyleSpecification | null) ?? null;

  return (
    <div className="retint min-h-screen bg-page text-ink">
      <Masthead />

      <main>
        <Hero />

        <Expressions />

        <ColorSection
          hue={paletteHue}
          saturation={paletteSaturation}
          lightness={paletteLightness}
          onHue={(value) => setParam("paletteHue", value)}
          onSaturation={(value) => setParam("paletteSaturation", value)}
          onLightness={(value) => setParam("paletteLightness", value)}
          style={shown}
          mapStyle={mapStyle}
        />

        <ZoomSection
          roadScale={roadScale}
          onRoadScale={(value) => setParam("roadScale", value)}
          mapStyle={mapStyle}
        />

        <Conditionals />

        <Composition />

        <Diagnostics />

        <Toolchain />

        <Studio
          tier={tier}
          onTier={setTier}
          keys={tierKeys}
          params={params}
          overrides={overrides}
          onChange={setParam}
          onReset={() => setOverrides({})}
          pending={pending}
          durationMs={durationMs}
          errors={errors}
          mapStyle={mapStyle}
        />
      </main>

      <Footer />
    </div>
  );
}
