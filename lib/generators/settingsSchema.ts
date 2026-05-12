import {
  sortFormats,
  type FontFamily,
  type GeneratorInput,
} from "./types";
import { slugify } from "./slugify";

/**
 * Build the JSON snippet for `config/settings_schema.json`.
 *
 * When the merchant only has a primary family, output is a single
 * top-level array entry. When a secondary family is set, we emit TWO
 * top-level entries (one per family) so each gets its own Theme Editor
 * section. The merchant pastes the entire output verbatim into the
 * settings_schema.json array.
 *
 * Per the locked UX: each family renders ONE `font_picker` (native
 * Theme Editor fallback only) plus a "Use this font for both headings
 * and body" checkbox + an apply-target select that activates when the
 * checkbox is unchecked.
 */
export function buildSettingsSchemaJson(input: GeneratorInput): string {
  if (!input.primary.name.trim()) return "";

  const sections: ReadonlyArray<unknown> = input.secondary
    ? [
        buildFamilySection(input.primary, "primary"),
        buildFamilySection(input.secondary, "secondary"),
      ]
    : [buildFamilySection(input.primary, "primary")];

  // Single section serializes as one top-level entry (back-compat with
  // the legacy generator's output shape). Two sections serialize as a
  // JSON array of entries so the merchant can paste both at once.
  if (sections.length === 1) return JSON.stringify(sections[0], null, 2);
  return JSON.stringify(sections, null, 2);
}

function buildFamilySection(
  family: FontFamily,
  role: "primary" | "secondary",
): unknown {
  const idSlug = slugify(family.name).replace(/-/g, "_") || "custom";

  // Re-derive the asset filename used in the explanatory paragraph.
  // Multi-face families have several uploads, but for the section copy
  // we cite the FIRST face's filename + format so the merchant sees a
  // concrete `asset_url` example. The face-level filename override
  // (when set) wins so the example matches the merchant's actual upload.
  const firstFace = family.faces[0];
  const baseSlug = family.fileBaseName?.trim() || slugify(family.name);
  const exampleStem =
    firstFace?.filenameOverride?.trim() ??
    (family.faces.length > 1 && firstFace
      ? `${baseSlug}-${firstFace.weight}${firstFace.style === "italic" ? "-italic" : ""}`
      : family.isVariable
        ? `${baseSlug}-variable`
        : baseSlug);
  const orderedFormats = firstFace ? sortFormats(firstFace.formats) : [];
  const formatList = orderedFormats.length > 0 ? orderedFormats.join(", ") : "woff2";
  const exampleFormat = orderedFormats[0] ?? "woff2";

  const faceCount = family.faces.length;
  const faceCopy = family.isVariable
    ? "one variable font file"
    : faceCount > 1
      ? `${faceCount} font files (one per weight/style — see filenames listed in the @font-face block)`
      : "your font file";

  const sectionInfo =
    `Upload ${faceCopy} (${formatList}) to your theme's Assets folder. ` +
    `The @font-face block will resolve them via {{ '${exampleStem}.${exampleFormat}' | asset_url }}.`;

  const displayHelp =
    `font-display strategy: ${family.displayStrategy} — controls how text renders ` +
    `while the font file is downloading. "swap" is the recommended default.`;

  return {
    name: `${family.name} (${role === "primary" ? "primary" : "secondary"} custom font)`,
    settings: [
      {
        type: "header",
        content: `${family.name} typography`,
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
        type: "checkbox",
        id: `${idSlug}_use_for_both`,
        label: "Use this font for both headings and body",
        default: true,
      },
      {
        type: "select",
        id: `${idSlug}_apply_to`,
        label: `Apply ${family.name} (only used when "Use this font for both" is unchecked)`,
        options: [
          { value: "headings", label: "Headings only" },
          { value: "body", label: "Body only" },
          { value: "both", label: "Headings and body" },
          { value: "off", label: "Disabled" },
        ],
        default: "both",
      },
      {
        type: "paragraph",
        content: displayHelp,
      },
      {
        type: "checkbox",
        id: `${idSlug}_load_woff_fallback`,
        label: "Also load WOFF fallback (legacy browsers)",
        default: false,
      },
    ],
  };
}
