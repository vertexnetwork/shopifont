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

/**
 * Verified social URLs only. Each handle is gated on a build-time env
 * var so the site never claims a profile that hasn't been registered.
 * Empty array is fine — schemas drop the `sameAs` field gracefully.
 */
export const SOCIAL_LINKS: ReadonlyArray<string> = (() => {
  const out: string[] = [];
  const x = process.env.NEXT_PUBLIC_SOCIAL_X?.trim();
  const tiktok = process.env.NEXT_PUBLIC_SOCIAL_TIKTOK?.trim();
  const pinterest = process.env.NEXT_PUBLIC_SOCIAL_PINTEREST?.trim();
  if (x) out.push(x.startsWith("http") ? x : `https://twitter.com/${x.replace(/^@/, "")}`);
  if (tiktok)
    out.push(
      tiktok.startsWith("http")
        ? tiktok
        : `https://www.tiktok.com/@${tiktok.replace(/^@/, "")}`,
    );
  if (pinterest)
    out.push(
      pinterest.startsWith("http")
        ? pinterest
        : `https://pinterest.com/${pinterest.replace(/^@/, "")}`,
    );
  return out;
})();

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

/**
 * Creative Fabrica affiliate referral URL. Single source of truth so
 * we can swap the partner ID in one place and propagate everywhere.
 *
 * The `/ref/<id>/` segment is Creative Fabrica's own attribution
 * mechanism — DO NOT append UTM parameters before it, that breaks the
 * affiliate cookie. Plausible captures the outbound click on our
 * side via its outbound-links script (already enabled in the (site)
 * layout), so we don't need our own attribution params here.
 *
 * Every link rendered with this URL must carry rel="sponsored"
 * (Google's link-relationship signal for paid placements) and
 * target="_blank" + rel="noopener" so we don't get back-button stuck
 * on the affiliate page if the user wants to return.
 */
export const CREATIVE_FABRICA_REF =
  "https://www.creativefabrica.com/ref/24727168/";

/**
 * Chrome Web Store listing URL for the Shopifont extension.
 * Single source of truth — all "Add to Chrome" / "Install extension"
 * CTAs across the site import this so a relisting / ID change is one
 * edit. Plausible's outbound-links script (loaded in the (site)
 * layout) auto-tracks clicks to this domain when rendered with
 * target="_blank".
 */
export const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/shopifont-%E2%80%94-shopify-custo/ldljokdfbnhnhdgnggogfckekgbhmcpa";
