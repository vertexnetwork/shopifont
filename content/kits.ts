/**
 * The Shopify Typography Kit catalog — single source of truth for the
 * paid digital product.
 *
 * Each kit maps 1:1 to a curated pairing already published on
 * /shopify-font-pairings. That mapping is INTENTIONAL and load-bearing:
 * the free pairings guide is the top-of-funnel SEO surface, the kit is
 * the paid "done-for-you" version of the same recommendation. If a kit
 * here ever disagrees with the pairings page, the funnel is lying to
 * the buyer. Keep them in lock-step.
 *
 * Every font is SIL Open Font License (OFL) — free to self-host and
 * use commercially on a Shopify storefront, zero licensing liability
 * for the buyer OR for us (we redistribute nothing; the buyer fetches
 * the files from Google Fonts using the exact instructions in the
 * kit). The product value is the decision + the pre-generated
 * per-theme install code + the playbook + the de-risking, NOT the
 * font files themselves.
 *
 * scripts/build-kits.ts consumes this to emit the downloadable
 * bundles. Pricing lives on Gumroad, not here.
 */

export type KitFontRole = "heading" | "body";

export type KitFont = {
  /** Exact Google Fonts family name (also the CSS font-family value). */
  family: string;
  /** Google Fonts family page — where the buyer downloads the files. */
  googleFontsUrl: string;
  /**
   * Weights shipped in the kit for this family. Regular + Bold covers
   * headings (Bold), body (Regular), and emphasis. Matches the
   * "2 weights each" file-budget copy on the pairings page.
   */
  weights: ReadonlyArray<400 | 700>;
};

export type Kit = {
  /** URL-safe id; also the bundle folder name. */
  slug: string;
  /** Display name on the sales page + in the bundle. */
  name: string;
  /** One-line "who this is for" — reused from the pairing's bestFor. */
  vertical: string;
  /** The curated pairing key on /shopify-font-pairings (consistency anchor). */
  pairingKey: string;
  heading: KitFont;
  body: KitFont;
  /** Same-family kit (heading family === body family). */
  singleFamily: boolean;
  /** Why this pairing works — verbatim from the pairings IP. */
  rationale: string;
  /** The one mistake that ruins it — verbatim from the pairings IP. */
  pitfall: string;
  /** Honest WOFF2 budget, matches the pairings page. */
  fileBudget: string;
};

const OFL_FAMILIES = {
  fraunces: {
    family: "Fraunces",
    googleFontsUrl: "https://fonts.google.com/specimen/Fraunces",
    weights: [400, 700] as const,
  },
  inter: {
    family: "Inter",
    googleFontsUrl: "https://fonts.google.com/specimen/Inter",
    weights: [400, 700] as const,
  },
  playfair: {
    family: "Playfair Display",
    googleFontsUrl: "https://fonts.google.com/specimen/Playfair+Display",
    weights: [400, 700] as const,
  },
  lato: {
    family: "Lato",
    googleFontsUrl: "https://fonts.google.com/specimen/Lato",
    weights: [400, 700] as const,
  },
  montserrat: {
    family: "Montserrat",
    googleFontsUrl: "https://fonts.google.com/specimen/Montserrat",
    weights: [400, 700] as const,
  },
  openSans: {
    family: "Open Sans",
    googleFontsUrl: "https://fonts.google.com/specimen/Open+Sans",
    weights: [400, 700] as const,
  },
  lora: {
    family: "Lora",
    googleFontsUrl: "https://fonts.google.com/specimen/Lora",
    weights: [400, 700] as const,
  },
  outfit: {
    family: "Outfit",
    googleFontsUrl: "https://fonts.google.com/specimen/Outfit",
    weights: [400, 700] as const,
  },
  publicSans: {
    family: "Public Sans",
    googleFontsUrl: "https://fonts.google.com/specimen/Public+Sans",
    weights: [400, 700] as const,
  },
} as const;

