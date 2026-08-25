import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

type PaneProps = {
  /** The file the pane shows, in lower case. */
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function Pane({ title, children, className, bodyClassName }: PaneProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-md border border-line bg-panel",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-line bg-panel-2 px-4 py-2">
        <span className="truncate font-mono text-[10.5px] tracking-[0.04em] text-ink">{title}</span>
      </div>
      <div className={cn("min-w-0 flex-1", bodyClassName)}>{children}</div>
    </div>
  );
}

/** A framed box with no header bar, for maps. */
export function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-md border border-line bg-panel", className)}>
      {children}
    </div>
  );
}
