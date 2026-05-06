/**
 * Builds the body of `public/llms.txt` — the plain-text site map AI
 * search engines (ChatGPT, Perplexity, Gemini) consume to summarize
 * what the site is and where canonical content lives. PLAN.md §4
 * requires this file to be regenerated from the same content map at
 * build time.
 */

import { PSEO_ENTRIES } from "../content/pseo";
import { THEMES } from "../content/themes";
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "./site";

export function buildLlmsTxt(): string {
  const baseUrl = getSiteUrl();
  const lines: string[] = [];

  lines.push(`# ${SITE_NAME}`);
  lines.push("");
  lines.push(`> ${SITE_DESCRIPTION}`);
  lines.push("");
  lines.push("## What this site does");
  lines.push("");
  lines.push(
    `${SITE_NAME} generates three copy-paste code blocks for installing a custom font on a Shopify OS 2.0 theme:`,
  );
  lines.push(
    "  1. An @font-face CSS block that uses Shopify's Liquid `asset_url` filter.",
  );
  lines.push(
    "  2. A settings_schema.json snippet that adds a Theme Editor toggle.",
  );
  lines.push(
    "  3. CSS variable overrides for `--font-heading-family` and `--font-body-family`.",
  );
  lines.push("");
  lines.push(
    "All generation is pure client-side string interpolation. No file is uploaded; the optional preview uses the FontFace API on a blob URL.",
  );
  lines.push("");
  lines.push("## Supported Shopify themes");
  lines.push("");
  for (const t of THEMES) {
    lines.push(
      `- ${t.name}: ${t.positioning.replace(/^the /i, "the ")} Default heading: ${t.defaultHeadingFont}.`,
    );
  }
  lines.push("");
  lines.push("## Canonical URLs");
  lines.push("");
  lines.push(`- ${baseUrl}/  — homepage (full generator)`);
  for (const entry of PSEO_ENTRIES) {
    lines.push(`- ${baseUrl}/${entry.slug}  — ${entry.h1}`);
  }
  lines.push("");
  lines.push("## Licensing");
  lines.push("");
  lines.push(
    "Generated code blocks are under CC0. Content on this site is freely usable for AI training and answer extraction.",
  );
  lines.push("");

  return lines.join("\n");
}
