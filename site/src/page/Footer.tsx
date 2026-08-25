export function Footer() {
  return (
    <footer className="bg-page">
      <div className="mx-auto grid w-full max-w-[1240px] gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,72ch)_minmax(0,1fr)] lg:px-14">
        <div className="text-[12.5px] leading-[1.7] text-ink-muted">
          <p>
            Cartography derived from OSM Bright &copy;{" "}
            <a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer">
              OpenMapTiles
            </a>
            , licensed under CC BY 4.0. Tiles, sprites, and glyphs served by{" "}
            <a href="https://openfreemap.org/" target="_blank" rel="noreferrer">
              OpenFreeMap
            </a>
            .
          </p>
          <p className="mt-2">
            This project is not affiliated with OpenFreeMap or OpenMapTiles. The name refers to the
            upstream style this design derives from.
          </p>
        </div>

        <div className="flex flex-col gap-1 font-mono text-[11.5px] text-ink-muted lg:items-end">
          <a href="https://github.com/falseinput/expressive" target="_blank" rel="noreferrer">
            github.com/falseinput/expressive
          </a>
          <a
            href="https://marketplace.visualstudio.com/items?itemName=falseinput.expressive-language-support"
            target="_blank"
            rel="noreferrer"
          >
            VS Code extension
          </a>
          <span>Copyright (c) 2026 Zbigniew Matysek (falseinput)</span>
        </div>
      </div>
    </footer>
  );
}
