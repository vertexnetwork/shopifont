/**
 * Metadata for each free Shopify OS 2.0 theme. Used by the pSEO content
 * generator to produce theme-specific copy and FAQs without falling
 * back to boilerplate.
 *
 * The 13 themes here are the full set of free themes Shopify ships in
 * the Theme Store as of 2024. All are OS 2.0 and inherit Dawn's
 * `--font-heading-family` / `--font-body-family` token convention,
 * which makes the CSS-variable override approach uniformly applicable.
 */

export type ThemeMeta = {
  /** Display name as shown in the Shopify Theme Store. */
  name: string;
  /** URL slug, lowercase. */
  slug: string;
  /** Vendor — "Shopify" for first-party themes. */
  vendor: string;
  /** Single-sentence positioning. */
  positioning: string;
  /** A specific category descriptor used in copy. */
  category: string;
  /** The default heading font Shopify ships with the theme. */
  defaultHeadingFont: string;
  /** The default body font Shopify ships with the theme. */
  defaultBodyFont: string;
  /** A typography characteristic that distinguishes the theme. */
  typographyCharacter: string;
  /** Where the user pastes the @font-face block — file + section. */
  injectionPoint: string;
  /** A real CSS class hook on this theme that benefits from the override. */
  notableSelector: string;
  /** Popularity tier — used to prioritize format-specific subpages. */
  popularity: "tier-1" | "tier-2";
};

