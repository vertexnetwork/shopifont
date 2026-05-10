import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the Shopifont smoke + a11y + OG-snapshot
 * suites. Spec §2 + §15 PREMIUM. We default to running against a
 * production preview when `PLAYWRIGHT_BASE_URL` is set; otherwise we
 * boot `next start` against a local build.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL:
      process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run start",
        url: "http://localhost:3000",
        timeout: 60_000,
        reuseExistingServer: !process.env.CI,
      },
});
