import { JsonLd } from "./JsonLd";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

/**
 * AboutPage + Organization JSON-LD pair. Mediavine's Journey approval
 * leans on structured data when scoring authorship and identity, so we
 * emit both: AboutPage points at the URL, Organization fills in name +
 * contact + social handles.
 */
export function AboutPageSchema({
  description,
  contactEmail,
}: {
  description: string;
  contactEmail: string;
}) {
  const url = absoluteUrl("/about");
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: `About ${SITE_NAME}`,
      description,
      url,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: absoluteUrl("/"),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/favicon.svg"),
      description,
      contactPoint: {
        "@type": "ContactPoint",
        email: contactEmail,
        contactType: "customer support",
        availableLanguage: ["English"],
      },
      sameAs: [
        "https://twitter.com/shopifont",
        "https://www.tiktok.com/@shopifont",
        "https://pinterest.com/shopifont",
      ],
    },
  ];
  return <JsonLd id="about-schema" data={data} />;
}
