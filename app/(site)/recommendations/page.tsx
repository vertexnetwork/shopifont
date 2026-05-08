import type { Metadata } from "next";
import Link from "next/link";
import { CreativeFabricaCard } from "@/components/Affiliate/CreativeFabricaCard";
import { PrintifyCard } from "@/components/Affiliate/PrintifyCard";
import { ArticleSchema } from "@/components/Schema/ArticleSchema";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { JsonLd } from "@/components/Schema/JsonLd";
import {
  CREATIVE_FABRICA_REF,
  NETWORK_SITES,
  PRINTIFY_REF,
  SITE_NAME,
  absoluteUrl,
} from "@/lib/site";
import { EVERGREEN_ENTRIES } from "@/content/evergreen";

export const dynamic = "force-static";

const ENTRY = EVERGREEN_ENTRIES.find((e) => e.slug === "recommendations")!;

const META_DESCRIPTION =
  "The print-on-demand, font marketplace, and sister tools we recommend for Shopify merchants. Affiliate-tagged where applicable; commissions disclosed.";

export const metadata: Metadata = {
  title: `${ENTRY.title} | ${SITE_NAME}`,
  description: META_DESCRIPTION,
  alternates: { canonical: `/${ENTRY.slug}` },
  openGraph: {
    title: ENTRY.title,
    description: META_DESCRIPTION,
    url: `/${ENTRY.slug}`,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: ENTRY.title,
    description: META_DESCRIPTION,
  },
};

type AffiliateRow = {
  name: string;
  url: string;
  category: string;
  description: string;
};

const AFFILIATE_ROWS: ReadonlyArray<AffiliateRow> = [
  {
    name: "Printify",
    url: PRINTIFY_REF,
    category: "Print-on-demand fulfillment",
    description:
      "Plugs into Shopify in one click. 900+ products, no inventory risk, fulfilled and shipped automatically when an order lands. Free to start; pay only when you sell.",
  },
  {
    name: "Creative Fabrica",
    url: CREATIVE_FABRICA_REF,
    category: "Web font marketplace",
    description:
      "30,000+ web fonts with commercial licenses included — drop one into the @font-face block this site generates and you're live. Most fonts under $20.",
  },
];

export default function RecommendationsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Recommended tools", href: `/${ENTRY.slug}` },
  ];

  /*
   * CollectionPage with ItemList — same schema shape /network uses,
   * but the items here are external services (mainEntityOfPage points
   * at the affiliate URLs). AI extractors prefer this structure for
   * "what tools does this site recommend" answers.
   */
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: ENTRY.title,
    url: absoluteUrl(`/${ENTRY.slug}`),
    description: META_DESCRIPTION,
    inLanguage: "en-US",
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: AFFILIATE_ROWS.length,
      itemListElement: AFFILIATE_ROWS.map((row, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "WebSite",
          name: row.name,
          url: row.url,
          description: row.description,
        },
      })),
    },
  };

  return (
    <>
      <ArticleSchema
        id="recommendations-article-schema"
        title={ENTRY.title}
        description={META_DESCRIPTION}
        path={`/${ENTRY.slug}`}
      />
      <BreadcrumbSchema id="recommendations-breadcrumb-schema" crumbs={crumbs} />
      <JsonLd id="recommendations-collection-schema" data={collectionSchema} />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <ol className="flex flex-wrap gap-1">
            {crumbs.map((c, idx) => (
              <li key={c.href} className="flex items-center gap-1">
                {idx > 0 ? <span aria-hidden>›</span> : null}
                {idx === crumbs.length - 1 ? (
                  <span aria-current="page" className="text-charcoal">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.href} className="hover:text-electric">
                    {c.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-wide text-muted">
            Affiliate disclosure inline
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Tools we recommend for Shopify merchants
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80">
            A short list of the print-on-demand, font, and sister-tool surfaces
            we&apos;d use on our own Shopify stores. The first two are
            affiliate links — clicking through and signing up earns us a
            commission at no cost to you. We only list what we&apos;d use
            without the affiliate relationship.
          </p>
        </header>

        <section
          aria-labelledby="affiliates-heading"
          className="flex flex-col gap-4"
        >
          <h2
            id="affiliates-heading"
            className="text-2xl font-bold tracking-tight"
          >
            Affiliate-tagged
          </h2>
          <PrintifyCard />
          <CreativeFabricaCard />
        </section>

        {NETWORK_SITES.length > 0 ? (
          <section
            aria-labelledby="network-heading"
            className="flex flex-col gap-4"
          >
            <h2
              id="network-heading"
              className="text-2xl font-bold tracking-tight"
            >
              Sister tools (no affiliate)
            </h2>
            <p className="text-sm text-charcoal/80">
              The rest of the Vertex Network — small, single-purpose web
              tools maintained by the same builder. No affiliate code, just
              sister properties we ship from the same workflow.
            </p>
            <ul className="flex flex-col gap-3">
              {NETWORK_SITES.map((site) => (
                <li
                  key={site.url}
                  className="rounded-lg border border-charcoal-line/30 p-4 shadow-card"
                >
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener"
                    className="font-semibold tracking-tight hover:text-electric"
                  >
                    {site.name} →
                  </a>
                  <p className="mt-1.5 text-sm text-charcoal/80 leading-relaxed">
                    {site.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="rounded-md border border-charcoal-line/20 bg-paper-dim/50 p-4 text-xs text-muted leading-relaxed">
          <strong className="text-charcoal block mb-1">
            Why we disclose this
          </strong>
          Affiliate commissions cover the hosting and domain costs of running{" "}
          {SITE_NAME} as a free tool. We list only services we&apos;d use
          ourselves; if a recommendation here turns out not to hold up,
          we&apos;ll pull it. Mediavine display ads (when active) and
          AdSense (when active) cover the rest.
        </section>
      </article>
    </>
  );
}
