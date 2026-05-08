import { sortFormats, type GeneratorInput } from "./types";
import { slugify } from "./slugify";

/**
 * Build the JSON snippet that adds a typography section to a Shopify
 * theme's `config/settings_schema.json`.
 *
 * Output is a complete top-level array entry that the user pastes into
 * their settings_schema.json. The two `font_picker` controls are
 * deliberately labeled as Theme Editor *fallbacks*, not the install
 * path — the actual install is the @font-face block + the asset
 * uploads. Earlier copy ("Heading font (fallback when custom file is
 * unavailable)") confused merchants into thinking the picker WAS the
 * install path.
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
  const orderedFormats = sortFormats(input.formats);
  const formatList = orderedFormats.length > 0 ? orderedFormats.join(", ") : "woff2";
  // First format in the precedence list is what the merchant uploads
  // first; we cite it in the example asset_url so the instruction
  // matches the actual @font-face filename the merchant will see.
  const exampleFormat = orderedFormats[0] ?? "woff2";
  const sectionInfo =
    `Upload your ${input.fontName} files (${formatList}) ` +
    `to your theme's Assets folder. The @font-face block will resolve ` +
    `them via {{ '${baseName}.${exampleFormat}' | asset_url }}.`;

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
        label: "Native Theme Editor heading fallback (only used if you don't upload custom files)",
      },
      {
        type: "font_picker",
        id: `${idSlug}_body_font`,
        label: "Native Theme Editor body fallback (only used if you don't upload custom files)",
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
