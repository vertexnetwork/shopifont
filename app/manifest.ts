import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

/**
 * PWA manifest. Drives Add-to-Home-Screen on Android and the
 * application-name strings everywhere a UA reads a manifest.
 * Multi-size icons emitted by `scripts/generate-favicon.ts`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/?utm_source=pwa&utm_medium=manifest",
    scope: "/",
    display: "standalone",
    background_color: siteConfig.theme.colors.bg,
    theme_color: siteConfig.theme.colors.onBg,
    icons: [
      { src: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { src: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
