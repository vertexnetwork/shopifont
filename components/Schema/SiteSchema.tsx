import { JsonLd } from "./JsonLd";
import { SITE_DESCRIPTION, SITE_NAME, SOCIAL_LINKS, getSiteUrl } from "@/lib/site";

/**
 * Site-wide WebSite + Organization schema. Emitted in the root layout
 * <head> on every page so AI search engines have a stable identity
 * record to attach the per-page schema to.
 *
 * `sameAs` is gated on env-verified handles — if a profile hasn't been
 * registered we omit the field rather than have Google's crawler hit a
 * 404 and quietly drop our trust signal.
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
  if (SOCIAL_LINKS.length > 0) organization.sameAs = SOCIAL_LINKS;

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
