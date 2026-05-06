import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const emptyModule = path.resolve(__dirname, "lib/empty.js");

const config: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  /*
   * Strip Next.js's hardcoded client polyfill-module. It bundles
   * Array.at, Object.hasOwn, String.prototype.trim*, Promise.finally,
   * URL.canParse, etc. unconditionally — browserslist alone doesn't
   * skip them because they're imported via a static module reference,
   * not transpiled. Our browserslist target (Chrome/Edge/FF 90+,
   * Safari 15+, Opera 76+) has all of these natively.
   */
  webpack: (webpackConfig, { webpack, isServer }) => {
    if (!isServer) {
      webpackConfig.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /[\\/]polyfill-module(\.js)?$/,
          emptyModule,
        ),
      );
    }
    return webpackConfig;
  },
};

export default config;
