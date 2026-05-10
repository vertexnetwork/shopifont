import { JsonLd } from "./JsonLd";
import { getSameAsUrls } from "@/lib/network";
import { siteConfig } from "@/lib/site-config";

/**
 * Site-wide WebSite + Organization schema. Emitted in the (site) chrome
 * layout on every visitor-facing page so AI search engines have a
 * stable identity record to attach the per-page schema to.
 *
 * `Organization.sameAs` is hub-derived: the URLs of every other live
 * site in `public/network.json`. Re-syncing the hub fans those out
 * across all spokes' Organization schemas (spec §8).
 */
export async function SiteSchema() {
  const baseUrl = siteConfig.url;
  const sameAs = await getSameAsUrls();

  const organization: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: baseUrl,
    logo: `${baseUrl}/favicon.svg`,
    sameAs,
  };

  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: baseUrl,
      description: siteConfig.description,
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
