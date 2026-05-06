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
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
