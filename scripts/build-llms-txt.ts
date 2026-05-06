/**
 * Prebuild script. Writes `public/llms.txt` from the content map so the
 * file ships in the static export and stays in sync with the pSEO
 * pages (PLAN.md §4).
 *
 * Runs via `npm run prebuild`, which next.js auto-invokes before
 * `next build`. Also safe to run manually.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildLlmsTxt } from "../lib/llmsTxt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const target = resolve(projectRoot, "public", "llms.txt");

const body = buildLlmsTxt();
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, body, "utf8");

const lineCount = body.split("\n").length;
console.log(
  `[build-llms-txt] wrote ${target} (${body.length} bytes, ${lineCount} lines)`,
);
