import { useEffect, useRef } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";

type Props = {
  style: StyleSpecification;
  center: [number, number];
  zoom: number;
  label: string;
  navigation?: boolean;
};

/**
 * One MapLibre map. The instance is created once and released on unmount, so a
 * parent can drop a map out of the tree to hand its WebGL context back. Later
 * styles arrive through `setStyle` with a diff, which keeps the tiles loaded.
 */
export function MapView({ style, center, zoom, label, navigation = false }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const first = useRef(style);

  useEffect(() => {
    if (!container.current) return;

    const instance = new maplibregl.Map({
      container: container.current,
      style: first.current,
      center,
      zoom,
      // The OpenFreeMap TileJSON carries the OpenStreetMap, OpenMapTiles, and
      // OpenFreeMap notices. Non-compact keeps them on screen at every width.
      attributionControl: { compact: false },
      cooperativeGestures: true,
    });
    if (navigation) instance.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current = instance;

    return () => {
      map.current = null;
      instance.remove();
    };
    // Position and controls are fixed per mount point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    map.current?.setStyle(style, { diff: true });
  }, [style]);

  return <div ref={container} className="size-full" role="img" aria-label={label} />;
}
