import { useCallback, useState } from "react";
import { compile as compileStyle } from "@falseinput/expressive";
import type { FileMap } from "./sources.ts";

export type CompileState = {
  style: unknown | null;
  errors: string[];
  durationMs: number | null;
};

/**
 * Compiles Expressive sources on the main thread.
 *
 * The Bright style compiles in well under 100 ms, and edits are debounced by the
 * caller, so a worker would add a second bundle and a round trip without keeping
 * any noticeable work off the main thread.
 */
export function useCompiler() {
  const [state, setState] = useState<CompileState>({
    style: null,
    errors: [],
    durationMs: null,
  });

  const compile = useCallback((files: FileMap, entry: string) => {
    const startedAt = performance.now();
    const result = compileStyle(files, entry);
    const style = result.ok ? JSON.parse(result.json) : null;
    const durationMs = Math.round(performance.now() - startedAt);

    setState(
      result.ok
        ? { style, errors: [], durationMs }
        : {
            style: null,
            errors: result.errorDetails.map(
              (e) => `${e.file.split("/").pop()}:${e.line}:${e.col} ${e.message}`,
            ),
            durationMs,
          },
    );
  }, []);

  return { ...state, compile };
}
