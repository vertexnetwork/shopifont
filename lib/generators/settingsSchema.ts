import type { GeneratorInput } from "./types";
import { slugify } from "./slugify";

/**
 * Build the JSON snippet that adds a typography section to a Shopify
 * theme's `config/settings_schema.json`.
 *
 * Output is a complete top-level array entry that the user pastes into
 * their settings_schema.json. Two pickers are included:
 *
 *   1. `font_picker` — Shopify's first-party Theme Editor control.
 *      Returns a `font_object` whose properties are accessed in Liquid
 *      via `{{ settings.custom_heading_font.family }}`. This is the
 *      preferred control because it inherits Theme Editor previews and
 *      avoids hard-coded strings.
 *
 *   2. A `select` fallback so merchants whose theme architecture pre-
 *      dates `font_picker` can still toggle the custom face on/off
 *      without editing Liquid.
 *
 * Because `settings_schema.json` is JSON-with-comments only inside
 * leading dummy entries, we emit pure JSON. Pretty-printed with two
 * spaces to match the Shopify CLI default.
 */
export function buildSettingsSchemaJson(input: GeneratorInput): string {
  if (!input.fontName.trim()) return "";
  const baseName = (input.fileBaseName ?? slugify(input.fontName)).trim();
  if (!baseName) return "";

  const idSlug = slugify(input.fontName).replace(/-/g, "_") || "custom";
  const sectionInfo =
    `Upload your ${input.fontName} files (woff2, woff, ttf, otf, or eot) ` +
    `to your theme's Assets folder. The @font-face block referencing ` +
    `${baseName}.* will then resolve via {{ '${baseName}.woff2' | asset_url }}.`;

  const block = {
    name: `${input.fontName} (custom font)`,
    settings: [
      {
        type: "header",
        content: `${input.fontName} typography`,
      },
      {
        type: "paragraph",
        content: sectionInfo,
      },
      {
        type: "font_picker",
        id: `${idSlug}_heading_font`,
        label: "Heading font (fallback when custom file is unavailable)",
        default: "assistant_n4",
      },
      {
        type: "font_picker",
        id: `${idSlug}_body_font`,
        label: "Body font (fallback when custom file is unavailable)",
        default: "assistant_n4",
      },
      {
        type: "select",
        id: `${idSlug}_apply_to`,
        label: `Apply ${input.fontName}`,
        options: [
          { value: "headings", label: "Headings only" },
          { value: "body", label: "Body only" },
          { value: "both", label: "Headings and body" },
          { value: "off", label: "Disabled" },
        ],
        default: "both",
      },
      {
        type: "checkbox",
        id: `${idSlug}_load_woff_fallback`,
        label: "Also load WOFF fallback (legacy browsers)",
        default: false,
      },
    ],
  };

  return JSON.stringify(block, null, 2);
}
