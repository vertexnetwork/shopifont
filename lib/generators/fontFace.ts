import {
  FORMAT_CSS_TOKEN,
  FORMAT_ORDER,
  type FontFormat,
  type GeneratorInput,
} from "./types";
import { slugify } from "./slugify";

/**
 * Build the @font-face CSS block.
 *
 * Output uses Shopify's Liquid `| asset_url` filter, which is the
 * idiomatic way to reference a file uploaded to a theme's `assets/`
 * directory. The Liquid is left as-is (Shopify renders it server-side
 * before serving the stylesheet).
 *
 * Format ordering matters: browsers stop at the first format they can
 * decode, so we always emit WOFF2 first when selected.
 */
export function buildFontFaceCss(input: GeneratorInput): string {
  if (!input.fontName.trim()) return "";
  const orderedFormats = sortFormats(input.formats);
  if (orderedFormats.length === 0) return "";

  const baseName = (input.fileBaseName ?? slugify(input.fontName)).trim();
  if (!baseName) return "";

  const srcLines = orderedFormats.map((fmt, idx) => {
    const liquid = `{{ '${baseName}.${fmt}' | asset_url }}`;
    const isLast = idx === orderedFormats.length - 1;
    return `       url(${liquid}) format('${FORMAT_CSS_TOKEN[fmt]}')${isLast ? ";" : ","}`;
  });

  // Quote font-family to support multi-word display names safely.
  const familyName = JSON.stringify(input.fontName);

  return [
    `@font-face {`,
    `  font-family: ${familyName};`,
    `  src: ${srcLines.join("\n").trimStart()}`,
    `  font-weight: ${input.weight};`,
    `  font-style: ${input.style};`,
    `  font-display: swap;`,
    `}`,
  ].join("\n");
}

function sortFormats(
  formats: ReadonlyArray<FontFormat>,
): ReadonlyArray<FontFormat> {
  const set = new Set(formats);
  return FORMAT_ORDER.filter((f) => set.has(f));
}
