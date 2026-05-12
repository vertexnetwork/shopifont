/**
 * Generator input types. Family-centric — a single paste can carry
 * multiple faces of one family (Regular + Bold + Italic + Bold Italic)
 * and optionally a separate secondary family for headings.
 *
 * The legacy single-face shape `SimpleGeneratorInput` is preserved so
 * external callers (prebuild llms-full builder, URL hydration with old
 * shared links) can keep working through `legacyAdapter.ts`.
 *
 * Design promise: the default state of `GeneratorInput` (single face,
 * weight 400, normal, woff2, font-display swap, no advanced options)
 * MUST emit byte-for-byte identical output to the legacy generator for
 * the same inputs. The new properties are additive.
 */

export type FontFormat = "woff2" | "woff" | "ttf" | "otf" | "eot";
export type FontStyle = "normal" | "italic";
export type FontWeight =
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

export type FontDisplay =
  | "auto"
  | "block"
  | "swap"
  | "fallback"
  | "optional";

/** Inclusive range of valid CSS weight values for variable fonts. */
export type WeightRange = readonly [number, number];

/**
 * OpenType variable-font axis. Tag is the four-character registered or
 * custom axis (`wght`, `wdth`, `slnt`, `opsz`, `ital`, or `XHGT`-style
 * custom). Value is the default position.
 */
export type VariableAxis = {
  tag: string;
  value: number;
};

/**
 * Subset presets keyed to Google-Fonts-style `unicode-range` strings.
 * Custom ranges can also be passed as a raw string via
 * `unicodeRangeCustom`; when both are set, the custom value wins.
 */
export type UnicodeRangePreset =
  | "latin"
  | "latin-ext"
  | "cyrillic"
  | "cyrillic-ext"
  | "greek"
  | "vietnamese";

/**
 * A single `@font-face` block — one weight + style + format set per face.
 * Multiple faces of the same family share a `FontFamily`, which is what
 * carries the `font-family` name and family-wide settings like
 * `font-display` and fallback metric overrides.
 */
export type FontFace = {
  /** Static weight. Ignored when the family is variable. */
  weight: FontWeight;
  style: FontStyle;
  formats: ReadonlyArray<FontFormat>;
  /**
   * Filename the merchant uploaded, without extension. When unset, we
   * generate `{familySlug}-{weight}{style==="italic"?"-italic":""}` (or
   * just `{familySlug}` for the single-face default to stay
   * backward-compatible with one-face URLs). The UI surfaces this as an
   * editable input on every face row so merchants never have to rename
   * their files.
   */
  filenameOverride?: string;
  /**
   * System font fallback names tried via `local()` before the network
   * URL. Empty or undefined → no `local()` precedence. Each name is
   * quoted in the output.
   */
  localNames?: ReadonlyArray<string>;
  /** Subset preset; ignored when `unicodeRangeCustom` is also set. */
  unicodeRangePreset?: UnicodeRangePreset;
  /** Raw CSS `unicode-range` string. Wins over the preset. */
  unicodeRangeCustom?: string;
};

/**
 * One typographic family. Faces belong to a family; a generator input
 * can carry one or two families (heading + body when the merchant wants
 * different fonts for the two roles).
 */
export type FontFamily = {
  /** Brand name as shown to users (used in `font-family` declarations). */
  name: string;
  /**
   * Optional slug override for default filenames. Defaults to
   * `slugify(name)`.
   */
  fileBaseName?: string;
  faces: ReadonlyArray<FontFace>;
  /** `font-display` strategy emitted in every face. Default: "swap". */
  displayStrategy: FontDisplay;
  /** When true, faces emit a weight RANGE and variation settings. */
  isVariable: boolean;
  /** Active weight range when `isVariable`. Default: [100, 900]. */
  weightRange?: WeightRange;
  /** Default axis values when `isVariable`. */
  axes?: ReadonlyArray<VariableAxis>;
  /**
   * Fallback-matching metric overrides (T3). Pass as CSS-ready strings
   * with `%` or `px`. Empty/undefined skips the descriptor.
   */
  sizeAdjust?: string;
  ascentOverride?: string;
  descentOverride?: string;
  lineGapOverride?: string;
  /**
   * OpenType feature toggles, written verbatim into
   * `font-feature-settings`. Pass full strings like `"liga" on`,
   * `"tnum"`, `"ss01" 1`. The generator wraps the array into a
   * comma-joined declaration.
   */
  featureSettings?: ReadonlyArray<string>;
};

/**
 * Complete generator input. `primary` is always present; `secondary`
 * is added when the merchant wants distinct heading + body faces.
 * `applyTo` controls which CSS variable roots the override block
 * touches when there's no secondary family (or which root the PRIMARY
 * font targets when there IS a secondary — secondary takes the other).
 */
