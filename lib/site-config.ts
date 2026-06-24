/**
 * The keystone — single source of truth for every brand/identity/nav/
 * theme/feature value across the Shopifont spoke. See
 * `vertex-network-hub/docs/_scaffold-spec.md §4`.
 *
 * Every hardcoded brand string anywhere else in the spoke is an audit
 * failure. Pull from here.
 */

export type Affiliate = {
  url: string;
  label: string;
  /** Analytics tag for click telemetry. */
  provider: string;
  /** Optional rel attributes (always include "sponsored noopener"). */
  rel?: string;
};

export type FooterLink = { href: string; label: string };

const fallback = (envValue: string | undefined, literal: string): string =>
  envValue?.trim() || literal;

const SITE_URL_RAW = fallback(process.env.NEXT_PUBLIC_SITE_URL, "https://shopifont.app");

export const siteConfig = {
  // identity ---------------------------------------------------------
  name: fallback(process.env.NEXT_PUBLIC_SITE_NAME, "Shopifont"),
  shortName: fallback(process.env.NEXT_PUBLIC_SITE_SHORT_NAME, "Shopifont"),
  domain: fallback(process.env.NEXT_PUBLIC_SITE_DOMAIN, "shopifont.app"),
  url: SITE_URL_RAW.replace(/\/$/, ""),
  tagline: "Free Shopify Custom Font Generator",
  description: fallback(
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    "Generate copy-paste @font-face CSS, settings_schema.json, and CSS variable overrides for any Shopify OS 2.0 theme. Conversion-optimized typography without layout shifts.",
  ),
  keywords: [
    "shopify typography audit",
    "best shopify fonts",
    "shopify font pairings",
    "shopify custom font",
    "shopify font generator",
    "shopify @font-face",
    "shopify dawn font",
    "shopify font css",
    "settings_schema.json font",
    "shopify font picker",
    "os 2.0 typography",
  ],

  // contact / legal --------------------------------------------------
  supportEmail: fallback(process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL, "hello@shopifont.app"),
  trademarkDisclaimer:
    "Not affiliated with Shopify Inc. “Shopify” and “Dawn” are trademarks of Shopify Inc. and are used here for compatibility reference only.",

  // theme — token values, not class names ----------------------------
  theme: {
    colors: {
      bg: "#ffffff",
      surface: "#f5f5f5",
      accent: "#0066ff",
      onBg: "#1a1a1a",
      onAccent: "#ffffff",
      muted: "#5a5a5a",
      border: "#333333",
      success: "#0066ff",
      danger: "#d92d20",
    },
    fontDisplay: "Inter",
    fontBody: "Inter",
    radiusCard: "0.75rem",
  },

  // brand mark -------------------------------------------------------
  brand: {
    markColor: "#0066ff",
    markBgColor: "#1a1a1a",
  },

  // navigation -------------------------------------------------------
  nav: {
    primary: [
      { href: "/shopify-typography-audit", label: "Audit" },
      { href: "/shopify-typography-kits", label: "Typography Kits" },
      { href: "/best-free-fonts-for-shopify", label: "Best fonts" },
      { href: "/#themes", label: "Themes" },
      { href: "/extension", label: "Extension" },
      { href: "/about", label: "About" },
    ] as ReadonlyArray<FooterLink>,
    footer: {
      product: [
        { href: "/shopify-typography-kits", label: "Typography Kits" },
        { href: "/shopify-dawn-custom-font-generator", label: "Dawn" },
        { href: "/shopify-sense-custom-font-generator", label: "Sense" },
        { href: "/shopify-refresh-custom-font-generator", label: "Refresh" },
        { href: "/shopify-crave-custom-font-generator", label: "Crave" },
        { href: "/shopify-origin-custom-font-generator", label: "Origin" },
      ] as ReadonlyArray<FooterLink>,
      company: [
        { href: "/shopify-typography-audit", label: "Typography audit" },
        { href: "/how-to-choose-a-font-for-shopify", label: "Choose a font" },
        { href: "/best-free-fonts-for-shopify", label: "Best free fonts" },
        { href: "/shopify-font-pairings", label: "Font pairings" },
        { href: "/font-pairing-checklist", label: "Pairing checklist (PDF)" },
        { href: "/uninstall-custom-font-shopify", label: "Uninstall guide" },
        {
          href: "/dawn-theme-typography-css-variables",
          label: "Dawn CSS variables",
        },
      ] as ReadonlyArray<FooterLink>,
      legal: [
        { href: "/about", label: "About" },
        { href: "/recommendations", label: "Recommended tools" },
        { href: "/contact", label: "Contact" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
        { href: "/changelog", label: "Changelog" },
      ] as ReadonlyArray<FooterLink>,
    },
    disclaimer:
      "Independent tool, not affiliated with Shopify Inc. Display ads + a small Printify affiliate partnership keep the tool free.",
  },

  // JSON-LD ----------------------------------------------------------
  jsonLd: {
    type: "SoftwareApplication" as "SoftwareApplication" | "WebApplication" | "FinanceApplication",
    operatingSystem: "Web",
    applicationCategory: "DeveloperApplication",
    price: 0,
  },

  // GitHub. Empty string disables the link (private repo). -----------
  repoUrl: "",

  // feature flags ----------------------------------------------------
  features: {
    embed: {
      enabled: true,
      route: "/embed",
      params: [] as ReadonlyArray<string>,
    },
    extension: {
      enabled: true,
      chromeWebStoreUrl:
        "https://chromewebstore.google.com/detail/shopifont-%E2%80%94-shopify-custo/ldljokdfbnhnhdgnggogfckekgbhmcpa",
    },
    /**
     * The paid product: Shopify Typography Kits, sold on Gumroad.
     * Every upsell + the sales page ship DARK until
     * NEXT_PUBLIC_KIT_GUMROAD_URL is set in the environment — then
     * every <KitUpsell /> and the "Buy" CTA light up with no code
     * change or redeploy of logic. Set the env var the moment the
     * Gumroad product is live; that is the only switch.
     *
     * (The Shopify App was evaluated and shelved — it's a support
     * job, not a Muse. Its code remains under shopify-app/ as an
     * optional future lever but is intentionally NOT surfaced
     * anywhere on the site.)
     */
    kit: {
      enabled: Boolean(process.env.NEXT_PUBLIC_KIT_GUMROAD_URL?.trim()),
      gumroadUrl: fallback(process.env.NEXT_PUBLIC_KIT_GUMROAD_URL, ""),
      productName: "Shopify Typography Kits",
      priceLabel: "$19 · one-time · instant download",
      /**
       * Full sticker price (USD, whole dollars) of the one-time bundle.
       * The single source for the displayed price math — the founder
       * offer subtracts a flat discount off this (see lib/gumroad-stats).
       */
      price: 19,
    },
    proEnabled: false,
    email: { enabled: true, leadMagnetName: "font-pairing-checklist" },
    ads: {
      provider:
        (process.env.NEXT_PUBLIC_AD_PROVIDER?.trim().toLowerCase() as
          | "none"
          | "adsense"
          | "mediavine"
          | "carbon"
          | undefined) ?? "none",
    },
    /**
     * Affiliate partners. Single partner by design: Printify, the one
     * already-live PartnerStack + cash + complement fit for this
     * audience (POD merch ≠ a typography kit, so it can't cannibalize
     * the paid product). Creative Fabrica was cut — it runs an in-house
     * self-managed wallet, not the network's PartnerStack dashboard
     * (see vertex-network-affiliate-guide §5).
     *
     * Placement rule (network affiliate guide §10): affiliates render on
     * research / pSEO surfaces only, NEVER on the paid funnel
     * (home / audit / kits), one per page max, always secondary to the
     * kit. Order is by provider, not index — code finds partners by
     * `provider`, so this list can grow/shrink without breaking refs.
     */
    affiliates: [
      {
        url: "https://try.printify.com/j8xm11chwojf",
        label: "Printify",
        provider: "printify",
        rel: "sponsored noopener",
      },
    ] satisfies ReadonlyArray<Affiliate>,
    consent: { required: true },
    themeToggle: false,
  },

  // monetization (declared concretely; subset of features) -----------
  monetization: {
    stripe: { priceIds: { monthly: "", yearly: "" } },
    lemonSqueezy: { storeId: "", productSlug: "" },
    gumroad: { productUrl: "", price: 0 },
  },

  // SEO verification — env-driven so tokens never land in the repo --
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
  },

  // security contact (RFC 9116) --------------------------------------
  security: {
    contact: "mailto:hello@shopifont.app",
    expires: "2027-01-01T00:00:00Z",
  },
} as const;

export type SiteConfig = typeof siteConfig;

export function absoluteUrl(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${siteConfig.url}${path}`;
}

/**
 * Build-time timestamp baked into the bundle. Surfaced on every pSEO
 * page as a "last updated" trust signal. Refreshes automatically every
 * deploy.
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
