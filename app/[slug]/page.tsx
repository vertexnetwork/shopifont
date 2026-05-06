import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShopifontGenerator } from "@/components/Generator";
import { AdSlot } from "@/components/Layout/AdSlot";
import { RelatedLinks } from "@/components/Layout/RelatedLinks";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { FaqSchema } from "@/components/Schema/FaqSchema";
import { SoftwareApplicationSchema } from "@/components/Schema/SoftwareApplicationSchema";
import { PSEO_BY_SLUG, PSEO_ENTRIES } from "@/content/pseo";
import { BUILD_DATE_ISO, absoluteUrl, getBuildDateLabel } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PSEO_ENTRIES.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = PSEO_BY_SLUG[slug];
  if (!entry) return {};
  const url = absoluteUrl(`/${entry.slug}`);
  return {
    title: entry.metaTitle,
    description: entry.metaDescription,
    alternates: { canonical: `/${entry.slug}` },
    openGraph: {
      title: entry.metaTitle,
      description: entry.metaDescription,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: entry.metaTitle,
      description: entry.metaDescription,
    },
  };
}

export default async function PseoPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = PSEO_BY_SLUG[slug];
  if (!entry) notFound();

  const crumbs = [
    { name: "Home", href: "/" },
    { name: entry.breadcrumbLabel, href: `/${entry.slug}` },
  ];

  return (
    <>
      <SoftwareApplicationSchema
        name={`${entry.h1} | Shopifont`}
        description={entry.metaDescription}
        url={`/${entry.slug}`}
      />
      <FaqSchema id="faq-schema" faqs={entry.faqs} />
      <BreadcrumbSchema id="breadcrumb-schema" crumbs={crumbs} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-10">
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

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <p className="text-xs uppercase tracking-wide text-muted">
              Shopify {entry.theme} · Free, no signup ·{" "}
              <span className="normal-case tracking-normal">
                Last updated{" "}
                <time dateTime={BUILD_DATE_ISO}>{getBuildDateLabel()}</time>
              </span>
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              {entry.h1}
            </h1>
            <p className="text-base sm:text-lg text-charcoal/80 max-w-2xl">
              {entry.oneLineAnswer}
            </p>
            <p className="text-sm text-charcoal/80 max-w-2xl">{entry.intro}</p>
          </div>
          <AdSlot id="ad-leaderboard" position="leaderboard" className="hidden lg:flex" />
        </section>

        <section aria-labelledby="tool-heading" className="flex flex-col gap-4">
          <h2 id="tool-heading" className="sr-only">
            Generator
          </h2>
          <ShopifontGenerator />
        </section>

        <section
          aria-labelledby="usecase-heading"
          className="prose prose-charcoal max-w-none"
        >
          <h2
            id="usecase-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            How to use this on {entry.theme}
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-charcoal/80 whitespace-pre-line">
            {entry.useCase}
          </p>
        </section>

        <AdSlot id="ad-incontent" position="in-content" />

        <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
          <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <ul className="flex flex-col gap-3">
            {entry.faqs.map((f) => (
              <li
                key={f.q}
                className="rounded-lg border border-charcoal-line/30 p-4"
              >
                <h3 className="text-base font-semibold tracking-tight">
                  {f.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/80">
                  {f.a}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <RelatedLinks slugs={entry.relatedSlugs} />
      </div>
    </>
  );
}
