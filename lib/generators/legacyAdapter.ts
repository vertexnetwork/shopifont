/**
 * Convert the legacy single-face shape into a full `GeneratorInput` so
 * the new generators can serve old callers (prebuild llms-full, old
 * shared URLs) without forking the rendering code.
 *
 * Backward-compat contract: an adapter result with one face, weight 400,
 * normal style, woff2 format, font-display swap, and no advanced
 * options MUST produce byte-for-byte identical output to the pre-v2
 * generators when the caller supplied the equivalent simple input.
 */

import type {
  FontFace,
  FontFamily,
  GeneratorInput,
  SimpleGeneratorInput,
} from "./types";

export function fromSimple(simple: SimpleGeneratorInput): GeneratorInput {
  const primaryWeight = simple.weight;
  const extras = simple.additionalWeights ?? [];

  // Multi-weight: one face per weight, preserving primary-first order
  // and deduping the primary if it appears in `additionalWeights`.
  const weights: number[] = [primaryWeight];
  const seen = new Set<number>([primaryWeight]);
  for (const w of extras) {
    if (!seen.has(w)) {
      seen.add(w);
      weights.push(w);
    }
  }
  const useWeightSuffix = weights.length > 1;

  const faces: FontFace[] = weights.map((weight) => {
    const face: FontFace = {
      weight: weight as FontFace["weight"],
      style: simple.style,
      formats: simple.formats,
    };
    if (useWeightSuffix) {
      const baseName = simple.fileBaseName?.trim() || slugify(simple.fontName);
      face.filenameOverride = `${baseName}-${weight}`;
    } else if (simple.fileBaseName?.trim()) {
      // Single-face with explicit baseName — preserve the override so
      // tests like `fileBaseName: "brand-sans-v2"` still emit
      // `brand-sans-v2.woff2`.
      face.filenameOverride = simple.fileBaseName.trim();
    }
    return face;
  });

  const primary: FontFamily = {
    name: simple.fontName,
    fileBaseName: simple.fileBaseName,
    faces,
    displayStrategy: "swap",
    isVariable: false,
  };

  return {
    primary,
    applyTo: simple.applyTo ?? ["heading", "body"],
    preloadHints: false,
  };
}

/**
 * Mirror of the existing `slugify` to avoid an import cycle when this
 * file is consumed from a different generator entry point.
 */
function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
