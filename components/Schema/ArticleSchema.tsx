import { JsonLd } from "./JsonLd";
import { BUILD_DATE_ISO, SITE_LAUNCH_ISO, SITE_NAME, absoluteUrl } from "@/lib/site";

/**
 * Article JSON-LD for the evergreen guide pages — content articles
 * outside the per-theme pSEO system. The pSEO pages emit
 * SoftwareApplicationSchema because they bundle a tool; the evergreen
 * pages are pure prose, so Article is the right schema.org fit.
 *
 * `dateModified` uses BUILD_DATE_ISO (the last content deploy's commit
 * date) so a refresh each real content change signals active
 * maintenance to Google + AI extractors. `datePublished` defaults to
 * SITE_LAUNCH_ISO (the site's first-commit date) so the two stay
 * distinct — published == modified on every deploy is a machine-stamped
 * tell. Pass `datePublished` to override when a page's true first-
 * published date differs from launch.
 */
export function ArticleSchema({
  id,
  title,
  description,
  path,
  datePublished,
}: {
  id: string;
  title: string;
  description: string;
  /** Canonical path including leading slash, e.g. "/uninstall-custom-font-shopify". */
  path: string;
  /** ISO date the article was first published. Defaults to SITE_LAUNCH_ISO. */
  datePublished?: string;
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
    datePublished: datePublished ?? SITE_LAUNCH_ISO,
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
