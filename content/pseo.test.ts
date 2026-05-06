import { describe, it, expect } from "vitest";
import { PSEO_ENTRIES, PSEO_BY_SLUG } from "./pseo";

describe("pSEO content map", () => {
  it("generates at least 50 entries (PLAN.md §3 launch target)", () => {
    expect(PSEO_ENTRIES.length).toBeGreaterThanOrEqual(50);
  });

  it("every slug is unique", () => {
    const slugs = PSEO_ENTRIES.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every entry has at least 4 FAQs (PLAN.md §3 minimum)", () => {
    for (const entry of PSEO_ENTRIES) {
      expect(entry.faqs.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("metaTitle stays ≤ 60 characters on every entry", () => {
    for (const entry of PSEO_ENTRIES) {
      expect(entry.metaTitle.length).toBeLessThanOrEqual(60);
    }
  });

  it("metaDescription stays ≤ 155 characters on every entry", () => {
    for (const entry of PSEO_ENTRIES) {
      expect(entry.metaDescription.length).toBeLessThanOrEqual(155);
    }
  });

  it("intro + useCase + FAQs combine to ≥ 250 words per entry", () => {
    for (const entry of PSEO_ENTRIES) {
      const blob =
        `${entry.oneLineAnswer} ${entry.intro} ${entry.useCase} ` +
        entry.faqs.map((f) => `${f.q} ${f.a}`).join(" ");
      const wordCount = blob.split(/\s+/).filter(Boolean).length;
      expect(wordCount, `${entry.slug} unique copy < 250 words`).toBeGreaterThanOrEqual(
        250,
      );
    }
  });

  it("no FAQ Q-string appears on more than 3 pages", () => {
    const counts = new Map<string, number>();
    for (const entry of PSEO_ENTRIES) {
      for (const faq of entry.faqs) {
        const k = faq.q.trim().toLowerCase();
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
    }
    for (const [k, count] of counts) {
      expect(count, `FAQ "${k}" appears ${count} times`).toBeLessThanOrEqual(3);
    }
  });

  it("every relatedSlug points to a real entry", () => {
    for (const entry of PSEO_ENTRIES) {
      for (const related of entry.relatedSlugs) {
        expect(PSEO_BY_SLUG[related]).toBeDefined();
      }
    }
  });

  it("relatedSlugs are between 3 and 5 (PLAN.md §3 internal-link rule)", () => {
    for (const entry of PSEO_ENTRIES) {
      expect(entry.relatedSlugs.length).toBeGreaterThanOrEqual(3);
      expect(entry.relatedSlugs.length).toBeLessThanOrEqual(5);
    }
  });
});
