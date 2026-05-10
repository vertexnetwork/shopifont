import { test, expect } from "@playwright/test";

/**
 * Golden-path smoke. Hits every required spec §7 page plus the home
 * generator. Each assertion is shallow on purpose — we want fast
 * regression coverage without coupling to copy.
 */

test("homepage renders the generator and the hero CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText(/font generator/i);
  await expect(
    page.getByRole("link", { name: /generate my font code/i }).first(),
  ).toBeVisible();
});

const requiredPages = [
  { path: "/about", heading: /about/i },
  { path: "/contact", heading: /get in touch|contact/i },
  { path: "/privacy", heading: /privacy/i },
  { path: "/terms", heading: /terms/i },
  { path: "/changelog", heading: /shipped|changelog/i },
  { path: "/network", heading: /vertex network/i },
] as const;

for (const { path, heading } of requiredPages) {
  test(`${path} renders with an h1 matching ${heading}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1").first()).toContainText(heading);
  });
}

test("/network lists at least one sister site", async ({ page }) => {
  await page.goto("/network");
  const cards = page.locator("ul li a[href^='https://']");
  expect(await cards.count()).toBeGreaterThan(0);
});

test("footer carries the Vertex Network attribution", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: /part of the vertex network/i });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", "/network");
});
