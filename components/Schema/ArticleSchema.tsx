import { JsonLd } from "./JsonLd";
import { BUILD_DATE_ISO, SITE_NAME, absoluteUrl } from "@/lib/site";

/**
 * Article JSON-LD for the evergreen guide pages — content articles
 * outside the per-theme pSEO system. The pSEO pages emit
 * SoftwareApplicationSchema because they bundle a tool; the evergreen
 * pages are pure prose, so Article is the right schema.org fit.
 *
 * `datePublished` and `dateModified` both use BUILD_DATE_ISO. These
 * pages rebuild on every deploy, and the underlying advice is
 * evergreen — so a refreshed dateModified each deploy correctly
 * signals to Google + AI extractors that the content is actively
 * maintained.
 */
export function ArticleSchema({
  id,
  title,
  description,
  path,
}: {
  id: string;
  title: string;
  description: string;
  /** Canonical path including leading slash, e.g. "/uninstall-custom-font-shopify". */
  path: string;
}) {
  const url = absoluteUrl(path);
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    inLanguage: "en-US",
    datePublished: BUILD_DATE_ISO,
    dateModified: BUILD_DATE_ISO,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/favicon.svg"),
      },
    },
  };
  return <JsonLd id={id} data={data} />;
}
