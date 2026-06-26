/**
 * Metadata for each free Shopify OS 2.0 theme. Used by the pSEO content
 * generator to produce theme-specific copy and FAQs without falling
 * back to boilerplate.
 *
 * The 13 themes here are the full set of free themes Shopify ships in
 * the Theme Store as of 2024. All are OS 2.0 and inherit Dawn's
 * `--font-heading-family` / `--font-body-family` token convention,
 * which makes the CSS-variable override approach uniformly applicable.
 *
 * `defaultsVerified` gates whether the pSEO copy cites the specific
 * default font name. Only Dawn is verified at the moment (its
 * settings_schema sets `assistant_n4` as the default font_picker
 * value). For the other 12 themes the copy defers to a generic "theme
 * default" phrasing until each one's actual defaults are confirmed
 * against a live install.
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
  /**
   * True when defaultHeadingFont / defaultBodyFont have been
   * confirmed against the live theme. When false, pSEO copy uses a
   * generic phrasing instead of citing the specific font name.
   */
  defaultsVerified: boolean;
  /** A typography characteristic that distinguishes the theme. */
  typographyCharacter: string;
  /** Where the user pastes the @font-face block — file + section. */
  injectionPoint: string;
  /** A real CSS class hook on this theme that benefits from the override. */
  notableSelector: string;
  /**
   * True only when `notableSelector` has been confirmed against a live
   * install. Mirrors `defaultsVerified` for fonts. When false, pSEO copy
   * refers to "heading selectors" generically instead of citing specific,
   * potentially-wrong class names — anonymity/generalization over
   * fabrication (audit playbook Part 6).
   */
  selectorsVerified: boolean;
  /**
   * A genuine, vertical-specific typography recommendation for this
   * theme's store category. Editorial value that is true regardless of
   * theme internals (it's pairing advice, not an unverifiable claim), so
   * it gives each theme's pages unique main content beyond the templated
   * noun-swap (audit Dimension #1/#2).
   */
  verticalAngle: string;
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
    defaultsVerified: true,
    typographyCharacter:
      "neutral, low-contrast humanist sans that prioritizes legibility over personality.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".section-header__heading, .product__title",
    selectorsVerified: true,
    verticalAngle:
      "Because Dawn is the baseline most stores start from, swapping the heading face is the fastest way to stop reading as a default Shopify store — pair an expressive display face for headings with a neutral, legible body face so product copy stays easy to read.",
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
    defaultsVerified: false,
    typographyCharacter:
      "rounded, soft-edged typography that pairs cleanly with high-resolution lifestyle imagery.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".product-card__title, .rich-text__heading",
    selectorsVerified: false,
    verticalAngle:
      "Wellness and beauty stores read best with a calm, humanist face — a soft serif or low-contrast sans for headings signals trust, while a clean body face keeps ingredient and usage copy easy to scan.",
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
    defaultsVerified: false,
    typographyCharacter:
      "high-contrast display headings sitting above utilitarian body copy.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".banner__heading, .button--primary",
    selectorsVerified: false,
    verticalAngle:
      "Sport and energy brands can carry a heavier, higher-contrast display face for headings to convey momentum — just keep the body face utilitarian so spec and price copy stays readable at a glance.",
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
    defaultsVerified: false,
    typographyCharacter:
      "playful, slightly oversized headings that complement appetite-appeal photography.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".product__title, .marquee__text",
    selectorsVerified: false,
    verticalAngle:
      "Food and drink stores benefit from a characterful, slightly oversized heading face that matches appetite-appeal photography, balanced by a plain body face so nutrition and shipping details don't compete for attention.",
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
    defaultsVerified: false,
    typographyCharacter:
      "calm, generous-line-height typography optimized for long descriptions and lifestyle storytelling.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".section__heading, .product-description",
    selectorsVerified: false,
    verticalAngle:
      "Home and furniture stores lean editorial — a refined serif or wide sans for headings paired with a generous-line-height body face suits long product descriptions and lifestyle storytelling.",
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
    defaultsVerified: false,
    typographyCharacter:
      "editorial display headings with restrained body copy that defers to imagery.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".gallery__caption, .collection__title",
    selectorsVerified: false,
    verticalAngle:
      "Gallery and portfolio stores should let the imagery lead: a restrained editorial heading face and a quiet body face keep the typography deferential to the work on display.",
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
    defaultsVerified: false,
    typographyCharacter:
      "warm, slightly old-style serif headings that feel curated rather than generic.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".product__vendor, .recipe-card__title",
    selectorsVerified: false,
    verticalAngle:
      "Specialty food and wine stores read as curated when headings use a warm old-style serif, with an understated body face so tasting notes and provenance copy feel considered rather than loud.",
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
    defaultsVerified: false,
    typographyCharacter:
      "cinematic display sizing meant to be paired with autoplaying hero video.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".hero__heading, .product__title",
    selectorsVerified: false,
    verticalAngle:
      "Fashion and entertainment stores can push cinematic display sizing for headings to match hero video, but keep the body face simple so the drama stays in the imagery, not the paragraph text.",
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
    defaultsVerified: false,
    typographyCharacter:
      "geometric-leaning sans typography that complements the theme's hard-edged blocks.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".color-block__heading, .product-card__title",
    selectorsVerified: false,
    verticalAngle:
      "Novelty and gift stores pair well with a geometric, slightly playful heading face that complements bold color blocks, while a neutral body face keeps product details clear.",
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
    defaultsVerified: false,
    typographyCharacter:
      "transitional serif headings paired with low-contrast body for craft-shop authenticity.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".product__title, .testimonial__quote",
    selectorsVerified: false,
    verticalAngle:
      "Artisan and maker stores feel authentic with a transitional serif for headings and a low-contrast body face — the goal is hand-made warmth, not corporate polish.",
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
    defaultsVerified: false,
    typographyCharacter:
      "industrial sans headings that work well next to spec tables and dimension copy.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".specs__heading, .product__title",
    selectorsVerified: false,
    verticalAngle:
      "Outdoor and equipment stores carry spec-heavy pages, so an industrial sans for headings and a highly legible body face keep dimension tables and compatibility notes scannable.",
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
    defaultsVerified: false,
    typographyCharacter:
      "editorial serif headings paired with reader-optimized body copy for article-shaped pages.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".article__title, .blog__excerpt",
    selectorsVerified: false,
    verticalAngle:
      "Publishing and information-product stores read best with an editorial serif for headings and a reader-optimized body face tuned for long-form, article-shaped pages.",
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
    defaultsVerified: false,
    typographyCharacter:
      "utilitarian sans typography that prioritizes scannability over personality.",
    injectionPoint: "the bottom of `assets/base.css`",
    notableSelector: ".product__title, .variant-table__cell",
    selectorsVerified: false,
    verticalAngle:
      "B2B and hardware stores prioritize scannability — a utilitarian sans for both headings and body keeps dense catalogs and multi-variant tables fast to read over any stylistic flourish.",
    popularity: "tier-2",
  },
];

export const THEME_BY_SLUG: Record<string, ThemeMeta> = Object.fromEntries(
  THEMES.map((t) => [t.slug, t]),
);

export const TIER_1_THEMES: ReadonlyArray<ThemeMeta> = THEMES.filter(
  (t) => t.popularity === "tier-1",
);
