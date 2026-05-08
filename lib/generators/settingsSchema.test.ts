import { describe, it, expect } from "vitest";
import { buildSettingsSchemaJson } from "./settingsSchema";
import type { GeneratorInput } from "./types";

const base: GeneratorInput = {
  fontName: "Calibre",
  formats: ["woff2"],
  weight: 400,
  style: "normal",
};

describe("buildSettingsSchemaJson", () => {
  it("returns empty when fontName is blank", () => {
    expect(buildSettingsSchemaJson({ ...base, fontName: "" })).toBe("");
  });

  it("emits valid JSON parseable by JSON.parse", () => {
    const json = buildSettingsSchemaJson(base);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("includes one font_picker per typography role and a select fallback", () => {
    const block = JSON.parse(buildSettingsSchemaJson(base)) as {
      settings: Array<{ type: string; id?: string }>;
    };
    const fontPickers = block.settings.filter((s) => s.type === "font_picker");
    const selects = block.settings.filter((s) => s.type === "select");
    expect(fontPickers).toHaveLength(2);
    expect(selects).toHaveLength(1);
    expect(fontPickers.map((p) => p.id)).toEqual([
      "calibre_heading_font",
      "calibre_body_font",
    ]);
  });

  it("uses snake_case ids derived from fontName", () => {
    const block = JSON.parse(
      buildSettingsSchemaJson({ ...base, fontName: "My Brand Sans" }),
    ) as { settings: Array<{ id?: string }> };
    const ids = block.settings.map((s) => s.id).filter(Boolean) as string[];
    expect(ids.every((id) => /^my_brand_sans_/.test(id))).toBe(true);
    expect(ids.some((id) => /-/.test(id))).toBe(false);
  });

  it("references the asset filename in the explanatory paragraph", () => {
    const json = buildSettingsSchemaJson({
      ...base,
      fontName: "My Brand Sans",
    });
    expect(json).toContain("my-brand-sans.woff2");
  });

  it("cites the merchant's actually-selected formats in the instruction text", () => {
    const json = buildSettingsSchemaJson({ ...base, formats: ["ttf", "woff"] });
    const block = JSON.parse(json) as {
      settings: Array<{ type: string; content?: string }>;
    };
    const paragraph = block.settings.find((s) => s.type === "paragraph");
    expect(paragraph?.content).toContain("woff, ttf");
    expect(paragraph?.content).not.toContain("woff2, woff, ttf, otf, or eot");
  });

  it("uses the first selected format (precedence-ordered) in the asset_url example", () => {
    const json = buildSettingsSchemaJson({ ...base, formats: ["ttf"] });
    const block = JSON.parse(json) as {
      settings: Array<{ type: string; content?: string }>;
    };
    const paragraph = block.settings.find((s) => s.type === "paragraph");
    expect(paragraph?.content).toContain("calibre.ttf");
    expect(paragraph?.content).not.toContain("calibre.woff2");
  });

  it("does NOT default the font_picker controls to the Dawn-specific assistant_n4", () => {
    const block = JSON.parse(buildSettingsSchemaJson(base)) as {
      settings: Array<{ type: string; default?: string }>;
    };
    const fontPickers = block.settings.filter((s) => s.type === "font_picker");
    for (const picker of fontPickers) {
      expect(picker.default).toBeUndefined();
    }
  });

  it("labels font_picker controls as Native Theme Editor fallbacks, not the install path", () => {
    const block = JSON.parse(buildSettingsSchemaJson(base)) as {
      settings: Array<{ type: string; label?: string }>;
    };
    const fontPickers = block.settings.filter((s) => s.type === "font_picker");
    for (const picker of fontPickers) {
      expect(picker.label).toMatch(/Native Theme Editor/);
      expect(picker.label).toMatch(/only used if you don't upload/);
    }
  });
});
