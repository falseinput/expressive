import { compile } from "@falseinput/expressive";
import type { FileMap } from "./sources.ts";

export type CompileRequest = { id: number; files: FileMap; entry: string };
export type CompileResponse =
  | { id: number; ok: true; style: unknown }
  | { id: number; ok: false; errors: string[] };

self.onmessage = (event: MessageEvent<CompileRequest>) => {
  const { id, files, entry } = event.data;
  const result = compile(files, entry);

  const response: CompileResponse = result.ok
    ? { id, ok: true, style: JSON.parse(result.json) }
    : {
        id,
        ok: false,
        errors: result.errorDetails.map(
          (e) => `${e.file.split("/").pop()}:${e.line}:${e.col} ${e.message}`,
        ),
      };

  self.postMessage(response);
};