export const KITS: ReadonlyArray<Kit> = [
  {
    slug: "premium-editorial",
    name: "Premium Editorial",
    vertical: "Premium fashion, food, and curated-goods brands",
    pairingKey: "fraunces-inter",
    heading: OFL_FAMILIES.fraunces,
    body: OFL_FAMILIES.inter,
    singleFamily: false,
    rationale:
      "Fraunces brings real serif character at headline scale — soft entrance strokes, optical sizes that look right at H1 and H2. Inter handles body copy with screen-rendering quality no display serif can match. The contrast is high enough to create hierarchy without feeling forced.",
    pitfall:
      "Don't use Fraunces for body copy at small sizes. The optical-size variant that flatters headlines distracts at 16px paragraph scale. The kit ships Fraunces only for headings (H1–H3) for exactly this reason.",
    fileBudget: "~160KB total (Regular + Bold each, WOFF2)",
  },
  {
    slug: "luxury-classic",
    name: "Luxury Classic",
    vertical: "Beauty, jewelry, and luxury-positioning apparel",
    pairingKey: "playfair-lato",
    heading: OFL_FAMILIES.playfair,
    body: OFL_FAMILIES.lato,
    singleFamily: false,
    rationale:
      "Playfair Display reads as upmarket instantly; Lato is forgiving across body sizes and weights. The most-recommended luxury pairing on Shopify — zero-thought-required for fashion-adjacent stores that want to look established on day one.",
    pitfall:
      "Playfair Display is everywhere in luxury, so it can read as generic. If you want premium feel with a fresher silhouette, the Premium Editorial kit (Fraunces) is the same vertical with more distinction.",
    fileBudget: "~150KB total (Regular + Bold each, WOFF2)",
  },
  {
    slug: "dtc-friendly",
    name: "DTC Friendly",
    vertical: "Skincare, supplements, and DTC lifestyle brands",
    pairingKey: "montserrat-open-sans",
    heading: OFL_FAMILIES.montserrat,
    body: OFL_FAMILIES.openSans,
    singleFamily: false,
    rationale:
      "Both fonts have wide letterforms and friendly proportions — they read as approachable and consumer-facing without being childish. The most common pairing on DTC storefronts, which means it scans as trustworthy to a shopping audience.",
    pitfall:
      "Montserrat below 14px eats horizontal space and breaks product-card layouts. The kit keeps Montserrat on headings and Open Sans on body — never the inverse.",
    fileBudget: "~145KB total (Regular + Bold each, WOFF2)",
  },
  {
    slug: "editorial-warm",
    name: "Editorial Warm",
    vertical: "Editorial brands, artisan food, and long-copy stores",
    pairingKey: "lora-open-sans",
    heading: OFL_FAMILIES.lora,
    body: OFL_FAMILIES.openSans,
    singleFamily: false,
    rationale:
      "Lora is a serif designed for body reading — calligraphic roots, comfortable at long lengths. Used in Bold as a heading face it brings editorial gravitas without the high-contrast drama of Playfair. Open Sans handles secondary body and UI text.",
    pitfall:
      "Lora wasn't built for huge display sizes. The kit uses Lora Bold (700) for headings and caps it at H1 — for oversized hero text, use the Premium Editorial or Luxury Classic kit instead.",
    fileBudget: "~150KB total (Regular + Bold each, WOFF2)",
  },
  {
    slug: "modern-tech",
    name: "Modern Tech",
    vertical: "Consumer electronics, smart home, and tech-leaning DTC",
    pairingKey: "outfit-public-sans",
    heading: OFL_FAMILIES.outfit,
    body: OFL_FAMILIES.publicSans,
    singleFamily: false,
    rationale:
      "Outfit has more personality than Inter or Manrope — high contrast and crisp terminals make it feel intentional at display sizes. Public Sans was built for legibility at small sizes by the U.S. Web Design System team, so body copy stays workable on long product-detail pages.",
    pitfall:
      "Outfit gets busy in long body copy. The kit ships Outfit on headings only and Public Sans for everything else.",
    fileBudget: "~135KB total (Regular + Bold each, WOFF2)",
  },
  {
    slug: "minimal-fast",
    name: "Minimal & Fast",
    vertical: "Minimal, performance-first, single-family storefronts",
    pairingKey: "inter-inter",
    heading: OFL_FAMILIES.inter,
    body: OFL_FAMILIES.inter,
    singleFamily: true,
    rationale:
      "The lightest performance budget of any kit. Inter was designed for screen rendering at every size, so one family handles both display and body with no x-height mismatch and the smallest possible file payload. The default-safe choice.",
    pitfall:
      "Inter is neutral by design. If your brand needs type to carry personality (fashion, luxury, food editorial), pick the Premium Editorial or Luxury Classic kit instead — this one optimizes for speed and clarity, not character.",
    fileBudget: "~70KB total (Regular + Bold, WOFF2)",
  },
];

export function kitBySlug(slug: string): Kit | undefined {
  return KITS.find((k) => k.slug === slug);
}