export const THEMES: ReadonlyArray<ThemeMeta> = [
  {
    name: "Dawn",
    slug: "dawn",
    vendor: "Shopify",
    positioning:
      "the Shopify OS 2.0 reference theme that ships with every new store and powers the largest install base of any free theme.",
    category: "general-purpose",
    defaultHeadingFont: "Assistant",
    defaultBodyFont: "Assistant",
    typographyCharacter:
      "neutral, low-contrast humanist sans that prioritizes legibility over personality.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".section-header__heading, .product__title",
    popularity: "tier-1",
  },
  {
    name: "Sense",
    slug: "sense",
    vendor: "Shopify",
    positioning:
      "Shopify's wellness-leaning free theme designed for health, beauty, and personal-care brands.",
    category: "health & wellness",
    defaultHeadingFont: "Assistant",
    defaultBodyFont: "Assistant",
    typographyCharacter:
      "rounded, soft-edged typography that pairs cleanly with high-resolution lifestyle imagery.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".product-card__title, .rich-text__heading",
    popularity: "tier-1",
  },
  {
    name: "Refresh",
    slug: "refresh",
    vendor: "Shopify",
    positioning:
      "a sport- and energy-leaning free theme tuned for high-saturation imagery and bold supporting copy.",
    category: "sport & energy",
    defaultHeadingFont: "Assistant",
    defaultBodyFont: "Assistant",
    typographyCharacter:
      "high-contrast display headings sitting above utilitarian body copy.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".banner__heading, .button--primary",
    popularity: "tier-1",
  },
  {
    name: "Crave",
    slug: "crave",
    vendor: "Shopify",
    positioning:
      "Shopify's snack-, beverage-, and food-brand-oriented free theme with an emphasis on tactile imagery.",
    category: "food & beverage",
    defaultHeadingFont: "Assistant",
    defaultBodyFont: "Assistant",
    typographyCharacter:
      "playful, slightly oversized headings that complement appetite-appeal photography.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".product__title, .marquee__text",
    popularity: "tier-1",
  },
  {
    name: "Origin",
    slug: "origin",
    vendor: "Shopify",
    positioning:
      "a furniture- and home-goods-oriented free theme built around editorial spacing and gallery-style product blocks.",
    category: "home & garden",
    defaultHeadingFont: "Assistant",
    defaultBodyFont: "Assistant",
    typographyCharacter:
      "calm, generous-line-height typography optimized for long descriptions and lifestyle storytelling.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".section__heading, .product-description",
    popularity: "tier-1",
  },
  {
    name: "Studio",
    slug: "studio",
    vendor: "Shopify",
    positioning:
      "an art-gallery and creative-portfolio free theme that leans on negative space and a strong vertical rhythm.",
    category: "art & gallery",
    defaultHeadingFont: "Assistant",
    defaultBodyFont: "Assistant",
    typographyCharacter:
      "editorial display headings with restrained body copy that defers to imagery.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".gallery__caption, .collection__title",
    popularity: "tier-2",
  },
  {
    name: "Taste",
    slug: "taste",
    vendor: "Shopify",
    positioning:
      "a free theme for specialty food and wine brands with collection layouts tuned to story-rich SKUs.",
    category: "specialty food & wine",
    defaultHeadingFont: "Assistant",
    defaultBodyFont: "Assistant",
    typographyCharacter:
      "warm, slightly old-style serif headings that feel curated rather than generic.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".product__vendor, .recipe-card__title",
    popularity: "tier-2",
  },
  {
    name: "Spotlight",
    slug: "spotlight",
    vendor: "Shopify",
    positioning:
      "a video- and motion-forward free theme for fashion, audio, and entertainment brands.",
    category: "fashion & entertainment",
    defaultHeadingFont: "Assistant",
    defaultBodyFont: "Assistant",
    typographyCharacter:
      "cinematic display sizing meant to be paired with autoplaying hero video.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".hero__heading, .product__title",
    popularity: "tier-2",
  },
  {
    name: "Colorblock",
    slug: "colorblock",
    vendor: "Shopify",
    positioning:
      "a free theme that leans into flat color zones and graphic shapes, popular with novelty and gift brands.",
    category: "novelty & gift",
    defaultHeadingFont: "Assistant",
    defaultBodyFont: "Assistant",
    typographyCharacter:
      "geometric-leaning sans typography that complements the theme's hard-edged blocks.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".color-block__heading, .product-card__title",
    popularity: "tier-2",
  },
  {
    name: "Craft",
    slug: "craft",
    vendor: "Shopify",
    positioning:
      "an artisan- and maker-leaning free theme that pairs natural product photography with curated typography.",
    category: "artisan & handmade",
    defaultHeadingFont: "Assistant",
    defaultBodyFont: "Assistant",
    typographyCharacter:
      "transitional serif headings paired with low-contrast body for craft-shop authenticity.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".product__title, .testimonial__quote",
    popularity: "tier-2",
  },
  {
    name: "Ride",
    slug: "ride",
    vendor: "Shopify",
    positioning:
      "an outdoor- and sports-equipment free theme tuned for spec-heavy product pages and review-driven layouts.",
    category: "outdoor & sport",
    defaultHeadingFont: "Assistant",
    defaultBodyFont: "Assistant",
    typographyCharacter:
      "industrial sans headings that work well next to spec tables and dimension copy.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".specs__heading, .product__title",
    popularity: "tier-2",
  },
  {
    name: "Publisher",
    slug: "publisher",
    vendor: "Shopify",
    positioning:
      "a media-, publishing-, and information-product free theme built around long-form content blocks.",
    category: "media & publishing",
    defaultHeadingFont: "Assistant",
    defaultBodyFont: "Assistant",
    typographyCharacter:
      "editorial serif headings paired with reader-optimized body copy for article-shaped pages.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".article__title, .blog__excerpt",
    popularity: "tier-2",
  },
  {
    name: "Trade",
    slug: "trade",
    vendor: "Shopify",
    positioning:
      "a hardware-, B2B-, and trade-goods free theme designed around dense catalogs and multi-variant products.",
    category: "B2B & hardware",
    defaultHeadingFont: "Assistant",
    defaultBodyFont: "Assistant",
    typographyCharacter:
      "utilitarian sans typography that prioritizes scannability over personality.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".product__title, .variant-table__cell",
    popularity: "tier-2",
  },
];

export const THEME_BY_SLUG: Record<string, ThemeMeta> = Object.fromEntries(
  THEMES.map((t) => [t.slug, t]),
);

export const TIER_1_THEMES: ReadonlyArray<ThemeMeta> = THEMES.filter(
  (t) => t.popularity === "tier-1",
);
