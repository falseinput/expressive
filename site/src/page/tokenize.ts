/**
 * A tokeniser for the Expressive subset this page shows, and for the JSON it
 * emits. Roughly 90 lines instead of an editor bundle, because the panes are
 * read only: a knob writes the literals, so nothing here has to survive
 * arbitrary input.
 *
 * Wrap a literal in `mark()` to tint it as knob-written. Marks split the source
 * before tokenising, and every marked literal is a complete token, so the two
 * passes never disagree.
 */
import { FUNCTION_DOCS } from "./functionDocs.ts";

const MARK_OPEN = "‹";
const MARK_CLOSE = "›";

/** Marks a literal as written by a knob. */
export function mark(text: string | number): string {
  return `${MARK_OPEN}${text}${MARK_CLOSE}`;
}

export type Kind = "kw" | "fn" | "ns" | "st" | "nu" | "cm" | "pu" | "id" | "ws";

export type Token = {
  kind: Kind;
  text: string;
  /** Key into `FUNCTION_DOCS`, on a function token that has hover text. */
  doc?: string;
};

const KEYWORDS = new Set(["when", "import", "else", "true", "false", "null"]);

export const CLASS: Record<Kind, string> = {
  kw: "text-[var(--tok-kw)]",
  fn: "text-[var(--tok-fn)]",
  ns: "text-ink-muted",
  st: "text-[var(--tok-st)]",
  nu: "text-[var(--tok-nu)]",
  cm: "text-[var(--tok-cm)] italic",
  pu: "text-ink-muted",
  id: "text-ink",
  ws: "",
};

/**
 * Names the definition a function token stands for. A call written after
 * `std.` resolves in the standard library, and every other call resolves as a
 * bare built-in, which is how the language server reads the same two cases.
 */
function documentationKey(tokens: Token[], word: string): string | undefined {
  const previous = tokens[tokens.length - 1];
  const beforeThat = tokens[tokens.length - 2];
  const namespaced =
    previous?.kind === "pu" &&
    previous.text === "." &&
    beforeThat?.kind === "ns" &&
    beforeThat.text === "std";
  const key = namespaced ? `std.${word}` : word;

  return key in FUNCTION_DOCS ? key : undefined;
}

export function tokenize(source: string, comments: boolean): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (comments && char === "/" && source[index + 1] === "/") {
      const stop = source.indexOf("\n", index);
      const end = stop === -1 ? source.length : stop;
      tokens.push({ kind: "cm", text: source.slice(index, end) });
      index = end;
      continue;
    }

    if (/\s/.test(char)) {
      let end = index;
      while (end < source.length && /\s/.test(source[end])) end += 1;
      tokens.push({ kind: "ws", text: source.slice(index, end) });
      index = end;
      continue;
    }

    if (char === '"') {
      let end = index + 1;
      while (end < source.length && source[end] !== '"') {
        if (source[end] === "\\") end += 1;
        end += 1;
      }
      end = Math.min(end + 1, source.length);
      tokens.push({ kind: "st", text: source.slice(index, end) });
      index = end;
      continue;
    }

    if (/[0-9]/.test(char) || (char === "." && /[0-9]/.test(source[index + 1] ?? ""))) {
      let end = index;
      while (end < source.length && /[0-9.]/.test(source[end])) end += 1;
      tokens.push({ kind: "nu", text: source.slice(index, end) });
      index = end;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      let end = index;
      while (end < source.length && /[A-Za-z0-9_]/.test(source[end])) end += 1;
      const word = source.slice(index, end);
      const kind: Kind = KEYWORDS.has(word)
        ? "kw"
        : word === "std"
          ? "ns"
          : source[end] === "("
            ? "fn"
            : "id";
      tokens.push(
        kind === "fn" ? { kind, text: word, doc: documentationKey(tokens, word) } : { kind, text: word },
      );
      index = end;
      continue;
    }

    let end = index;
    while (end < source.length && /[^A-Za-z0-9_"\s]/.test(source[end])) {
      if (comments && source[end] === "/" && source[end + 1] === "/") break;
      end += 1;
    }
    if (end === index) end = index + 1;
    tokens.push({ kind: "pu", text: source.slice(index, end) });
    index = end;
  }

  return tokens;
}

/** Splits a source into runs, flagging the ones a knob wrote. */
export function segments(source: string): Array<{ text: string; marked: boolean }> {
  return source
    .split(MARK_OPEN)
    .flatMap((chunk, position) => {
      if (position === 0) return [{ text: chunk, marked: false }];
      const [inside, ...rest] = chunk.split(MARK_CLOSE);
      return [
        { text: inside, marked: true },
        { text: rest.join(MARK_CLOSE), marked: false },
      ];
    })
    .filter((segment) => segment.text.length > 0);
}
