import { JsonLd } from "./JsonLd";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/site";

type Props = {
  /** Page-specific override of the application name, e.g. for a pSEO entry. */
  name?: string;
  description?: string;
  /** Absolute or relative URL of the page hosting the app. */
  url?: string;
};

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
