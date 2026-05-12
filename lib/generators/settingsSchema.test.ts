import { describe, it, expect } from "vitest";
import { buildSettingsSchemaJson } from "./settingsSchema";
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

type Setting = {
  type: string;
  id?: string;
  label?: string;
  content?: string;
  default?: string;
};

type Block = { settings: Setting[]; name?: string };

describe("buildSettingsSchemaJson — single-family contract", () => {
  it("returns empty when fontName is blank", () => {
    expect(
      buildSettingsSchemaJson(fromSimple({ ...simpleBase, fontName: "" })),
    ).toBe("");
  });

  it("emits valid JSON parseable by JSON.parse", () => {
    const json = buildSettingsSchemaJson(fromSimple(simpleBase));
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("emits one font_picker per typography role, a checkbox, and a select", () => {
    const block = JSON.parse(buildSettingsSchemaJson(fromSimple(simpleBase))) as Block;
    const fontPickers = block.settings.filter((s) => s.type === "font_picker");
    const selects = block.settings.filter((s) => s.type === "select");
    const checkboxes = block.settings.filter((s) => s.type === "checkbox");
    expect(fontPickers).toHaveLength(2);
    expect(selects).toHaveLength(1);
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);
    expect(fontPickers.map((p) => p.id)).toEqual([
      "calibre_heading_font",
      "calibre_body_font",
    ]);
  });

  it("includes the Use-this-font-for-both checkbox with default true", () => {
    const block = JSON.parse(buildSettingsSchemaJson(fromSimple(simpleBase))) as Block;
    const useForBoth = block.settings.find(
      (s) => s.type === "checkbox" && s.id?.endsWith("_use_for_both"),
    );
    expect(useForBoth).toBeDefined();
    expect(useForBoth?.default).toBe(true as unknown as string);
    expect(useForBoth?.label).toMatch(/Use this font for both/);
  });

  it("uses snake_case ids derived from fontName", () => {
    const block = JSON.parse(
      buildSettingsSchemaJson(fromSimple({ ...simpleBase, fontName: "My Brand Sans" })),
    ) as Block;
    const ids = block.settings.map((s) => s.id).filter(Boolean) as string[];
    expect(ids.every((id) => /^my_brand_sans_/.test(id))).toBe(true);
    expect(ids.some((id) => /-/.test(id))).toBe(false);
  });

  it("references the asset filename in the explanatory paragraph", () => {
    const json = buildSettingsSchemaJson(
      fromSimple({ ...simpleBase, fontName: "My Brand Sans" }),
    );
    expect(json).toContain("my-brand-sans.woff2");
  });

  it("cites the merchant's actually-selected formats in the instruction text", () => {
    const json = buildSettingsSchemaJson(
      fromSimple({ ...simpleBase, formats: ["ttf", "woff"] }),
    );
    const block = JSON.parse(json) as Block;
    const paragraph = block.settings.find((s) => s.type === "paragraph");
    expect(paragraph?.content).toContain("woff, ttf");
  });

  it("uses the first selected format (precedence-ordered) in the asset_url example", () => {
    const json = buildSettingsSchemaJson(
      fromSimple({ ...simpleBase, formats: ["ttf"] }),
    );
    const block = JSON.parse(json) as Block;
    const firstParagraph = block.settings.find((s) => s.type === "paragraph");
    expect(firstParagraph?.content).toContain("calibre.ttf");
    expect(firstParagraph?.content).not.toContain("calibre.woff2");
  });

  it("does NOT default the font_picker controls to a Dawn-specific value", () => {
    const block = JSON.parse(buildSettingsSchemaJson(fromSimple(simpleBase))) as Block;
    const fontPickers = block.settings.filter((s) => s.type === "font_picker");
    for (const picker of fontPickers) {
      expect(picker.default).toBeUndefined();
    }
  });

  it("labels font_picker controls as Native Theme Editor fallbacks, not the install path", () => {
    const block = JSON.parse(buildSettingsSchemaJson(fromSimple(simpleBase))) as Block;
    const fontPickers = block.settings.filter((s) => s.type === "font_picker");
    for (const picker of fontPickers) {
      expect(picker.label).toMatch(/Native Theme Editor/);
      expect(picker.label).toMatch(/only used if you don't upload/);
    }
  });

  it("mentions the font-display strategy in the section copy", () => {
    const block = JSON.parse(
      buildSettingsSchemaJson(input({ primary: fam({ displayStrategy: "block" }) })),
    ) as Block;
    const paragraphs = block.settings.filter((s) => s.type === "paragraph");
    const combined = paragraphs.map((p) => p.content).join(" ");
    expect(combined).toMatch(/font-display strategy: block/);
  });
});

describe("buildSettingsSchemaJson — two families", () => {
  it("emits a JSON array with two top-level entries", () => {
    const json = buildSettingsSchemaJson(
      input({
        primary: fam({ name: "Inter" }),
        secondary: fam({ name: "Playfair Display" }),
      }),
    );
    const parsed = JSON.parse(json) as Array<Block>;
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]!.name).toMatch(/Inter \(primary custom font\)/);
    expect(parsed[1]!.name).toMatch(/Playfair Display \(secondary custom font\)/);
  });

  it("scopes each family's ids by its own slug", () => {
    const json = buildSettingsSchemaJson(
      input({
        primary: fam({ name: "Inter" }),
        secondary: fam({ name: "Playfair Display" }),
      }),
    );
    const parsed = JSON.parse(json) as Array<Block>;
    const interIds = parsed[0]!.settings.map((s) => s.id).filter(Boolean) as string[];
    const playfairIds = parsed[1]!.settings.map((s) => s.id).filter(Boolean) as string[];
    expect(interIds.every((id) => id.startsWith("inter_"))).toBe(true);
    expect(playfairIds.every((id) => id.startsWith("playfair_display_"))).toBe(true);
  });
});
