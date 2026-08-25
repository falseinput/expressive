import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

export type Tab = {
  /** The file the tab shows, in lower case. Doubles as the React key. */
  title: string;
  content: ReactNode;
};

type Props = {
  tabs: Tab[];
  className?: string;
  bodyClassName?: string;
};

/**
 * A pane whose header bar is a tab list, so one input file shows at a time and
 * the map below it stays in view. Arrow keys move between tabs and select as
 * they go, which is the pattern the reader already has from the browser.
 */
export function TabbedPane({ tabs, className, bodyClassName }: Props) {
  const base = useId();
  const [active, setActive] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const move = (to: number) => {
    const next = (to + tabs.length) % tabs.length;
    setActive(next);
    buttons.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    const to = keys[event.key];
    if (to === undefined) return;
    event.preventDefault();
    move(to);
  };

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-md border border-line bg-panel",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label="Input files"
        onKeyDown={onKeyDown}
        className="flex items-center gap-1 border-b border-line bg-panel-2 px-2 py-1"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.title}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            id={`${base}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-controls={`${base}-panel-${index}`}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            className={cn(
              "min-w-0 truncate rounded px-2 py-1 font-mono text-[10.5px] tracking-[0.04em]",
              index === active ? "bg-ink text-page" : "text-ink-muted hover:text-ink",
            )}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={tab.title}
          id={`${base}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${index}`}
          hidden={index !== active}
          className={cn("min-w-0 flex-1", index !== active && "hidden", bodyClassName)}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
