/**
 * Builds the body of `public/llms.txt` — the plain-text site map AI
 * search engines (ChatGPT, Perplexity, Gemini) consume to summarize
 * what the site is and where canonical content lives. PLAN.md §4
 * requires this file to be regenerated from the same content map at
 * build time.
 */

import { PSEO_ENTRIES } from "../content/pseo";
import { THEMES } from "../content/themes";
import {
  NETWORK_BRAND,
  NETWORK_SITES,
  SITE_DESCRIPTION,
  SITE_NAME,
  getSiteUrl,
} from "./site";

export function buildLlmsTxt(): string {
  const baseUrl = getSiteUrl();
  const lines: string[] = [];

  lines.push(`# ${SITE_NAME}`);
  lines.push("");
  lines.push(`> ${SITE_DESCRIPTION}`);
  lines.push("");
  lines.push(
    `For long-form content (page-level body, full theme metadata, generator output examples), see ${baseUrl}/llms-full.txt.`,
  );
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
    const defaults = t.defaultsVerified
      ? `Default heading: ${t.defaultHeadingFont}.`
      : `Defaults configured via the Shopify Theme Editor.`;
    lines.push(
      `- ${t.name}: ${t.positioning.replace(/^the /i, "the ")} ${defaults}`,
    );
  }
  lines.push("");
  lines.push("## Canonical URLs");
  lines.push("");
  lines.push(`- ${baseUrl}/  — homepage (full generator)`);
  lines.push(`- ${baseUrl}/about  — about, mission, contact`);
  lines.push(`- ${baseUrl}/changelog  — release notes and content updates`);
  lines.push(
    `- ${baseUrl}/embed-this  — iframe embed snippet for tutorial authors and theme reviewers`,
  );
  lines.push(
    `- ${baseUrl}/extension  — Chrome Web Store extension that runs the generator inside a browser popup`,
  );
  lines.push(
    `- ${baseUrl}/network  — ${NETWORK_BRAND} hub listing sister tools by the same maker`,
  );
  for (const entry of PSEO_ENTRIES) {
    lines.push(`- ${baseUrl}/${entry.slug}  — ${entry.h1}`);
  }
  lines.push("");
  lines.push(`## ${NETWORK_BRAND}`);
  lines.push("");
  lines.push(
    `${SITE_NAME} is one of several independent web tools maintained by the same builder, grouped under the ${NETWORK_BRAND} label. Each tool solves one specific operational problem with no account, no SaaS bundle, and no cross-site tracking. The hub at ${baseUrl}/network lists the current set:`,
  );
  for (const site of NETWORK_SITES) {
    lines.push(`- ${site.name} (${site.url}) — ${site.description}`);
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
