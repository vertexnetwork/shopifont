import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the Shopifont smoke + a11y + OG-snapshot
 * suites. We default to running against a production preview when
 * `PLAYWRIGHT_BASE_URL` is set to a non-empty value; otherwise we boot
 * `next start` against a local build.
 *
 * `||` (not `??`) on the env-var check so an empty string falls
 * through to the localhost default — empty env vars do leak into CI
 * jobs (e.g. via a YAML `env: KEY: ""` declaration) and they should
 * not be treated as a real override.
 */
const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const useExternalServer = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: baseUrl,
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
  webServer: useExternalServer
    ? undefined
    : {
        command: "npm run start",
        url: "http://localhost:3000",
        timeout: 60_000,
        reuseExistingServer: !process.env.CI,
      },
});
