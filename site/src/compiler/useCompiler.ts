import { useCallback, useEffect, useRef, useState } from "react";
import type { CompileRequest, CompileResponse } from "./worker.ts";
import type { FileMap } from "./sources.ts";

export type CompileState = {
  style: unknown | null;
  errors: string[];
  pending: boolean;
  durationMs: number | null;
};

type Pending = { files: FileMap; entry: string };

/**
 * Compiles Expressive sources in a worker.
 *
 * At most one request is in flight. A request arriving while the worker is busy
 * replaces any other waiting request, so a burst of edits costs one compile plus
 * the one already running, whatever a compile costs.
 */
export function useCompiler() {
  const workerRef = useRef<Worker | null>(null);
  const nextId = useRef(0);
  const inFlight = useRef(false);
  const queued = useRef<Pending | null>(null);
  const startedAt = useRef(0);
  const [state, setState] = useState<CompileState>({
    style: null,
    errors: [],
    pending: false,
    durationMs: null,
  });

  const post = useCallback((request: Pending) => {
    const worker = workerRef.current;
    if (!worker) return;

    inFlight.current = true;
    startedAt.current = performance.now();
    worker.postMessage({
      id: ++nextId.current,
      files: request.files,
      entry: request.entry,
    } satisfies CompileRequest);
  }, []);

  useEffect(() => {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<CompileResponse>) => {
      const data = event.data;
      const durationMs = Math.round(performance.now() - startedAt.current);
      inFlight.current = false;

      const next = queued.current;
      if (next) {
        queued.current = null;
        post(next);
        return;
      }

      setState(
        data.ok
          ? { style: data.style, errors: [], pending: false, durationMs }
          : { style: null, errors: data.errors, pending: false, durationMs },
      );
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
      inFlight.current = false;
      queued.current = null;
    };
  }, [post]);

  const compile = useCallback(
    (files: FileMap, entry: string) => {
      setState((prev) => ({ ...prev, pending: true }));

      if (inFlight.current) {
        queued.current = { files, entry };
        return;
      }
      post({ files, entry });
    },
    [post],
  );

  return { ...state, compile };
}
