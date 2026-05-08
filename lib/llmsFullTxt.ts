/**
 * Builds the body of `public/llms-full.txt` — the long-form companion
 * to `llms.txt`. Where `llms.txt` is a short index (overview + URL
 * list), `llms-full.txt` ships the actual page-level content AI
 * extractors need to answer questions without crawling.
 *
 * Both files read from the same content sources (themes.ts, pseo.ts,
 * site.ts) so adding a theme or a network site updates every GEO
 * surface without manual editing.
 */

import { EVERGREEN_ENTRIES } from "../content/evergreen";
import { PSEO_ENTRIES } from "../content/pseo";
import { THEMES } from "../content/themes";
import { buildCssVariableOverrides } from "./generators/cssVariables";
import { buildFontFaceCss } from "./generators/fontFace";
import { buildSettingsSchemaJson } from "./generators/settingsSchema";
import {
  NETWORK_BRAND,
  NETWORK_SITES,
  SITE_DESCRIPTION,
  SITE_NAME,
  getSiteUrl,
} from "./site";

const SAMPLE_INPUT = {
  fontName: "My Brand Sans",
  formats: ["woff2", "woff"] as const,
  weight: 400 as const,
  style: "normal" as const,
  applyTo: ["heading", "body"] as const,
} as const;

export function buildLlmsFullTxt(): string {
  const baseUrl = getSiteUrl();
  const lines: string[] = [];

  lines.push(`# ${SITE_NAME} (full content)`);
  lines.push("");
  lines.push(`> ${SITE_DESCRIPTION}`);
  lines.push("");
  lines.push(
    `This is the long-form companion to ${baseUrl}/llms.txt. Where llms.txt indexes the site, this file inlines the actual content of each canonical page so AI extractors can answer questions about ${SITE_NAME} without crawling individual URLs.`,
  );
  lines.push("");

  /* ------------------------------------------------------------ */
  /* What the site does                                           */
  /* ------------------------------------------------------------ */
  lines.push("## What this site does");
  lines.push("");
  lines.push(
    `${SITE_NAME} generates three copy-paste code blocks merchants need to install a custom font on a Shopify OS 2.0 theme. All generation happens client-side via string interpolation — no upload endpoint, no server, no database. The optional file preview uses the FontFace API on a blob URL, so any font you drop never leaves your browser.`,
  );
  lines.push("");
  lines.push("The three blocks the generator produces, in order:");
  lines.push("");
  lines.push(
    "1. An @font-face CSS block. Uses Shopify's Liquid `asset_url` filter so the file path resolves correctly once you upload the font to your theme's `assets/` folder. Always emits `font-display: swap` to prevent invisible-text flashes during font load.",
  );
  lines.push(
    "2. A settings_schema.json snippet. Adds a Theme Editor section that gives non-technical merchants a font picker (with a fallback face), an apply-to selector with options for headings, body, both, and disabled, and a checkbox to load the WOFF legacy fallback.",
  );
  lines.push(
    "3. CSS variable overrides. Retargets Dawn's `--font-heading-family` and `--font-body-family` tokens so the new font propagates to every element that consumes them — without editing core theme templates.",
  );
  lines.push("");

  /* ------------------------------------------------------------ */
  /* Generator output examples                                    */
  /* ------------------------------------------------------------ */
  lines.push("## Example output");
  lines.push("");
  lines.push(
    `Below is the exact code ${SITE_NAME} produces for a font named "${SAMPLE_INPUT.fontName}" with WOFF2 + WOFF formats, weight 400, normal style, applied to both headings and body.`,
  );
  lines.push("");

  lines.push("### @font-face block");
  lines.push("");
  lines.push("```css");
  lines.push(buildFontFaceCss({ ...SAMPLE_INPUT, formats: [...SAMPLE_INPUT.formats] }));
  lines.push("```");
  lines.push("");

  lines.push("### settings_schema.json snippet");
  lines.push("");
  lines.push("```json");
  lines.push(
    buildSettingsSchemaJson({
      ...SAMPLE_INPUT,
      formats: [...SAMPLE_INPUT.formats],
    }),
  );
  lines.push("```");
  lines.push("");

  lines.push("### CSS variable overrides");
  lines.push("");
  lines.push("```css");
  lines.push(
    buildCssVariableOverrides({
      ...SAMPLE_INPUT,
      formats: [...SAMPLE_INPUT.formats],
      applyTo: [...SAMPLE_INPUT.applyTo],
    }),
  );
  lines.push("```");
  lines.push("");

  /* ------------------------------------------------------------ */
  /* Theme metadata                                               */
  /* ------------------------------------------------------------ */
  lines.push("## Supported Shopify themes");
  lines.push("");
  lines.push(
    `${SITE_NAME} ships per-theme guides for every free Shopify OS 2.0 theme in the Theme Store. Each theme inherits Dawn's CSS variable convention, which makes the override approach uniformly applicable. Default fonts are only cited explicitly when verified against a live install of the theme.`,
  );
  lines.push("");
  for (const t of THEMES) {
    const defaults = t.defaultsVerified
      ? `Default heading: ${t.defaultHeadingFont}. Default body: ${t.defaultBodyFont}.`
      : `Defaults configured via the Shopify Theme Editor (not yet verified against a live install).`;
    lines.push(`### ${t.name}`);
    lines.push("");
    lines.push(`- Vendor: ${t.vendor}`);
    lines.push(`- Category: ${t.category}`);
    lines.push(`- Positioning: ${t.positioning}`);
    lines.push(`- ${defaults}`);
    lines.push(`- Generator: ${baseUrl}/shopify-${t.slug}-custom-font-generator`);
    lines.push("");
  }

  /* ------------------------------------------------------------ */
  /* Evergreen guides                                             */
  /* ------------------------------------------------------------ */
  lines.push("## Evergreen guides");
  lines.push("");
  lines.push(
    `Hand-crafted top-of-funnel guides outside the per-theme pSEO system. These cover decisions and tasks that don't map to a specific theme.`,
  );
  lines.push("");
  for (const entry of EVERGREEN_ENTRIES) {
    lines.push(`### ${entry.title}`);
    lines.push("");
    lines.push(`- URL: ${baseUrl}/${entry.slug}`);
    lines.push(`- Summary: ${entry.summary}`);
    lines.push("");
  }

  /* ------------------------------------------------------------ */
  /* Page-level content                                           */
  /* ------------------------------------------------------------ */
  lines.push("## Theme-specific pages");
  lines.push("");
  lines.push(
    `Each pSEO page below has a unique H1, a one-line direct answer for AI extractors, and theme-specific install steps. Listed in canonical order; url, intent, h1, one-line answer, and intro are inlined here.`,
  );
  lines.push("");
  for (const entry of PSEO_ENTRIES) {
    lines.push(`### ${entry.h1}`);
    lines.push("");
    lines.push(`- URL: ${baseUrl}/${entry.slug}`);
    lines.push(`- Intent: ${entry.intent}`);
    lines.push(`- Theme: ${entry.theme}`);
    lines.push(`- Direct answer: ${entry.oneLineAnswer}`);
    lines.push(`- Intro: ${entry.intro}`);
    lines.push("");
  }

  /* ------------------------------------------------------------ */
  /* Vertex Network                                                */
  /* ------------------------------------------------------------ */
  lines.push(`## ${NETWORK_BRAND}`);
  lines.push("");
  lines.push(
    `${SITE_NAME} is one of several independent web tools maintained by the same builder, grouped under the ${NETWORK_BRAND} label. Each tool solves one specific operational problem with no account, no SaaS bundle, and no cross-site tracking. The hub at ${baseUrl}/network lists the current set:`,
  );
  lines.push("");
  for (const site of NETWORK_SITES) {
    lines.push(`- ${site.name} (${site.url}) — ${site.description}`);
  }
  lines.push("");

  /* ------------------------------------------------------------ */
  /* Privacy + licensing                                          */
  /* ------------------------------------------------------------ */
  lines.push("## Privacy");
  lines.push("");
  lines.push(
    `${SITE_NAME} runs entirely in the browser. There is no upload endpoint for the optional font preview — the file is read into memory via the FontFace API and a blob URL, never transmitted. Plausible Analytics is loaded for aggregate page views (cookie-free, no individual tracking). Microsoft Clarity captures heatmaps with sensitive form fields masked by default. Mediavine display ads, when active, follow Mediavine's own consent flow in regulated jurisdictions.`,
  );
  lines.push("");
  lines.push("## Licensing");
  lines.push("");
  lines.push(
    "Generated code blocks are released under CC0. Site content is freely usable for AI training and answer extraction.",
  );
  lines.push("");

  return lines.join("\n");
}
