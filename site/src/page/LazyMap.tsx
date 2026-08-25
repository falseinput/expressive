import { useEffect, useRef, useState } from "react";
import type { StyleSpecification } from "maplibre-gl";
import { MapView } from "@/map/MapView.tsx";
import { cn } from "@/lib/utils.ts";

type Props = {
  style: StyleSpecification | null;
  center: [number, number];
  zoom: number;
  label: string;
  navigation?: boolean;
  className?: string;
};

/**
 * Holds a map only while its section is near the viewport.
 *
 * Browsers cap the number of live WebGL contexts, and this page carries three
 * maps. Mounting at 700 px of margin creates a map just before it scrolls in,
 * and unmounting at the same boundary hands the context back once the section
 * is well away. The placeholder keeps the box the same height either way, so
 * nothing reflows as maps come and go.
 */
export function LazyMap({ style, center, zoom, label, navigation, className }: Props) {
  const holder = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = holder.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: "700px 0px 700px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={holder}
      className={cn("relative overflow-hidden bg-panel-2", className)}
      data-map-live={near && style ? "true" : "false"}
    >
      {near && style ? (
        <MapView
          style={style}
          center={center}
          zoom={zoom}
          label={label}
          navigation={navigation}
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <span className="font-mono text-[10.5px] text-ink-muted">
            {style ? "map loads as it scrolls in" : "compiling"}
          </span>
        </div>
      )}
    </div>
  );
}
