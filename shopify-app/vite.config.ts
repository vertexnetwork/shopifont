import path from "node:path";
import { fileURLToPath } from "node:url";
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

/**
 * Shopify App build. Mirrors the extension/ precedent for the @/ alias
 * so the App's lib/generators/* imports resolve to the parent project's
 * pure-function generators (single source of truth, no fork).
 *
 * Remix on Vite handles SSR + client bundling; Vercel auto-detects this
 * config when deploying the shopify-app/ sub-project as its own
 * Vercel project (separate from shopifont.app's deploy).
 */
export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  server: {
    port: 8080,
    fs: {
      // Widen fs.allow so dev mode can serve modules from the parent
      // project's lib/generators/*. Same reason as extension/vite.config.ts.
      allow: [projectRoot],
    },
  },
  build: {
    target: "ES2022",
  },
});
