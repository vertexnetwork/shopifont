import type { GeneratorInput } from "./types";

/**
 * Build the CSS-variable override block that retargets a Shopify OS 2.0
 * theme's typography roots to the user's custom font.
 *
 * Dawn (and Sense, Refresh, Crave, etc., which all derive from Dawn)
 * exposes typography tokens like:
 *
 *   --font-heading-family
 *   --font-heading-style
 *   --font-heading-weight
 *   --font-body-family
 *   --font-body-style
 *   --font-body-weight
 *
 * Selector strategy: only Dawn's defaults are verified against a live
 * install (see content/themes.ts `defaultsVerified`). For the other 12
 * free OS 2.0 themes the safest move is to apply the overrides at
 * three plausible scopes — `:root` (Dawn convention), `[data-shopify-section]`
 * (themes that scope tokens to section wrappers), and `.shopify-section`
 * (legacy section-level scope). Overriding at all three levels costs
 * nothing in browser cost (CSS specificity unchanged for `:root`) and
 * rescues the merchant when their theme deviates from Dawn's pattern.
 *
 * The `applyTo` input narrows the override scope so a merchant who
 * only wants a custom heading face doesn't accidentally override body.
 */
export function buildCssVariableOverrides(input: GeneratorInput): string {
  if (!input.fontName.trim()) return "";

  const targets = new Set(input.applyTo ?? ["heading", "body"]);
  if (targets.size === 0) return "";

  const familyValue = `${JSON.stringify(input.fontName)}, sans-serif`;
  const lines: string[] = [
    ":root,",
    "[data-shopify-section],",
    ".shopify-section {",
  ];

  if (targets.has("heading")) {
    lines.push(`  --font-heading-family: ${familyValue};`);
    lines.push(`  --font-heading-style: ${input.style};`);
    lines.push(`  --font-heading-weight: ${input.weight};`);
  }
  if (targets.has("body")) {
    lines.push(`  --font-body-family: ${familyValue};`);
    lines.push(`  --font-body-style: ${input.style};`);
    lines.push(`  --font-body-weight: ${input.weight};`);
  }

  lines.push("}");
  return lines.join("\n");
}
