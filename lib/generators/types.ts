/**
 * Shared types for the three generator functions. Kept in one place so
 * the Generator UI, the static homepage example, and the unit tests
 * agree on shape.
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

export type GeneratorInput = {
  /** Display name. Used in font-family declarations. */
  fontName: string;
  /** Selected formats. WOFF2 strongly recommended; tool defaults it on. */
  formats: ReadonlyArray<FontFormat>;
  weight: FontWeight;
  style: FontStyle;
  /**
   * The base file name uploaded to Shopify Assets, without extension.
   * If absent, derived from fontName via slugify().
   */
  fileBaseName?: string;
  /**
   * Optional family role overrides. The CSS variable block writes to
   * Dawn's typography roots; this lets a user target only headings or
   * only body if they prefer.
   */
  applyTo?: ReadonlyArray<"heading" | "body">;
};

export const FORMAT_LABEL: Record<FontFormat, string> = {
  woff2: "WOFF2",
  woff: "WOFF",
  ttf: "TTF",
  otf: "OTF",
  eot: "EOT",
};

/**
 * `format()` precedence order. Browsers stop at the first format they
 * understand, so WOFF2 must come first to actually deliver the
 * compressed asset to modern Chrome/Safari/Firefox.
 */
export const FORMAT_ORDER: ReadonlyArray<FontFormat> = [
  "woff2",
  "woff",
  "ttf",
  "otf",
  "eot",
];

/** CSS `format()` token used inside @font-face src declarations. */
export const FORMAT_CSS_TOKEN: Record<FontFormat, string> = {
  woff2: "woff2",
  woff: "woff",
  ttf: "truetype",
  otf: "opentype",
  eot: "embedded-opentype",
};

export const VALID_WEIGHTS: ReadonlyArray<FontWeight> = [
  100, 200, 300, 400, 500, 600, 700, 800, 900,
];
