/**
 * A code pane. `tokenize.ts` classifies the source, and a function token that
 * has a definition renders as a hover trigger rather than a plain span.
 */
import { Fragment, type ReactNode } from "react";
import { FunctionToken } from "./FunctionHover.tsx";
import { CLASS, segments, tokenize } from "./tokenize.ts";

export { mark, squiggle } from "./tokenize.ts";

type Props = {
  source: string;
  lang?: "exp" | "json";
  className?: string;
};

export function Code({ source, lang = "exp", className }: Props) {
  const nodes: ReactNode[] = [];
  let key = 0;

  for (const segment of segments(source)) {
    const tokens = tokenize(segment.text, lang === "exp");
    const painted = tokens.map((token) =>
      token.doc ? (
        <FunctionToken key={(key += 1)} name={token.text} doc={token.doc} />
      ) : (
        <span key={(key += 1)} className={CLASS[token.kind]}>
          {token.text}
        </span>
      ),
    );
    const run = segment.squiggled ? (
      <span
        key={(key += 1)}
        className="decoration-[color:var(--tok-err)] decoration-wavy underline-offset-[4px] [text-decoration-line:underline] [text-decoration-skip-ink:none]"
      >
        {painted}
      </span>
    ) : (
      painted
    );

    nodes.push(
      segment.marked ? (
        <mark
          key={(key += 1)}
          className="rounded-[3px] bg-mark px-[3px] py-[1px] text-mark-ink [&_*]:text-mark-ink"
        >
          {run}
        </mark>
      ) : (
        <Fragment key={(key += 1)}>{run}</Fragment>
      ),
    );
  }

  return (
    <pre
      className={`pane-scroll m-0 px-4 py-3.5 font-mono text-[12px] leading-[1.75] ${className ?? ""}`}
    >
      <code>{nodes}</code>
    </pre>
  );
}
