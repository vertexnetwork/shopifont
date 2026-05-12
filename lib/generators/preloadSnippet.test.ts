import { describe, it, expect } from "vitest";
import { buildPreloadSnippet } from "./preloadSnippet";
import type { FontFamily, GeneratorInput } from "./types";

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

describe("buildPreloadSnippet", () => {
  it("returns empty when preloadHints is false", () => {
    expect(buildPreloadSnippet(input({ preloadHints: false }))).toBe("");
  });

  it("emits a <link rel=preload> for the primary family's first face", () => {
    const out = buildPreloadSnippet(input({ preloadHints: true }));
    expect(out).toContain('rel="preload"');
    expect(out).toContain('as="font"');
    expect(out).toContain('type="font/woff2"');
    expect(out).toContain("crossorigin");
    expect(out).toContain("{{ 'calibre.woff2' | asset_url }}");
  });

  it("emits one preload line per family when a secondary is present", () => {
    const out = buildPreloadSnippet({
      primary: fam({ name: "Inter" }),
      secondary: fam({ name: "Playfair Display" }),
      applyTo: ["body"],
      preloadHints: true,
    });
    const links = out.match(/<link rel="preload"/g) ?? [];
    expect(links).toHaveLength(2);
    expect(out).toContain("'inter.woff2'");
    expect(out).toContain("'playfair-display.woff2'");
  });

  it("uses the first format in the canonical precedence order, not insertion order", () => {
    const out = buildPreloadSnippet(
      input({
        primary: fam({
          faces: [
            {
              weight: 400,
              style: "normal",
              formats: ["ttf", "woff2", "woff"],
            },
          ],
        }),
        preloadHints: true,
      }),
    );
    expect(out).toContain('type="font/woff2"');
    expect(out).toContain(".woff2");
    expect(out).not.toContain('type="font/ttf"');
  });

  it("honors filenameOverride so merchants don't have to rename files", () => {
    const out = buildPreloadSnippet(
      input({
        primary: fam({
          faces: [
            {
              weight: 400,
              style: "normal",
              formats: ["woff2"],
              filenameOverride: "Calibre-Regular",
            },
          ],
        }),
        preloadHints: true,
      }),
    );
    expect(out).toContain("'Calibre-Regular.woff2'");
    expect(out).not.toContain("'calibre.woff2'");
  });

  it("wraps the snippet with a Liquid comment for paste guidance", () => {
    const out = buildPreloadSnippet(input({ preloadHints: true }));
    expect(out).toContain("{% comment %}");
    expect(out).toContain("{% endcomment %}");
    expect(out).toMatch(/Paste this block inside <head> in layout\/theme\.liquid/);
  });

  it("returns empty when the primary family has no faces", () => {
    const out = buildPreloadSnippet(
      input({
        primary: fam({ faces: [] }),
        preloadHints: true,
      }),
    );
    expect(out).toBe("");
  });
});
