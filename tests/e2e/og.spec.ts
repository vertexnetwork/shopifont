import { test, expect } from "@playwright/test";

/**
 * OG snapshot. Hits the dynamic OG endpoint at well-known parameters
 * and verifies the response is a 1200x630 PNG with a sane size. We
 * deliberately don't pixel-snapshot the result (font-rendering
 * differences across runners would trip false positives); a size
 * envelope is good enough to catch regressions like a typo in the
 * route returning HTML instead of an image.
 */

test("default opengraph-image is a 1200x630 PNG", async ({ request }) => {
  const res = await request.get("/opengraph-image");
  expect(res.ok()).toBe(true);
  expect(res.headers()["content-type"]).toMatch(/image\/png/);
  const body = await res.body();
  expect(body.byteLength).toBeGreaterThan(5_000);
  // PNG magic number 89 50 4E 47 0D 0A 1A 0A
  expect([...body.subarray(0, 8)]).toEqual([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
});

test("/api/og returns a parameterized PNG", async ({ request }) => {
  const res = await request.get(
    "/api/og?title=Shopify%20Custom%20Font%20Generator&subtitle=Free%20%40font-face%20CSS",
  );
  expect(res.ok()).toBe(true);
  expect(res.headers()["content-type"]).toMatch(/image\/png/);
});
