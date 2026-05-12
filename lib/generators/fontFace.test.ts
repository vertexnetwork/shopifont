import { describe, it, expect } from "vitest";
import { buildFontFaceCss } from "./fontFace";
import { fromSimple } from "./legacyAdapter";
import type {
  FontFamily,
  GeneratorInput,
  SimpleGeneratorInput,
} from "./types";

const simpleBase: SimpleGeneratorInput = {
  fontName: "Calibre",
  formats: ["woff2"],
  weight: 400,
  style: "normal",
};

const fam = (overrides: Partial<FontFamily> = {}): FontFamily => ({
  name: "Calibre",
  faces: [
    {
      weight: 400,
      style: "normal",
      formats: ["woff2"],
    },
  ],
  displayStrategy: "swap",
  isVariable: false,
  ...overrides,
});

const input = (
  overrides: Partial<GeneratorInput> & { primary?: FontFamily } = {},
): GeneratorInput => ({
  primary: overrides.primary ?? fam(),
  applyTo: overrides.applyTo ?? ["heading", "body"],
  preloadHints: overrides.preloadHints ?? false,
  ...(overrides.secondary ? { secondary: overrides.secondary } : {}),
});

describe("buildFontFaceCss — legacy single-face contract via adapter", () => {
  it("returns empty when fontName is blank", () => {
    expect(buildFontFaceCss(fromSimple({ ...simpleBase, fontName: "  " }))).toBe(
      "",
    );
  });

  it("returns empty when no formats are selected", () => {
    expect(buildFontFaceCss(fromSimple({ ...simpleBase, formats: [] }))).toBe(
      "",
    );
  });

  it("emits a single WOFF2 src line for the default selection", () => {
    const out = buildFontFaceCss(fromSimple(simpleBase));
    expect(out).toContain('font-family: "Calibre";');
    expect(out).toContain(
      "url({{ 'calibre.woff2' | asset_url }}) format('woff2');",
    );
    expect(out).toContain("font-weight: 400;");
    expect(out).toContain("font-style: normal;");
    expect(out).toContain("font-display: swap;");
  });

  it("orders formats WOFF2 → WOFF → TTF → OTF → EOT regardless of input order", () => {
    const out = buildFontFaceCss(
      fromSimple({ ...simpleBase, formats: ["eot", "ttf", "woff2", "woff"] }),
    );
    const positions = ["woff2", "woff", "truetype", "embedded-opentype"].map(
      (token) => out.indexOf(`format('${token}')`),
    );
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("ends only the final src line with a semicolon", () => {
    const out = buildFontFaceCss(
      fromSimple({ ...simpleBase, formats: ["woff2", "woff", "ttf"] }),
    );
    const srcLines = out.split("\n").filter((l) => l.includes("url("));
    expect(srcLines).toHaveLength(3);
    expect(srcLines[0]!.trimEnd().endsWith(",")).toBe(true);
    expect(srcLines[1]!.trimEnd().endsWith(",")).toBe(true);
    expect(srcLines[2]!.trimEnd().endsWith(";")).toBe(true);
  });

  it("uses fileBaseName when supplied instead of slugified fontName", () => {
    const out = buildFontFaceCss(
      fromSimple({
        ...simpleBase,
        fontName: "My Brand Sans",
        fileBaseName: "brand-sans-v2",
      }),
    );
    expect(out).toContain("brand-sans-v2.woff2");
    expect(out).not.toContain("my-brand-sans.woff2");
  });

  it("derives baseName via slugify for multi-word display names", () => {
    const out = buildFontFaceCss(
      fromSimple({ ...simpleBase, fontName: "My Brand Sans" }),
    );
    expect(out).toContain("'my-brand-sans.woff2'");
    expect(out).toContain('font-family: "My Brand Sans";');
  });

  it("propagates italic + 700 weight into descriptors", () => {
    const out = buildFontFaceCss(
      fromSimple({ ...simpleBase, weight: 700, style: "italic" }),
    );
    expect(out).toContain("font-weight: 700;");
    expect(out).toContain("font-style: italic;");
  });

  it("dedupes a duplicated format input", () => {
    const out = buildFontFaceCss(
      fromSimple({ ...simpleBase, formats: ["woff2", "woff2", "woff"] }),
    );
    const woff2Hits = out.match(/format\('woff2'\)/g) ?? [];
    expect(woff2Hits.length).toBe(1);
  });

  it("emits a single block with bare baseName when no additionalWeights", () => {
    const out = buildFontFaceCss(fromSimple(simpleBase));
    const blocks = out.match(/@font-face/g) ?? [];
    expect(blocks.length).toBe(1);
    expect(out).toContain("'calibre.woff2'");
    expect(out).not.toContain("calibre-400.woff2");
  });

  it("emits one @font-face block per weight when additionalWeights is set", () => {
    const out = buildFontFaceCss(
      fromSimple({ ...simpleBase, additionalWeights: [700] }),
    );
    const blocks = out.match(/@font-face/g) ?? [];
    expect(blocks.length).toBe(2);
    expect(out).toContain("font-weight: 400;");
    expect(out).toContain("font-weight: 700;");
  });

  it("switches to {baseName}-{weight}.{ext} filenames when multiple weights are emitted", () => {
    const out = buildFontFaceCss(
      fromSimple({
        ...simpleBase,
        formats: ["woff2", "woff"],
        additionalWeights: [700],
      }),
    );
    expect(out).toContain("'calibre-400.woff2'");
    expect(out).toContain("'calibre-400.woff'");
    expect(out).toContain("'calibre-700.woff2'");
    expect(out).toContain("'calibre-700.woff'");
    expect(out).not.toContain("'calibre.woff2'");
  });

  it("dedupes a primary weight repeated in additionalWeights", () => {
    const out = buildFontFaceCss(
      fromSimple({ ...simpleBase, additionalWeights: [400, 700] }),
    );
    const blocks = out.match(/@font-face/g) ?? [];
    expect(blocks.length).toBe(2);
  });

  it("preserves insertion order: primary first, additionalWeights after", () => {
    const out = buildFontFaceCss(
      fromSimple({
        ...simpleBase,
        weight: 500,
        additionalWeights: [300, 700],
      }),
    );
    const idx500 = out.indexOf("font-weight: 500;");
    const idx300 = out.indexOf("font-weight: 300;");
    const idx700 = out.indexOf("font-weight: 700;");
    expect(idx500).toBeGreaterThan(-1);
    expect(idx500).toBeLessThan(idx300);
    expect(idx300).toBeLessThan(idx700);
  });
});

describe("buildFontFaceCss — Tier 1: multi-face per family", () => {
  it("emits a Regular + Bold + Italic + Bold-Italic family in one paste", () => {
    const out = buildFontFaceCss(
      input({
        primary: fam({
          faces: [
            { weight: 400, style: "normal", formats: ["woff2"] },
            { weight: 700, style: "normal", formats: ["woff2"] },
            { weight: 400, style: "italic", formats: ["woff2"] },
            { weight: 700, style: "italic", formats: ["woff2"] },
          ],
        }),
      }),
    );
    expect((out.match(/@font-face/g) ?? []).length).toBe(4);
    expect(out).toContain("calibre-400.woff2");
    expect(out).toContain("calibre-700.woff2");
    expect(out).toContain("calibre-400-italic.woff2");
    expect(out).toContain("calibre-700-italic.woff2");
  });

  it("respects per-face filenameOverride (merchants don't have to rename files)", () => {
    const out = buildFontFaceCss(
      input({
        primary: fam({
          faces: [
            {
              weight: 400,
              style: "normal",
              formats: ["woff2"],
              filenameOverride: "Calibre-Regular",
            },
            {
              weight: 700,
              style: "normal",
              formats: ["woff2"],
              filenameOverride: "Calibre-Bold",
            },
          ],
        }),
      }),
    );
    expect(out).toContain("'Calibre-Regular.woff2'");
    expect(out).toContain("'Calibre-Bold.woff2'");
    expect(out).not.toContain("'calibre-400.woff2'");
  });
});

describe("buildFontFaceCss — Tier 1: font-display strategy", () => {
  it("threads the chosen strategy into every face", () => {
    const out = buildFontFaceCss(
      input({ primary: fam({ displayStrategy: "block" }) }),
    );
    expect(out).toContain("font-display: block;");
    expect(out).not.toContain("font-display: swap;");
  });
});

describe("buildFontFaceCss — Tier 1: local() fallback names", () => {
  it("emits local() entries before the URL stack", () => {
    const out = buildFontFaceCss(
      input({
        primary: fam({
          faces: [
            {
              weight: 400,
              style: "normal",
              formats: ["woff2"],
              localNames: ["Calibre", "Calibre Regular"],
            },
          ],
        }),
      }),
    );
    const srcIdx = out.indexOf("src:");
    const localIdx = out.indexOf('local("Calibre")');
    const urlIdx = out.indexOf("url(");
    expect(srcIdx).toBeGreaterThan(-1);
    expect(localIdx).toBeGreaterThan(srcIdx);
    expect(urlIdx).toBeGreaterThan(localIdx);
  });
});

describe("buildFontFaceCss — Tier 1: secondary family", () => {
  it("renders both families' faces in primary-then-secondary order", () => {
    const out = buildFontFaceCss({
      primary: fam({ name: "Inter" }),
      secondary: fam({ name: "Playfair Display" }),
      applyTo: ["body"],
      preloadHints: false,
    });
    const interIdx = out.indexOf('font-family: "Inter";');
    const playfairIdx = out.indexOf('font-family: "Playfair Display";');
    expect(interIdx).toBeGreaterThan(-1);
    expect(playfairIdx).toBeGreaterThan(interIdx);
  });
});

describe("buildFontFaceCss — Tier 2: variable fonts", () => {
  it("emits a weight range when isVariable", () => {
    const out = buildFontFaceCss(
      input({
        primary: fam({
          isVariable: true,
          weightRange: [100, 900],
          faces: [{ weight: 400, style: "normal", formats: ["woff2"] }],
        }),
      }),
    );
    expect(out).toContain("font-weight: 100 900;");
    expect(out).not.toContain("font-weight: 400;");
  });

  it("uses {baseName}-variable.{ext} as the default filename for variable fonts", () => {
    const out = buildFontFaceCss(
      input({
        primary: fam({
          isVariable: true,
          weightRange: [100, 900],
          faces: [{ weight: 400, style: "normal", formats: ["woff2"] }],
        }),
      }),
    );
    expect(out).toContain("'calibre-variable.woff2'");
  });
});

describe("buildFontFaceCss — Tier 3: unicode-range", () => {
  it("emits a preset range when unicodeRangePreset is set", () => {
    const out = buildFontFaceCss(
      input({
        primary: fam({
          faces: [
            {
              weight: 400,
              style: "normal",
              formats: ["woff2"],
              unicodeRangePreset: "latin",
            },
          ],
        }),
      }),
    );
    expect(out).toContain("unicode-range: U+0000-00FF");
  });

  it("custom range overrides the preset", () => {
    const out = buildFontFaceCss(
      input({
        primary: fam({
          faces: [
            {
              weight: 400,
              style: "normal",
              formats: ["woff2"],
              unicodeRangePreset: "latin",
              unicodeRangeCustom: "U+1F600-1F64F",
            },
          ],
        }),
      }),
    );
    expect(out).toContain("unicode-range: U+1F600-1F64F");
    expect(out).not.toContain("U+0000-00FF");
  });
});

describe("buildFontFaceCss — Tier 3: fallback-metric overrides", () => {
  it("threads size-adjust / ascent-override / descent-override / line-gap-override", () => {
    const out = buildFontFaceCss(
      input({
        primary: fam({
          sizeAdjust: "105%",
          ascentOverride: "88%",
          descentOverride: "22%",
          lineGapOverride: "0%",
        }),
      }),
    );
    expect(out).toContain("size-adjust: 105%;");
    expect(out).toContain("ascent-override: 88%;");
    expect(out).toContain("descent-override: 22%;");
    expect(out).toContain("line-gap-override: 0%;");
  });
});

describe("buildFontFaceCss — Tier 3: font-feature-settings", () => {
  it("joins multiple feature toggles with commas", () => {
    const out = buildFontFaceCss(
      input({
        primary: fam({
          featureSettings: [`"liga" 1`, `"tnum" 1`, `"ss01" 1`],
        }),
      }),
    );
    expect(out).toContain(
      `font-feature-settings: "liga" 1, "tnum" 1, "ss01" 1;`,
    );
  });
});
