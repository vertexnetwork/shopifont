import { JsonLd } from "./JsonLd";
import { absoluteUrl } from "@/lib/site";

type Crumb = { name: string; href: string };

export function BreadcrumbSchema({
  id,
  crumbs,
}: {
  id: string;
  crumbs: ReadonlyArray<Crumb>;
}) {
  if (crumbs.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: c.name,
      item: c.href.startsWith("http") ? c.href : absoluteUrl(c.href),
    })),
  };
  return <JsonLd id={id} data={data} />;
}
