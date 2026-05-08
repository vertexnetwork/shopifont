import { JsonLd } from "./JsonLd";
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/site";

/**
 * Site-wide WebSite + Organization schema. Emitted in the root layout
 * <head> on every page so AI search engines have a stable identity
 * record to attach the per-page schema to.
 */
export function SiteSchema() {
  const baseUrl = getSiteUrl();
  const organization: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: baseUrl,
    logo: `${baseUrl}/favicon.svg`,
  };

  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: baseUrl,
      description: SITE_DESCRIPTION,
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/{search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    organization,
  ];
  return <JsonLd id="site-schema" data={data} />;
}
