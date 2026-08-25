/**
 * Fetches the style the page renders. The page compiles it in the browser, so
 * the sources are needed at build time.
 */
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

const REPO = "https://github.com/falseinput/openfreemap-expressive.git";
const REF = process.env.STYLE_REF ?? "main";
const target = path.join(import.meta.dirname, "..", "styles-src");

if (existsSync(target)) {
  if (process.env.STYLE_REFRESH !== "1") {
    console.log(`style present at ${path.relative(process.cwd(), target)}, set STYLE_REFRESH=1 to replace it`);
    process.exit(0);
  }
  rmSync(target, { recursive: true, force: true });
}

execFileSync("git", ["clone", "--depth", "1", "--branch", REF, REPO, target], { stdio: "inherit" });
console.log(`style fetched at ${REF}`);