export type GeneratorInput = {
  primary: FontFamily;
  secondary?: FontFamily;
  applyTo: ReadonlyArray<"heading" | "body">;
  /**
   * When true, the generator emits a fourth output block — a Liquid
   * snippet that drops into `theme.liquid`'s `<head>` and preloads the
   * first face of every family in WOFF2.
   */
  preloadHints: boolean;
};

/* ------------------------------------------------------------------ */
/* Legacy single-face shape — preserved for the prebuild script + any  */
/* old URLs still around. Use `legacyAdapter.ts` to convert.           */
/* ------------------------------------------------------------------ */

export type SimpleGeneratorInput = {
  fontName: string;
  formats: ReadonlyArray<FontFormat>;
  weight: FontWeight;
  style: FontStyle;
  fileBaseName?: string;
  applyTo?: ReadonlyArray<"heading" | "body">;
  additionalWeights?: ReadonlyArray<FontWeight>;
};

/* ------------------------------------------------------------------ */
/* Format precedence (browsers stop at the first format they decode)  */
/* ------------------------------------------------------------------ */

export const FORMAT_LABEL: Record<FontFormat, string> = {
  woff2: "WOFF2",
  woff: "WOFF",
  ttf: "TTF",
  otf: "OTF",
  eot: "EOT",
};

export const FORMAT_ORDER: ReadonlyArray<FontFormat> = [
  "woff2",
  "woff",
  "ttf",
  "otf",
  "eot",
];

export const FORMAT_CSS_TOKEN: Record<FontFormat, string> = {
  woff2: "woff2",
  woff: "woff",
  ttf: "truetype",
  otf: "opentype",
  eot: "embedded-opentype",
};

export const FORMAT_MIME_TYPE: Record<FontFormat, string> = {
  woff2: "font/woff2",
  woff: "font/woff",
  ttf: "font/ttf",
  otf: "font/otf",
  eot: "application/vnd.ms-fontobject",
};

export const VALID_WEIGHTS: ReadonlyArray<FontWeight> = [
  100, 200, 300, 400, 500, 600, 700, 800, 900,
];

export const DISPLAY_STRATEGIES: ReadonlyArray<FontDisplay> = [
  "swap",
  "block",
  "fallback",
  "optional",
  "auto",
];

export const DISPLAY_STRATEGY_LABEL: Record<FontDisplay, string> = {
  swap: "swap — invisible text until font loads, then swap (recommended)",
  block: "block — invisible text up to 3s, then fallback (luxury feel)",
  fallback: "fallback — brief invisible window, accept the fallback",
  optional: "optional — use fallback if the font isn't cached",
  auto: "auto — let the browser decide (varies)",
};

/* ------------------------------------------------------------------ */
/* Unicode-range preset values (Google Fonts canonical strings)        */
/* ------------------------------------------------------------------ */

export const UNICODE_RANGE_PRESETS: Record<UnicodeRangePreset, string> = {
  latin:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, " +
    "U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, " +
    "U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  "latin-ext":
    "U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, " +
    "U+2113, U+2C60-2C7F, U+A720-A7FF",
  cyrillic: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
  "cyrillic-ext":
    "U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
  greek: "U+0370-03FF",
  vietnamese:
    "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, " +
    "U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, " +
    "U+1EA0-1EF9, U+20AB",
};

export const UNICODE_RANGE_LABEL: Record<UnicodeRangePreset, string> = {
  latin: "Latin (English, French, German, Spanish, …)",
  "latin-ext": "Latin Extended (Polish, Czech, Turkish, Romanian, …)",
  cyrillic: "Cyrillic (Russian, Bulgarian, …)",
  "cyrillic-ext": "Cyrillic Extended (Ukrainian, Kazakh, …)",
  greek: "Greek",
  vietnamese: "Vietnamese",
};

/**
 * Filter + sort the user's selected formats into the canonical
 * precedence order. Shared between fontFace.ts (writes the src stack)
 * and settingsSchema.ts (writes the merchant-facing instruction text),
 * so both surfaces describe the same set in the same order.
 */
export function sortFormats(
  formats: ReadonlyArray<FontFormat>,
): ReadonlyArray<FontFormat> {
  const set = new Set(formats);
  return FORMAT_ORDER.filter((f) => set.has(f));
}

/** Resolved `unicode-range` value for a face. Custom wins over preset. */
export function resolveUnicodeRange(face: FontFace): string | null {
  if (face.unicodeRangeCustom?.trim()) return face.unicodeRangeCustom.trim();
  if (face.unicodeRangePreset) return UNICODE_RANGE_PRESETS[face.unicodeRangePreset];
  return null;
}
