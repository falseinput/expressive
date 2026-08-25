/**
 * The hover a function token carries, laid out the way the VS Code extension
 * lays a hover out: the signature, then the description. `functionDocs.ts`
 * holds the text.
 *
 * The tooltip renders into a portal on `document.body`, because a pane clips
 * its own overflow and a code pane scrolls sideways inside that. The portal
 * carries `retint`, so the tooltip follows the palette with the rest of the
 * page.
 */
import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FUNCTION_DOCS } from "./functionDocs.ts";
import { CLASS, tokenize } from "./tokenize.ts";

/** Space between the token and the tooltip. */
const GAP = 8;
/** Smallest distance the tooltip keeps from a viewport edge. */
const MARGIN = 8;

type Documentation = { signature: string; description: string };

/**
 * Reads the two blocks the formatter emits: a fenced `expressive` block holding
 * the signature, then the description.
 */
function parse(markdown: string): Documentation {
  const lines = markdown.split("\n");
  const signature: string[] = [];
  let index = 0;

  if (lines[0]?.startsWith("```")) {
    index = 1;
    while (index < lines.length && !lines[index].startsWith("```")) {
      signature.push(lines[index]);
      index += 1;
    }
    index += 1;
  }

  return { signature: signature.join("\n"), description: lines.slice(index).join("\n").trim() };
}

/** Paints the backticked runs in a description as code. */
function withInlineCode(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, position) =>
    part.length > 2 && part.startsWith("`") && part.endsWith("`") ? (
      <code key={position} className="rounded-[3px] bg-panel-2 px-1 font-mono text-[11.5px]">
        {part.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={position}>{part}</Fragment>
    ),
  );
}

type Position = { left: number; top: number };

/** Dismisses the tooltip that is showing, so one token holds the page at a time. */
let dismissOther: (() => void) | null = null;

type Props = {
  /** The token as it appears in the pane. */
  name: string;
  /** Key into `FUNCTION_DOCS`. */
  doc: string;
};

/**
 * A function token that reveals its definition. A pointer reveals it on hover,
 * the keyboard on focus, and a touch device on tap, which is the only gesture
 * a phone has for this. Escape, a blur, or a press outside dismisses it.
 */
export function FunctionToken({ name, doc }: Props) {
  const tooltipId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  /** Set by Escape, so the focus the trigger keeps holds the tooltip closed. */
  const escaped = useRef(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const { signature, description } = parse(FUNCTION_DOCS[doc]);

  const hide = useCallback(() => {
    if (dismissOther === hide) dismissOther = null;
    setOpen(false);
  }, []);

  const show = useCallback(() => {
    if (dismissOther !== hide) dismissOther?.();
    dismissOther = hide;
    setOpen(true);
  }, [hide]);

  /**
   * Centres the tooltip over the token, then pulls it inside the viewport.
   * Above the token by default, below it when the top of the window is closer
   * than the tooltip is tall.
   */
  const reposition = useCallback(() => {
    const token = trigger.current;
    const panel = tooltip.current;
    if (!token || !panel) return;

    const anchor = token.getBoundingClientRect();
    const { width, height } = panel.getBoundingClientRect();
    const room = Math.max(MARGIN, window.innerWidth - width - MARGIN);
    const left = Math.min(Math.max(anchor.left + anchor.width / 2 - width / 2, MARGIN), room);
    const above = anchor.top - height - GAP;
    const top = above < MARGIN ? anchor.bottom + GAP : above;

    setPosition({ left, top });
  }, []);

  useLayoutEffect(() => {
    if (open) reposition();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;

    const follow = () => reposition();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      escaped.current = true;
      hide();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node)) hide();
    };

    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, reposition, hide]);

  useEffect(() => hide, [hide]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-describedby={tooltipId}
        onPointerEnter={(event) => {
          if (event.pointerType !== "mouse") return;
          escaped.current = false;
          show();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          escaped.current = false;
          if (document.activeElement !== trigger.current) hide();
        }}
        onFocus={(event) => {
          if (!escaped.current && event.currentTarget.matches(":focus-visible")) show();
        }}
        onBlur={() => {
          escaped.current = false;
          hide();
        }}
        onClick={() => {
          escaped.current = false;
          if (open) hide();
          else show();
        }}
        className="m-0 inline cursor-help rounded-[2px] border-0 bg-transparent p-0 text-[var(--tok-fn)] underline decoration-dotted underline-offset-[3px] [font:inherit] [text-decoration-color:color-mix(in_srgb,var(--tok-fn)_45%,transparent)]"
      >
        {name}
      </button>

      {createPortal(
        <div
          ref={tooltip}
          id={tooltipId}
          role="tooltip"
          hidden={!open}
          style={{ left: position?.left ?? 0, top: position?.top ?? 0 }}
          className="retint pointer-events-none fixed z-50 w-max max-w-[min(360px,calc(100vw-16px))] overflow-hidden rounded-md border border-line-strong bg-control text-ink shadow-[0_10px_28px_rgb(0_0_0/0.18)]"
        >
          <pre className="m-0 overflow-x-auto border-b border-line bg-panel-2 px-3 py-2 font-mono text-[12px] leading-[1.6]">
            <code>
              {tokenize(signature, false).map((token, position) => (
                <span key={position} className={CLASS[token.kind]}>
                  {token.text}
                </span>
              ))}
            </code>
          </pre>
          <p className="m-0 px-3 py-2 text-[12.5px] leading-[1.55] text-ink-muted">
            {withInlineCode(description)}
          </p>
        </div>,
        document.body,
      )}
    </>
  );
}
