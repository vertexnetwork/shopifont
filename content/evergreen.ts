/**
 * Hand-crafted evergreen guides outside the per-theme pSEO system.
 * These are top-of-funnel pages aimed at search intent that doesn't
 * map to a specific theme — "how do I pick a font," "how do I undo
 * this," "what are the best free options" — and at building topical
 * authority across the site.
 *
 * Single source of truth for slug, title, and summary so the sitemap,
 * llms.txt, and llms-full.txt all read from one place. The page body
 * lives in the route file at app/(site)/<slug>/page.tsx — this index
 * doesn't try to encode prose, just metadata.
 */

export type EvergreenEntry = {
  /** URL slug, no leading slash. Becomes the route segment. */
  slug: string;
  /** Display title — used in llms.txt and Footer link copy. */
  title: string;
  /** Two-sentence summary for llms-full.txt page-level section. */
  summary: string;
  /** Sitemap priority. 0.6 for high-intent guides, 0.5 for top-of-funnel. */
  priority: number;
};

export const EVERGREEN_ENTRIES: ReadonlyArray<EvergreenEntry> = [
  {
    slug: "uninstall-custom-font-shopify",
    title: "How to uninstall a custom font from a Shopify theme",
    summary:
      "Step-by-step guide to reversing a custom font install on a Shopify OS 2.0 theme. Covers removing the @font-face block, deleting the CSS variable overrides, removing the settings_schema.json entry, and cleaning up font files in the assets/ folder. Works for Dawn and every other free Shopify OS 2.0 theme.",
    priority: 0.6,
  },
  {
    slug: "how-to-choose-a-font-for-shopify",
    title: "How to choose a font for your Shopify store",
    summary:
      "Decision framework for picking a custom font that fits a Shopify storefront. Covers brand fit, performance budget (file size, FOIT/CLS), licensing for ecommerce, weight selection, heading-and-body pairing, and multilingual support — with concrete examples and pitfall callouts.",
    priority: 0.5,
  },
  {
    slug: "best-free-fonts-for-shopify",
    title: "The best fonts for a Shopify store (2026)",
    summary:
      "The fonts that actually work on a Shopify storefront in 2026 — six curated picks for stores that care about performance and brand fit, plus the six popular fonts (Montserrat, Roboto, Poppins, Playfair Display, Open Sans, Lora) most lists recommend, with honest notes on where each one wins or loses for ecommerce. Includes a side-by-side comparison table, pairing suggestions, and a premium-options section.",
    priority: 0.6,
  },
  {
    slug: "shopify-font-pairings",
    title: "Shopify font pairings that work (2026)",
    summary:
      "Ten concrete font pairings for Shopify stores, with named heading + body fonts (Fraunces + Inter, Playfair Display + Lato, Montserrat + Open Sans, Lora + Open Sans, Outfit + Public Sans, Poppins + Poppins, Inter + Inter, Playfair Display + Roboto, IBM Plex Sans + IBM Plex Serif, Manrope + IBM Plex Sans), the kind of brand each pairing fits, the total WOFF2 file budget, and the pitfall each pairing avoids. Includes a section on pairings to avoid and why.",
    priority: 0.6,
  },
  {
    slug: "font-pairing-checklist",
    title: "Free Shopify font-pairing checklist",
    summary:
      "Six-axis checklist for pairing heading and body fonts on a Shopify storefront — brand fit, contrast, x-height harmony, weight availability, performance budget, and licensing. Opens in your browser as a printable PDF the moment you submit your email. No account, no spam.",
    priority: 0.5,
  },
  {
    slug: "recommendations",
    title: "Recommended Shopify tools",
    summary:
      "The print-on-demand, font marketplace, and operational utilities we recommend for Shopify merchants. Affiliate-tagged where applicable; commission disclosed inline.",
    priority: 0.5,
  },
];
