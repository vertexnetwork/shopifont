import {
  FORMAT_CSS_TOKEN,
  resolveUnicodeRange,
  sortFormats,
  type FontFace,
  type FontFamily,
  type GeneratorInput,
} from "./types";
import { slugify } from "./slugify";

/**
 * Build the `@font-face` CSS block(s). Emits one block per face per
 * family; both primary and secondary families render in order.
 *
 * Family-level descriptors emitted (when present):
 *   - `font-display`               — per-family strategy (default swap)
 *   - `size-adjust`                — fallback metric matching
 *   - `ascent-override`            — fallback metric matching
 *   - `descent-override`           — fallback metric matching
 *   - `line-gap-override`          — fallback metric matching
 *   - `font-feature-settings`      — OpenType feature toggles
 *
 * Face-level descriptors emitted (when present):
 *   - `font-weight`                — fixed integer or variable range
 *   - `font-style`                 — `normal` or `italic`
 *   - `unicode-range`              — preset or custom subset
 *
 * `src:` precedence — `local('Name')` entries first (when supplied),
 * then the URL stack in WOFF2 → WOFF → TTF → OTF → EOT order.
 *
 * Liquid: the URL stack uses Shopify's `{{ '<filename>' | asset_url }}`
 * filter so the merchant uploads files to the theme's `assets/` folder
 * and the path resolves at render time.
 */
export function buildFontFaceCss(input: GeneratorInput): string {
  const familyBlocks: string[] = [];

  for (const family of familiesFrom(input)) {
    const familyBlock = renderFamily(family);
    if (familyBlock) familyBlocks.push(familyBlock);
  }

  return familyBlocks.join("\n\n");
}

function familiesFrom(input: GeneratorInput): ReadonlyArray<FontFamily> {
  return input.secondary ? [input.primary, input.secondary] : [input.primary];
}

function renderFamily(family: FontFamily): string {
  if (!family.name.trim()) return "";
  if (family.faces.length === 0) return "";

  const blocks: string[] = [];
  for (const face of family.faces) {
    const block = renderFace(face, family);
    if (block) blocks.push(block);
  }
  return blocks.join("\n\n");
}

function renderFace(face: FontFace, family: FontFamily): string {
  const orderedFormats = sortFormats(face.formats);
  if (orderedFormats.length === 0) return "";

  const fileStem = resolveFilename(face, family);
  if (!fileStem) return "";

  const familyName = JSON.stringify(family.name);
  const lines: string[] = [
    "@font-face {",
    `  font-family: ${familyName};`,
  ];

  // src: stack — local() first (when supplied), then asset_url URLs.
  const srcLines: string[] = [];
  if (face.localNames && face.localNames.length > 0) {
    for (const local of face.localNames) {
      const safe = JSON.stringify(local);
      srcLines.push(`local(${safe})`);
    }
  }
  for (const fmt of orderedFormats) {
    const liquid = `{{ '${fileStem}.${fmt}' | asset_url }}`;
    srcLines.push(`url(${liquid}) format('${FORMAT_CSS_TOKEN[fmt]}')`);
  }

  // Indent + comma-join the src stack across multiple lines, semicolon
  // on the last entry only. Preserves the existing rendering tests'
  // assertion that the FINAL src line ends with a `;` and the
  // intermediate ones end with `,`.
  lines.push(`  src: ${srcLines[0]}${srcLines.length > 1 ? "," : ";"}`);
  for (let i = 1; i < srcLines.length; i++) {
    const isLast = i === srcLines.length - 1;
    lines.push(`       ${srcLines[i]}${isLast ? ";" : ","}`);
  }

  // font-weight — fixed or variable range.
  if (family.isVariable && family.weightRange) {
    const [min, max] = family.weightRange;
    lines.push(`  font-weight: ${min} ${max};`);
  } else {
    lines.push(`  font-weight: ${face.weight};`);
  }

  // font-style.
  lines.push(`  font-style: ${face.style};`);

  // font-display.
  lines.push(`  font-display: ${family.displayStrategy};`);

  // Optional family-level descriptors.
  if (family.sizeAdjust)
    lines.push(`  size-adjust: ${family.sizeAdjust};`);
  if (family.ascentOverride)
    lines.push(`  ascent-override: ${family.ascentOverride};`);
  if (family.descentOverride)
    lines.push(`  descent-override: ${family.descentOverride};`);
  if (family.lineGapOverride)
    lines.push(`  line-gap-override: ${family.lineGapOverride};`);
  if (family.featureSettings && family.featureSettings.length > 0) {
    lines.push(
      `  font-feature-settings: ${family.featureSettings.join(", ")};`,
    );
  }

  // unicode-range (face-level).
  const range = resolveUnicodeRange(face);
  if (range) lines.push(`  unicode-range: ${range};`);

  lines.push("}");
  return lines.join("\n");
}

/**
 * Resolve the filename stem for a face. Merchants don't have to rename
 * their files — they can either accept the default (which uses our
 * `{slug}-{weight}{italic?}` pattern when multiple faces exist) or
 * override per-face via `face.filenameOverride`.
 */
function resolveFilename(face: FontFace, family: FontFamily): string | null {
  if (face.filenameOverride?.trim()) return face.filenameOverride.trim();

  const baseName = family.fileBaseName?.trim() || slugify(family.name);
  if (!baseName) return null;

  // Single face → bare baseName for backward-compat with old shared
  // URLs that point at `mybrand.woff2` etc.
  if (family.faces.length === 1 && !family.isVariable) return baseName;

  if (family.isVariable) {
    // Variable face naming: the merchant typically ships a single
    // variable file — `{baseName}-variable.woff2`. Italic gets its own
    // file by convention. Filename can still be overridden per-face.
    return face.style === "italic"
      ? `${baseName}-variable-italic`
      : `${baseName}-variable`;
  }

  const italicSuffix = face.style === "italic" ? "-italic" : "";
  return `${baseName}-${face.weight}${italicSuffix}`;
}
