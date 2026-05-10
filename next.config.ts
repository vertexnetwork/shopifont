import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { buildCSPFromEnv } from "./lib/csp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const emptyModule = path.resolve(__dirname, "lib/empty.js");

const config: NextConfig = {
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

  /**
   * Provider-aware CSP composition (spec §11). Header is sent for
   * every route except `/embed*`, which gets `frame-ancestors *` so
   * partner sites can iframe the generator.
   */
  async headers() {
    const csp = buildCSPFromEnv();
    const cspEmbed = buildCSPFromEnv({ embeddable: true });
    return [
      {
        source: "/((?!embed).*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      {
        source: "/embed",
        headers: [{ key: "Content-Security-Policy", value: cspEmbed }],
      },
      {
        source: "/embed/:path*",
        headers: [{ key: "Content-Security-Policy", value: cspEmbed }],
      },
    ];
  },
};

export default config;
