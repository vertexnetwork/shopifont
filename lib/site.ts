/**
 * Compatibility shim. The real source of truth is `lib/site-config.ts`.
 * This module re-exports the legacy named constants the rest of the app
 * still imports so the migration to `siteConfig` could land without a
 * mega-PR. New code should import from `@/lib/site-config`.
 *
 * Network registry helpers live in `lib/network.ts` to keep the
 * Node-only file-system reads out of the client bundle (this shim is
 * pulled in by the `"use client"` Footer).
 */

import { siteConfig } from "./site-config";

export { siteConfig, absoluteUrl, BUILD_DATE_ISO, getBuildDateLabel } from "./site-config";

export const SITE_NAME = siteConfig.name;
export const SITE_TAGLINE = siteConfig.tagline;
export const SITE_DESCRIPTION = siteConfig.description;

export function getSiteUrl(): string {
  return siteConfig.url;
}

/** @deprecated find by provider in `siteConfig.features.affiliates` instead. */
export const PRINTIFY_REF =
  siteConfig.features.affiliates.find((a) => a.provider === "printify")?.url ?? "";

/** @deprecated read `siteConfig.features.extension.chromeWebStoreUrl` instead. */
export const CHROME_WEB_STORE_URL = siteConfig.features.extension.chromeWebStoreUrl;

export const NETWORK_BRAND = "Vertex Network";

/** @deprecated use `Property` from `lib/network.ts` instead. */
export type NetworkSite = {
  name: string;
  url: string;
  description: string;
};
