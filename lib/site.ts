/**
 * Centralizes site-wide constants. Keeps URL/brand strings out of components
 * so a domain swap is one edit.
 */
export const SITE_NAME = "Shopifont";
export const SITE_TAGLINE = "Free Shopify Custom Font Generator";
export const SITE_DESCRIPTION =
  "Generate copy-paste @font-face CSS, settings_schema.json, and CSS variable overrides for any Shopify OS 2.0 theme. Conversion-optimized typography without layout shifts.";

const FALLBACK_URL = "https://shopifont.app";

export function getSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!env) return FALLBACK_URL;
  return env.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${getSiteUrl()}${path}`;
}

export const SOCIAL_HANDLES = {
  x: "shopifont",
  pinterest: "shopifont",
  tiktok: "shopifont",
} as const;

/**
 * Build-time timestamp baked into the bundle. Surfaced on every pSEO
 * page as a "last updated" signal so visitors can see the guides are
 * actively maintained — important trust gate for paste-into-production
 * code. Refreshes automatically every deploy.
 */
export const BUILD_DATE_ISO: string = new Date().toISOString();

const BUILD_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function getBuildDateLabel(): string {
  return BUILD_DATE_FORMATTER.format(new Date(BUILD_DATE_ISO));
}
