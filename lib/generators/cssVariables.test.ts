import { describe, it, expect } from "vitest";
import { buildCssVariableOverrides } from "./cssVariables";
import type { GeneratorInput } from "./types";

const base: GeneratorInput = {
  fontName: "Calibre",
  formats: ["woff2"],
  weight: 400,
  style: "normal",
};

describe("buildCssVariableOverrides", () => {
  it("returns empty when fontName is blank", () => {
    expect(buildCssVariableOverrides({ ...base, fontName: "" })).toBe("");
  });

  it("targets both heading and body roots by default", () => {
    const css = buildCssVariableOverrides(base);
    expect(css).toContain("--font-heading-family:");
    expect(css).toContain("--font-body-family:");
    expect(css).toContain("--font-heading-weight: 400;");
    expect(css).toContain("--font-body-style: normal;");
  });

  it("scopes to headings only when applyTo restricts it", () => {
    const css = buildCssVariableOverrides({ ...base, applyTo: ["heading"] });
    expect(css).toContain("--font-heading-family:");
    expect(css).not.toContain("--font-body-family:");
  });

  it("scopes to body only when applyTo restricts it", () => {
    const css = buildCssVariableOverrides({ ...base, applyTo: ["body"] });
    expect(css).toContain("--font-body-family:");
    expect(css).not.toContain("--font-heading-family:");
  });

  it("returns empty when applyTo is an empty array", () => {
    expect(buildCssVariableOverrides({ ...base, applyTo: [] })).toBe("");
  });

  it("quotes the font-family name and falls back to sans-serif", () => {
    const css = buildCssVariableOverrides({
      ...base,
      fontName: "My Brand Sans",
    });
    expect(css).toContain('--font-heading-family: "My Brand Sans", sans-serif;');
  });

  it("threads italic + bold descriptors through to both roots", () => {
    const css = buildCssVariableOverrides({
      ...base,
      style: "italic",
      weight: 700,
    });
    expect(css).toContain("--font-heading-style: italic;");
    expect(css).toContain("--font-body-style: italic;");
    expect(css).toContain("--font-heading-weight: 700;");
    expect(css).toContain("--font-body-weight: 700;");
  });

  it("widens the selector to :root, [data-shopify-section], and .shopify-section", () => {
    const css = buildCssVariableOverrides(base);
    expect(css).toContain(":root,");
    expect(css).toContain("[data-shopify-section],");
    expect(css).toContain(".shopify-section {");
    // Single rule body (one opening brace, one closing).
    expect(css.match(/\{/g)?.length ?? 0).toBe(1);
    expect(css.match(/\}/g)?.length ?? 0).toBe(1);
  });
});
