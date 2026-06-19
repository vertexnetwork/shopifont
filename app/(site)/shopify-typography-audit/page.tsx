import type { Metadata } from "next";
import Link from "next/link";
import { ShopifontAudit } from "@/components/Audit";
import { ArticleSchema } from "@/components/Schema/ArticleSchema";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { FaqSchema } from "@/components/Schema/FaqSchema";
import { SITE_NAME } from "@/lib/site";
import { EVERGREEN_ENTRIES } from "@/content/evergreen";

export const dynamic = "force-static";

const ENTRY = EVERGREEN_ENTRIES.find(
  (e) => e.slug === "shopify-typography-audit",
)!;

const META_DESCRIPTION =
  "Free 30-second Shopify typography audit. Answer four questions about your theme and store and see exactly why your fonts make the store read as stock — plus the done-for-you pairing that fixes it. No signup, runs in your browser.";

export const metadata: Metadata = {
  title: `Shopify Typography Audit — is your store's font hurting it? | ${SITE_NAME}`,
  description: META_DESCRIPTION,
  alternates: { canonical: `/${ENTRY.slug}` },
  openGraph: {
    title: "Shopify Typography Audit",
    description: META_DESCRIPTION,
    url: `/${ENTRY.slug}`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopify Typography Audit",
    description: META_DESCRIPTION,
  },
};

const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "What does the typography audit actually check?",
    a: "It takes four answers about your store — your theme, whether you've changed the fonts, your store type, and what you want your type to do — and reveals the specific reasons your store reads as stock: the default theme font almost no merchant changes, the missing hierarchy between headings and body, and whether your type fits your brand. It then prescribes the proven pairing for your vertical.",
  },
  {
    q: "Does it scan or upload my store?",
    a: "No. Nothing is uploaded and nothing leaves your browser — the audit is a fast, honest gut-check based purely on your answers, not a live crawl of your site. It points you at the right fix in 30 seconds without touching your store.",
  },
  {
    q: "Why does the stock theme font matter so much?",
    a: "Most free Shopify themes ship with the same neutral default font, and the vast majority of merchants never change it. That's the single biggest reason a store reads as “just another Shopify store” instead of a brand — the typography is doing none of the brand work. Changing it is a five-minute, CSS-only, fully reversible edit.",
  },
  {
    q: "Is the fix free?",
    a: "The pairing the audit recommends is built on free, open-licensed Google Fonts — you can do it yourself with the free generator. The paid Typography Kit is the shortcut: the decision already made, the exact copy-paste install code for your theme, the licensing cleared, and a specimen — so you skip the research and the hand-tuning.",
  },
  {
    q: "How accurate is the recommendation?",
    a: "Every recommendation maps to one of the curated pairings we'd actually install for that store type — the same logic behind the free pairings guide and the kits. It's a starting point chosen for brand fit and performance, not a guess.",
  },
];

export default function TypographyAuditPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Typography audit", href: `/${ENTRY.slug}` },
  ];

  return (
    <>
      <ArticleSchema
        id="audit-article-schema"
        title="Shopify Typography Audit"
        description={META_DESCRIPTION}
        path={`/${ENTRY.slug}`}
      />
      <BreadcrumbSchema id="audit-breadcrumb-schema" crumbs={crumbs} />
      <FaqSchema id="audit-faq-schema" faqs={FAQS} />

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
            Free diagnostic · 30 seconds · No signup
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Does your Shopify store look like every other Shopify store?
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80 leading-relaxed">
            It&apos;s usually the fonts. Most stores never change the theme
            default, so they all read the same — competent, generic, forgettable.
            Answer four quick questions and see exactly what your typography is
            doing to your brand, plus the one change that fixes it.
          </p>
        </header>

        <ShopifontAudit />

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Why typography is the fastest brand win on Shopify
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            A custom font is one of the cheapest brand changes you can ship —
            CSS-only, no app, no JavaScript, fully reversible — and one of the
            highest-impact, because type sets the tone before a shopper reads a
            single word. The trap is that the stock theme font looks{" "}
            <em>fine</em> in isolation. It only reads as generic next to the
            thousands of other stores running the exact same default. The audit
            above shows you where you stand and the proven pairing for your store
            type; the{" "}
            <Link
              href="/best-free-fonts-for-shopify"
              className="text-electric hover:underline"
            >
              best-fonts guide
            </Link>{" "}
            and{" "}
            <Link
              href="/shopify-font-pairings"
              className="text-electric hover:underline"
            >
              pairings guide
            </Link>{" "}
            are the deeper reference behind it.
          </p>
        </section>

        <section
          aria-labelledby="faq-heading"
          className="flex flex-col gap-4"
        >
          <h2 id="faq-heading" className="text-2xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-4">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-lg border border-charcoal-line/30 bg-paper p-4 sm:p-5"
              >
                <summary className="cursor-pointer font-semibold text-charcoal list-none flex items-start justify-between gap-3">
                  <span>{f.q}</span>
                  <span
                    aria-hidden
                    className="text-electric mt-0.5 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-charcoal/80 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}
