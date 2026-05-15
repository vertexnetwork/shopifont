import { JsonLd } from "./JsonLd";
import { THEMES } from "@/content/themes";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/site";

type Props = {
  /** Page-specific override of the application name, e.g. for a pSEO entry. */
  name?: string;
  description?: string;
  /** Absolute or relative URL of the page hosting the app. */
  url?: string;
};

/**
 * Concrete feature list describing what the Shopifont generator
 * actually does. Sourced from real tool capabilities — the format
 * support is verified in lib/generators/fontFace.test.ts, the theme
 * list comes from content/themes.ts so it stays in sync as themes
 * are added. Each line is a named entity Google's NLP can match
 * against ecommerce + Shopify queries.
 */
const SUPPORTED_THEME_NAMES = THEMES.map((t) => t.name).join(", ");

const FEATURE_LIST: ReadonlyArray<string> = [
  "Generates @font-face CSS with the Shopify Liquid asset_url filter",
  "Generates a settings_schema.json snippet for the Shopify theme editor",
  "Generates CSS variable overrides for OS 2.0 typography tokens",
  "Supports WOFF2, WOFF, TTF, OTF, and EOT font formats",
  `Tailored output for 13 free Shopify themes (${SUPPORTED_THEME_NAMES})`,
  "100% client-side — fonts never leave the user's browser",
  "Zero cumulative layout shift via size-adjust fallback metrics",
  "font-display: swap output for fast first paint",
  "Pure CSS output — no JavaScript runtime added to the storefront",
  "Free Chrome extension for in-context font generation in the Shopify admin",
];

export function SoftwareApplicationSchema({ name, description, url }: Props) {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: name ?? SITE_NAME,
    description: description ?? SITE_DESCRIPTION,
    url: url ? (url.startsWith("http") ? url : absoluteUrl(url)) : absoluteUrl("/"),
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript and a modern browser.",
    featureList: FEATURE_LIST,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
  return <JsonLd id="software-application-schema" data={data} />;
}
