import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

type Props = {
  title: string;
  /** One paragraph. Sits opposite the title on a wide screen. */
  deck?: ReactNode;
  children: ReactNode;
  /** Second surface, so consecutive sections separate without a heavy rule. */
  alt?: boolean;
  id?: string;
  className?: string;
};

/** A titled band. The heading names what the section produces. */
export function Section({ title, deck, children, alt = false, id, className }: Props) {
  return (
    <section
      id={id}
      className={cn("border-t border-line", alt ? "bg-panel" : "bg-page", className)}
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 py-12 sm:px-8 md:py-16 lg:px-14">
        <div className="grid gap-x-14 gap-y-4 lg:grid-cols-[minmax(0,26ch)_minmax(0,1fr)]">
          <h2 className="font-sans text-[22px] leading-[1.15] font-semibold tracking-[-0.02em] text-ink md:text-[28px]">
            {title}
          </h2>
          {deck && (
            <p className="max-w-[70ch] text-[15px] leading-[1.65] text-ink-muted lg:pt-1">{deck}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export function Term({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[0.92em] text-ink">{children}</span>;
}
