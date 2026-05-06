import { describe, it, expect } from "vitest";
import { buildFontFaceCss } from "./fontFace";
import type { GeneratorInput } from "./types";

const base: GeneratorInput = {
  fontName: "Calibre",
  formats: ["woff2"],
  weight: 400,
  style: "normal",
};

describe("buildFontFaceCss", () => {
  it("returns empty when fontName is blank", () => {
    expect(buildFontFaceCss({ ...base, fontName: "  " })).toBe("");
  });

  it("returns empty when no formats are selected", () => {
    expect(buildFontFaceCss({ ...base, formats: [] })).toBe("");
  });

  it("emits a single WOFF2 src line for the default selection", () => {
    const out = buildFontFaceCss(base);
    expect(out).toContain('font-family: "Calibre";');
    expect(out).toContain(
      "url({{ 'calibre.woff2' | asset_url }}) format('woff2');",
    );
    expect(out).toContain("font-weight: 400;");
    expect(out).toContain("font-style: normal;");
    expect(out).toContain("font-display: swap;");
  });

  it("orders formats WOFF2 → WOFF → TTF → OTF → EOT regardless of input order", () => {
    const out = buildFontFaceCss({
      ...base,
      formats: ["eot", "ttf", "woff2", "woff"],
    });
    const positions = ["woff2", "woff", "truetype", "embedded-opentype"].map(
      (token) => out.indexOf(`format('${token}')`),
    );
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("ends only the final src line with a semicolon", () => {
    const out = buildFontFaceCss({
      ...base,
      formats: ["woff2", "woff", "ttf"],
    });
    // Pull every line that contains a url() declaration regardless of
    // whether it's the first src line (which sits on the same line as
    // `src:`) or a continuation.
    const srcLines = out
      .split("\n")
      .filter((l) => l.includes("url("));
    expect(srcLines).toHaveLength(3);
    expect(srcLines[0]!.trimEnd().endsWith(",")).toBe(true);
    expect(srcLines[1]!.trimEnd().endsWith(",")).toBe(true);
    expect(srcLines[2]!.trimEnd().endsWith(";")).toBe(true);
  });

  it("uses fileBaseName when supplied instead of slugified fontName", () => {
    const out = buildFontFaceCss({
      ...base,
      fontName: "My Brand Sans",
      fileBaseName: "brand-sans-v2",
    });
    expect(out).toContain("brand-sans-v2.woff2");
    expect(out).not.toContain("my-brand-sans.woff2");
  });

  it("derives baseName via slugify for multi-word display names", () => {
    const out = buildFontFaceCss({ ...base, fontName: "My Brand Sans" });
    expect(out).toContain("'my-brand-sans.woff2'");
    expect(out).toContain('font-family: "My Brand Sans";');
  });

  it("propagates italic + 700 weight into descriptors", () => {
    const out = buildFontFaceCss({ ...base, weight: 700, style: "italic" });
    expect(out).toContain("font-weight: 700;");
    expect(out).toContain("font-style: italic;");
  });

  it("dedupes a duplicated format input", () => {
    const out = buildFontFaceCss({
      ...base,
      formats: ["woff2", "woff2", "woff"],
    });
    const woff2Hits = out.match(/format\('woff2'\)/g) ?? [];
    expect(woff2Hits.length).toBe(1);
  });
});
