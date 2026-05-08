/**
 * Prebuild script. Writes `public/llms-full.txt` from the same content
 * sources llms.txt uses, but with the page-level body inlined so AI
 * extractors don't need to crawl individual URLs.
 *
 * Runs via `npm run prebuild` alongside the llms.txt and changelog
 * builders. Also safe to run manually.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildLlmsFullTxt } from "../lib/llmsFullTxt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const target = resolve(projectRoot, "public", "llms-full.txt");

const body = buildLlmsFullTxt();
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, body, "utf8");

const lineCount = body.split("\n").length;
console.log(
  `[build-llms-full-txt] wrote ${target} (${body.length} bytes, ${lineCount} lines)`,
);
