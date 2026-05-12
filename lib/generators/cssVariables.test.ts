import { describe, it, expect } from "vitest";
import { buildCssVariableOverrides } from "./cssVariables";
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

describe("buildCssVariableOverrides — single family", () => {
  it("returns empty when fontName is blank", () => {
    expect(buildCssVariableOverrides(fromSimple({ ...simpleBase, fontName: "" }))).toBe(
      "",
    );
  });

  it("targets both heading and body roots by default", () => {
    const css = buildCssVariableOverrides(fromSimple(simpleBase));
    expect(css).toContain("--font-heading-family:");
    expect(css).toContain("--font-body-family:");
    expect(css).toContain("--font-heading-weight: 400;");
    expect(css).toContain("--font-body-style: normal;");
  });

  it("scopes to headings only when applyTo restricts it", () => {
    const css = buildCssVariableOverrides(
      fromSimple({ ...simpleBase, applyTo: ["heading"] }),
    );
    expect(css).toContain("--font-heading-family:");
    expect(css).not.toContain("--font-body-family:");
  });

  it("scopes to body only when applyTo restricts it", () => {
    const css = buildCssVariableOverrides(
      fromSimple({ ...simpleBase, applyTo: ["body"] }),
    );
    expect(css).toContain("--font-body-family:");
    expect(css).not.toContain("--font-heading-family:");
  });

  it("returns empty when applyTo is an empty array", () => {
    expect(buildCssVariableOverrides(fromSimple({ ...simpleBase, applyTo: [] }))).toBe(
      "",
    );
  });

  it("quotes the font-family name and falls back to sans-serif", () => {
    const css = buildCssVariableOverrides(
      fromSimple({ ...simpleBase, fontName: "My Brand Sans" }),
    );
    expect(css).toContain('--font-heading-family: "My Brand Sans", sans-serif;');
  });

  it("threads italic + bold descriptors through to both roots", () => {
    const css = buildCssVariableOverrides(
      fromSimple({ ...simpleBase, style: "italic", weight: 700 }),
    );
    expect(css).toContain("--font-heading-style: italic;");
    expect(css).toContain("--font-body-style: italic;");
    expect(css).toContain("--font-heading-weight: 700;");
    expect(css).toContain("--font-body-weight: 700;");
  });

  it("widens the selector to :root, [data-shopify-section], and .shopify-section", () => {
    const css = buildCssVariableOverrides(fromSimple(simpleBase));
    expect(css).toContain(":root,");
    expect(css).toContain("[data-shopify-section],");
    expect(css).toContain(".shopify-section {");
    expect(css.match(/\{/g)?.length ?? 0).toBe(1);
    expect(css.match(/\}/g)?.length ?? 0).toBe(1);
  });
});

describe("buildCssVariableOverrides — two families", () => {
  it("routes primary→body and secondary→heading", () => {
    const css = buildCssVariableOverrides({
      primary: fam({ name: "Inter" }),
      secondary: fam({ name: "Playfair Display" }),
      applyTo: ["body"],
      preloadHints: false,
    });
    expect(css).toContain('--font-heading-family: "Playfair Display"');
    expect(css).toContain('--font-body-family: "Inter"');
  });

  it("ignores applyTo when a secondary family is set", () => {
    const css = buildCssVariableOverrides({
      primary: fam({ name: "Inter" }),
      secondary: fam({ name: "Playfair Display" }),
      // even with applyTo limited to heading only, both roots must
      // resolve because the merchant explicitly opted into a 2-family
      // setup.
      applyTo: ["heading"],
      preloadHints: false,
    });
    expect(css).toContain("--font-heading-family:");
    expect(css).toContain("--font-body-family:");
  });
});

describe("buildCssVariableOverrides — variable axis plumbing", () => {
  it("emits weight range + axis variation-settings when isVariable", () => {
    const css = buildCssVariableOverrides(
      input({
        primary: fam({
          isVariable: true,
          weightRange: [100, 900],
          axes: [
            { tag: "wght", value: 500 },
            { tag: "wdth", value: 90 },
          ],
        }),
      }),
    );
    expect(css).toContain("--font-heading-weight: 100;");
    expect(css).toContain("--font-heading-weight-min: 100;");
    expect(css).toContain("--font-heading-weight-max: 900;");
    expect(css).toContain(
      '--font-heading-variation-settings: "wght" 500, "wdth" 90;',
    );
  });
});
