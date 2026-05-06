import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "out/**",
      ".next/**",
      "node_modules/**",
      "coverage/**",
      // Extension workspace has its own toolchain (Vite, separate
      // tsconfig, separate node_modules). The parent's lint/typecheck
      // would fail on its imports because @vitejs/plugin-react,
      // @crxjs/vite-plugin, etc. live only in extension/node_modules.
      "extension/**",
    ],
  },
];

export default config;
