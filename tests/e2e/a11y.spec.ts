import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * axe-core a11y sweep over the required pages. Fails on any
 * "serious" or "critical" violation; "minor" / "moderate" surface as
 * warnings in the report but don't fail CI yet (raises the bar
 * gradually rather than wholesale).
 */

const pages = ["/", "/about", "/contact", "/privacy", "/terms", "/changelog", "/network"];

for (const path of pages) {
  test(`${path} has no critical or serious axe violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blockers = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(
      blockers,
      `Found ${blockers.length} blocking a11y issues on ${path}: ` +
        blockers.map((b) => `${b.id} (${b.impact})`).join(", "),
    ).toHaveLength(0);
  });
}
