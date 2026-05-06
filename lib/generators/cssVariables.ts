import type { GeneratorInput } from "./types";

/**
 * Build the CSS-variable override block that retargets a Shopify OS 2.0
 * theme's typography roots to the user's custom font.
 *
 * Dawn (and Sense, Refresh, Crave, etc., which all derive from Dawn)
 * exposes typography tokens on `:root` like:
 *
 *   --font-heading-family
 *   --font-heading-style
 *   --font-heading-weight
 *   --font-body-family
 *   --font-body-style
 *   --font-body-weight
 *
 * Overriding these in a stylesheet that loads after `base.css` is the
 * cleanest way to swap typography without editing core theme files.
 *
 * The `applyTo` input narrows the override scope so a merchant who
 * only wants a custom heading face doesn't accidentally override body.
 */
export function buildCssVariableOverrides(input: GeneratorInput): string {
  if (!input.fontName.trim()) return "";

  const targets = new Set(input.applyTo ?? ["heading", "body"]);
  if (targets.size === 0) return "";

  const familyValue = `${JSON.stringify(input.fontName)}, sans-serif`;
  const lines: string[] = [":root {"];

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
