/**
 * The masthead names the project and links to the source. It carries the same
 * tint tokens as everything else, so it restyles with the page.
 */
export function Masthead() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/90 backdrop-blur-[6px]">
      <div className="mx-auto flex w-full max-w-[1240px] items-center gap-4 px-5 py-2.5 sm:px-8 lg:px-14">
        <a
          href="#top"
          className="flex items-center gap-2 font-mono text-[13px] font-semibold tracking-[-0.01em] text-ink no-underline"
        >
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt=""
            width="18"
            height="18"
            className="shrink-0"
          />
          expressive
        </a>

        <a
          href="https://www.npmjs.com/package/@falseinput/expressive"
          target="_blank"
          rel="noreferrer"
          aria-label="Expressive on npm"
          className="ml-auto flex items-center gap-2 rounded px-1.5 py-1 font-mono text-[11px] text-ink-muted no-underline hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false" className="shrink-0">
            <path d="M0 8h24v7.5h-12V17H6.5v-1.5H0V8Zm1.5 6h2V9.5h1.5V14H6.5V9.5h1V14h1.5V8H1.5v6Zm9-6v7.5h3V14h3V8h-6Zm3 1.5h1.5V14H13.5V9.5ZM17 8v6h1.5V9.5H20V14h1V9.5h1.5V14H24V8h-7Z"/>
          </svg>
          <span className="hidden sm:inline">npm</span>
        </a>
        <a
          href="https://github.com/falseinput/expressive"
          target="_blank"
          rel="noreferrer"
          aria-label="Expressive on GitHub"
          className="flex items-center gap-2 rounded px-1.5 py-1 font-mono text-[11px] text-ink-muted no-underline hover:text-ink"
        >
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
            className="shrink-0"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          <span className="hidden sm:inline">github</span>
        </a>
      </div>
    </header>
  );
}
