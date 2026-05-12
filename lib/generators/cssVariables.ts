import type { FontFamily, GeneratorInput } from "./types";

/**
 * Build the CSS-variable override block that retargets a Shopify OS 2.0
 * theme's typography roots.
 *
 * Single-family case (most merchants):
 *   - Primary family applies to one or both of `--font-heading-family`
 *     / `--font-body-family` per `input.applyTo`.
 *   - When variable, axis defaults are plumbed via
 *     `--font-heading-variation-settings` / `--font-body-variation-settings`.
 *
 * Two-family case (merchant added "Second family for headings"):
 *   - Primary handles BODY, secondary handles HEADING. `applyTo` is
 *     ignored — when the merchant opts into a secondary family, the
 *     intent is unambiguously "different fonts for headings vs body."
 *
 * Selector strategy is unchanged from the legacy generator: write to
 * `:root`, `[data-shopify-section]`, and `.shopify-section` so the
 * override survives the various scopes the non-Dawn themes use.
 */
export function buildCssVariableOverrides(input: GeneratorInput): string {
  const primary = input.primary;
  if (!primary.name.trim()) return "";

  const secondary = input.secondary;

  // Decide which family targets which role.
  let headingFamily: FontFamily | null = null;
  let bodyFamily: FontFamily | null = null;

  if (secondary && secondary.name.trim()) {
    headingFamily = secondary;
    bodyFamily = primary;
  } else {
    const wantsHeading = input.applyTo.includes("heading");
    const wantsBody = input.applyTo.includes("body");
    if (!wantsHeading && !wantsBody) return "";
    if (wantsHeading) headingFamily = primary;
    if (wantsBody) bodyFamily = primary;
  }

  if (!headingFamily && !bodyFamily) return "";

  const lines: string[] = [
    ":root,",
    "[data-shopify-section],",
    ".shopify-section {",
  ];

  if (headingFamily) {
    lines.push(...emitRole("heading", headingFamily));
  }
  if (bodyFamily) {
    lines.push(...emitRole("body", bodyFamily));
  }

  lines.push("}");
  return lines.join("\n");
}

function emitRole(role: "heading" | "body", family: FontFamily): string[] {
  const familyValue = `${JSON.stringify(family.name)}, sans-serif`;
  const out: string[] = [
    `  --font-${role}-family: ${familyValue};`,
    `  --font-${role}-style: ${family.faces[0]?.style ?? "normal"};`,
  ];

  if (family.isVariable && family.weightRange) {
    const [min, max] = family.weightRange;
    out.push(`  --font-${role}-weight: ${min};`);
    out.push(`  --font-${role}-weight-min: ${min};`);
    out.push(`  --font-${role}-weight-max: ${max};`);
    if (family.axes && family.axes.length > 0) {
      const settings = family.axes
        .map((a) => `"${a.tag}" ${a.value}`)
        .join(", ");
      out.push(`  --font-${role}-variation-settings: ${settings};`);
    }
  } else {
    out.push(`  --font-${role}-weight: ${family.faces[0]?.weight ?? 400};`);
  }

  return out;
}
