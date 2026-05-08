import {
  FORMAT_CSS_TOKEN,
  sortFormats,
  type FontWeight,
  type GeneratorInput,
} from "./types";
import { slugify } from "./slugify";

/**
 * Build the @font-face CSS block(s).
 *
 * Output uses Shopify's Liquid `| asset_url` filter, which is the
 * idiomatic way to reference a file uploaded to a theme's `assets/`
 * directory. The Liquid is left as-is (Shopify renders it server-side
 * before serving the stylesheet).
 *
 * Format ordering matters: browsers stop at the first format they can
 * decode, so we always emit WOFF2 first when selected.
 *
 * Multi-weight: when `additionalWeights` is non-empty, we emit one
 * `@font-face` block per weight and switch the filename pattern from
 * `{baseName}.{ext}` to `{baseName}-{weight}.{ext}` so each weight
 * resolves to a distinct uploaded file.
 */
export function buildFontFaceCss(input: GeneratorInput): string {
  if (!input.fontName.trim()) return "";
  const orderedFormats = sortFormats(input.formats);
  if (orderedFormats.length === 0) return "";

  const baseName = (input.fileBaseName ?? slugify(input.fontName)).trim();
  if (!baseName) return "";

  const allWeights = collectWeights(input);
  const useWeightSuffix = allWeights.length > 1;

  const blocks = allWeights.map((weight) =>
    buildOneFace({
      fontName: input.fontName,
      style: input.style,
      weight,
      orderedFormats,
      baseName,
      useWeightSuffix,
    }),
  );

  return blocks.join("\n\n");
}

function collectWeights(input: GeneratorInput): ReadonlyArray<FontWeight> {
  const additional = input.additionalWeights ?? [];
  if (additional.length === 0) return [input.weight];
  // Dedup but preserve insertion order with the primary weight first.
  const seen = new Set<FontWeight>([input.weight]);
  const out: FontWeight[] = [input.weight];
  for (const w of additional) {
    if (!seen.has(w)) {
      seen.add(w);
      out.push(w);
    }
  }
  return out;
}

function buildOneFace({
  fontName,
  style,
  weight,
  orderedFormats,
  baseName,
  useWeightSuffix,
}: {
  fontName: string;
  style: GeneratorInput["style"];
  weight: FontWeight;
  orderedFormats: ReadonlyArray<GeneratorInput["formats"][number]>;
  baseName: string;
  useWeightSuffix: boolean;
}): string {
  const fileStem = useWeightSuffix ? `${baseName}-${weight}` : baseName;

  const srcLines = orderedFormats.map((fmt, idx) => {
    const liquid = `{{ '${fileStem}.${fmt}' | asset_url }}`;
    const isLast = idx === orderedFormats.length - 1;
    return `       url(${liquid}) format('${FORMAT_CSS_TOKEN[fmt]}')${isLast ? ";" : ","}`;
  });

  // Quote font-family to support multi-word display names safely.
  const familyName = JSON.stringify(fontName);

  return [
    `@font-face {`,
    `  font-family: ${familyName};`,
    `  src: ${srcLines.join("\n").trimStart()}`,
    `  font-weight: ${weight};`,
    `  font-style: ${style};`,
    `  font-display: swap;`,
    `}`,
  ].join("\n");
}
