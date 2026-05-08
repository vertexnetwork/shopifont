import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

/**
 * The extension reuses every line of generator code from the parent
 * project — pure functions in `lib/generators/`, the React Generator
 * components, the brand Logo, etc. The `@/` alias resolves to the
 * project root so imports written for Next.js (`@/components/...`)
 * resolve identically here. One source of truth, no drift.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  plugins: [react(), crx({ manifest })],
  /*
   * The shared `lib/site.ts` reads `process.env.NEXT_PUBLIC_*` at
   * module-load time. Next.js inlines those at build; Vite leaves
   * `process` undefined in the browser, which crashes the popup
   * before React mounts. Define them as string literals here so Vite
   * does the same substitution Next.js does. SITE_URL is filled in
   * so the "Open full site" link in the popup header resolves to the
   * real domain instead of localhost.
   */
  define: {
    "process.env.NEXT_PUBLIC_SITE_URL": JSON.stringify("https://shopifont.app"),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      /*
       * Vite's default `fs.allow` is the workspace root (extension/).
       * We import from `@/components/...` which resolves to the parent
       * project, so we have to widen the allow-list. Production
       * builds bundle everything and don't hit this restriction; dev
       * mode does because modules are served on demand.
       */
      allow: [projectRoot],
    },
  },
});
