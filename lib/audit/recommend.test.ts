import { describe, it, expect } from "vitest";
import {
  recommendKit,
  buildFindings,
  scoreStore,
  buildAuditResult,
  storeTypeLabel,
  ALL_STORE_TYPES,
  STORE_TYPE_KIT_MAP,
  THEME_OPTIONS,
  STORE_TYPE_OPTIONS,
  type AuditAnswers,
  type FontStatus,
  type Priority,
} from "./recommend";
import { kitBySlug } from "@/content/kits";
import { THEMES } from "@/content/themes";

const FONT_STATUSES: FontStatus[] = ["default", "custom", "unsure"];
const PRIORITIES: Priority[] = ["personality", "balanced", "speed"];

function answers(partial: Partial<AuditAnswers> = {}): AuditAnswers {
  return {
    themeSlug: "dawn",
    fontStatus: "default",
    storeType: "premium-fashion",
    priority: "balanced",
    ...partial,
  };
}

describe("recommendKit", () => {
  it("every store-type in the map resolves to an existing kit", () => {
    for (const [storeType, kitSlug] of Object.entries(STORE_TYPE_KIT_MAP)) {
      expect(kitBySlug(kitSlug), `${storeType} → ${kitSlug}`).toBeDefined();
    }
  });

  it("always returns a real kit for every answer permutation", () => {
    for (const theme of THEMES) {
      for (const storeType of ALL_STORE_TYPES) {
        for (const fontStatus of FONT_STATUSES) {
          for (const priority of PRIORITIES) {
            const kit = recommendKit(
              answers({ themeSlug: theme.slug, storeType, fontStatus, priority }),
            );
            expect(kit).toBeDefined();
            expect(kitBySlug(kit.slug)).toBe(kit);
          }
        }
      }
    }
  });

  it("maps each store-type to its vertical kit on the balanced path", () => {
    expect(recommendKit(answers({ storeType: "premium-fashion" })).slug).toBe(
      "premium-editorial",
    );
    expect(recommendKit(answers({ storeType: "luxury-beauty" })).slug).toBe(
      "luxury-classic",
    );
    expect(recommendKit(answers({ storeType: "dtc-lifestyle" })).slug).toBe(
      "dtc-friendly",
    );
    expect(recommendKit(answers({ storeType: "editorial-artisan" })).slug).toBe(
      "editorial-warm",
    );
    expect(recommendKit(answers({ storeType: "tech-electronics" })).slug).toBe(
      "modern-tech",
    );
    expect(recommendKit(answers({ storeType: "minimal-unsure" })).slug).toBe(
      "minimal-fast",
    );
  });

  it("priority=speed always wins to the lightest single-family kit", () => {
    for (const storeType of ALL_STORE_TYPES) {
      const kit = recommendKit(answers({ storeType, priority: "speed" }));
      expect(kit.slug).toBe("minimal-fast");
      expect(kit.singleFamily).toBe(true);
    }
  });

  it("priority=personality upgrades an undecided store to the most characterful kit", () => {
    expect(
      recommendKit(answers({ storeType: "minimal-unsure", priority: "personality" }))
        .slug,
    ).toBe("premium-editorial");
  });

  it("priority=personality does not override a store-type that already has character", () => {
    expect(
      recommendKit(answers({ storeType: "luxury-beauty", priority: "personality" }))
        .slug,
    ).toBe("luxury-classic");
  });
});

describe("buildFindings", () => {
  it("returns findings for every theme", () => {
    for (const theme of THEMES) {
      const findings = buildFindings(answers({ themeSlug: theme.slug }));
      expect(findings.length).toBeGreaterThanOrEqual(3);
      expect(findings.some((f) => f.kind === "good")).toBe(true);
    }
  });

  it("only names a specific stock font when the theme's default is verified", () => {
    for (const theme of THEMES) {
      const findings = buildFindings(
        answers({ themeSlug: theme.slug, fontStatus: "default" }),
      );
      const stockText = findings.map((f) => f.detail).join(" ");
      if (!theme.defaultsVerified) {
        // Must not assert the unverified font name.
        expect(stockText).not.toContain(theme.defaultHeadingFont);
      }
    }
  });

  it("names the verified default (Assistant) for Dawn", () => {
    const findings = buildFindings(
      answers({ themeSlug: "dawn", fontStatus: "default" }),
    );
    expect(findings.map((f) => f.detail).join(" ")).toContain("Assistant");
  });

  it("leads with the stock-font problem when on the default", () => {
    const findings = buildFindings(answers({ fontStatus: "default" }));
    expect(findings[0]?.kind).toBe("problem");
    expect(findings[0]?.title).toMatch(/stock/i);
  });

  it("pivots to a pairing critique when the merchant already customized", () => {
    const findings = buildFindings(answers({ fontStatus: "custom" }));
    expect(findings[0]?.title).toMatch(/pairing/i);
  });
});

describe("scoreStore", () => {
  it("scores stock/unsure stores lower than customized ones", () => {
    expect(scoreStore(answers({ fontStatus: "default" })).score).toBeLessThan(
      scoreStore(answers({ fontStatus: "custom" })).score,
    );
    expect(scoreStore(answers({ fontStatus: "unsure" })).label).toMatch(/stock/i);
  });

  it("never exceeds its own max", () => {
    for (const fontStatus of FONT_STATUSES) {
      const s = scoreStore(answers({ fontStatus }));
      expect(s.score).toBeLessThanOrEqual(s.max);
      expect(s.score).toBeGreaterThan(0);
    }
  });
});

describe("buildAuditResult", () => {
  it("assembles a coherent result with a valid kit", () => {
    const result = buildAuditResult(answers());
    expect(result.kit).toBeDefined();
    expect(result.theme?.slug).toBe("dawn");
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.score.max).toBe(5);
  });
});

describe("UI option metadata", () => {
  it("exposes one theme option per theme", () => {
    expect(THEME_OPTIONS.length).toBe(THEMES.length);
  });

  it("covers every store-type with an option and a label", () => {
    expect(STORE_TYPE_OPTIONS.length).toBe(ALL_STORE_TYPES.length);
    for (const storeType of ALL_STORE_TYPES) {
      expect(storeTypeLabel(storeType).length).toBeGreaterThan(0);
    }
  });
});
