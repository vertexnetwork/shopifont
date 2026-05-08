import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/Schema/JsonLd";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import {
  NETWORK_BRAND,
  NETWORK_SITES,
  SITE_NAME,
  absoluteUrl,
} from "@/lib/site";

export const dynamic = "force-static";

const NETWORK_DESCRIPTION =
  `${NETWORK_BRAND} is a small collection of independent web tools for online sellers and small operators. Each tool is free, requires no account, and solves one specific operational problem.`;

export const metadata: Metadata = {
  title: `${NETWORK_BRAND} — ${SITE_NAME}`,
  description: NETWORK_DESCRIPTION,
  alternates: { canonical: "/network" },
  openGraph: {
    title: NETWORK_BRAND,
    description: NETWORK_DESCRIPTION,
    url: "/network",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: NETWORK_BRAND,
    description: NETWORK_DESCRIPTION,
  },
};

export default function NetworkPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: NETWORK_BRAND, href: "/network" },
  ];

  /*
   * CollectionPage with an ItemList of WebSites. Each sister tool is
   * a peer WebSite, not a sub-page — schema.org's CollectionPage is
   * the right wrapper, and ItemList communicates "here are the items
   * collected on this page" to both Google and AI extractors. We
   * deliberately avoid Organization.subOrganization because the
   * network isn't a registered legal entity.
   */
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: NETWORK_BRAND,
    url: absoluteUrl("/network"),
    description: NETWORK_DESCRIPTION,
    inLanguage: "en-US",
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: NETWORK_SITES.length,
      itemListElement: NETWORK_SITES.map((site, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "WebSite",
          name: site.name,
          url: site.url,
          description: site.description,
        },
      })),
    },
  };

  return (
    <>
      <BreadcrumbSchema id="network-breadcrumb-schema" crumbs={crumbs} />
      <JsonLd id="network-collection-schema" data={collectionSchema} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-10">
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
            Independent tools
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            The {NETWORK_BRAND}
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80">
            {NETWORK_DESCRIPTION}
          </p>
        </header>

        <section
          aria-labelledby="tools-heading"
          className="flex flex-col gap-4"
        >
          <h2
            id="tools-heading"
            className="text-2xl font-bold tracking-tight"
          >
            Tools in the network
          </h2>
          <ul className="grid gap-3">
            {NETWORK_SITES.map((site) => (
              <li key={site.url}>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener"
                  className="group block rounded-lg border border-charcoal-line/30 hover:border-electric p-5 shadow-card transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg sm:text-xl font-semibold tracking-tight group-hover:text-electric">
                      {site.name}
                    </h3>
                    <span className="text-xs font-mono text-muted whitespace-nowrap">
                      {hostname(site.url)}
                      <span
                        aria-hidden
                        className="ml-1 transition-transform group-hover:translate-x-0.5 inline-block"
                      >
                        ↗
                      </span>
                    </span>
                  </div>
                  <p className="mt-2 text-sm sm:text-base text-charcoal/80 leading-relaxed">
                    {site.description}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="about-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="about-heading"
            className="text-2xl font-bold tracking-tight"
          >
            About the network
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Each site in the {NETWORK_BRAND} is operated independently. There
            is no shared login, no cross-site tracking, and no upsell flow
            between them — the only thing they share is a maker who keeps the
            scope tight: one problem per tool, no SaaS bundle, no signup
            wall. Each tool stands or falls on its own merit.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            More tools are added when a specific operational problem comes up
            often enough to warrant a focused utility. If you have a
            small-but-real workflow problem you&apos;d like a tool for, the
            contact address on the{" "}
            <Link href="/about" className="text-electric hover:underline">
              About page
            </Link>{" "}
            is open.
          </p>
        </section>
      </div>
    </>
  );
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
