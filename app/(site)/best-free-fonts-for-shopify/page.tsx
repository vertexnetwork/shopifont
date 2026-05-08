import type { Metadata } from "next";
import Link from "next/link";
import { CreativeFabricaCard } from "@/components/Affiliate/CreativeFabricaCard";
import { ArticleSchema } from "@/components/Schema/ArticleSchema";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { SITE_NAME } from "@/lib/site";
import { EVERGREEN_ENTRIES } from "@/content/evergreen";

export const dynamic = "force-static";

const ENTRY = EVERGREEN_ENTRIES.find(
  (e) => e.slug === "best-free-fonts-for-shopify",
)!;

const META_DESCRIPTION =
  "Six free, commercially-licensed fonts that work well on Shopify Dawn and other OS 2.0 themes — with concrete brand fits, file sizes, and weights for each.";

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

type FontPick = {
  name: string;
  source: string;
  category: string;
  bestFor: string;
  weights: string;
  description: string;
};

const FONT_PICKS: ReadonlyArray<FontPick> = [
  {
    name: "Inter",
    source: "Google Fonts",
    category: "Geometric sans",
    bestFor: "Default-safe modern storefronts",
    weights: "100 → 900, italic",
    description:
      "The closest thing to a default-safe choice in 2026. Designed for screen rendering at small sizes, with a wide weight range and excellent multilingual coverage (Latin, Cyrillic, Greek). Reads as modern and trustworthy without committing to a strong personality. If you can't pick, this is the one.",
  },
  {
    name: "Manrope",
    source: "Google Fonts",
    category: "Geometric sans",
    bestFor: "Tech-adjacent and digital-first brands",
    weights: "200 → 800",
    description:
      "More personality than Inter — slightly tighter spacing, friendlier curves on the lowercase a and g. Pairs well with itself for headings + body. Common in SaaS marketing sites, which makes it a good fit for software-adjacent ecommerce (electronics, accessories, smart home).",
  },
  {
    name: "Public Sans",
    source: "Google Fonts",
    category: "Humanist sans",
    bestFor: "Stores prioritizing legibility",
    weights: "100 → 900, italic",
    description:
      "Designed by the U.S. Web Design System team for government interfaces. Optimized for screen legibility at small sizes — ideal for body copy, product descriptions, and shipping policy pages. Less stylish than Inter, more readable. Good choice for high-information stores.",
  },
  {
    name: "IBM Plex Sans",
    source: "Google Fonts",
    category: "Humanist sans",
    bestFor: "Editorial-leaning brands",
    weights: "100 → 700, italic",
    description:
      "Distinctive lowercase shapes (look at the a, g, and ampersand) give it more personality than the geometric sans options without sacrificing legibility. Excellent body face. Pair with IBM Plex Serif if you want a serif-for-headings pairing without leaving the family.",
  },
  {
    name: "Outfit",
    source: "Google Fonts",
    category: "Geometric display",
    bestFor: "Lifestyle and consumer-goods brands",
    weights: "100 → 900",
    description:
      "More display-leaning than Inter or Manrope — high contrast, crisp terminals, slightly playful. Strong as a heading face; works for body but can feel busy at long lengths. Good fit for fashion-adjacent, beauty, and home-goods stores that want a face with character.",
  },
  {
    name: "Fraunces",
    source: "Google Fonts",
    category: "Display serif",
    bestFor: "Premium, fashion, and food brands",
    weights: "100 → 900, italic, multiple optical sizes",
    description:
      "A modern display serif with real character — soft entrance strokes, an unexpected ampersand, and optical sizes that let the typeface look right at headline scale and body scale without changing files. Pair it with a neutral sans (Inter, Public Sans) for the best of both worlds.",
  },
];

export default function BestFontsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Best free fonts", href: `/${ENTRY.slug}` },
  ];

  return (
    <>
      <ArticleSchema
        id="best-fonts-article-schema"
        title={ENTRY.title}
        description={META_DESCRIPTION}
        path={`/${ENTRY.slug}`}
      />
      <BreadcrumbSchema id="best-fonts-breadcrumb-schema" crumbs={crumbs} />

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
          <p className="text-xs uppercase tracking-wide text-muted">Curated list</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            The best free fonts for Shopify
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80">
            Six fonts that fit a real Shopify storefront — all free, all
            commercially-licensed under the SIL Open Font License, all
            available as self-hosted WOFF2. Each one comes with a concrete
            brand fit and a note on what it does well so you don&apos;t have
            to flip through a thousand previews to make a decision.
          </p>
          <p className="text-sm text-muted">
            Why &ldquo;self-hosted&rdquo; matters: every font on this list
            ships from your theme&apos;s <code className="font-mono text-xs">assets/</code>{" "}
            folder. No third-party CSS, no Google Fonts CDN call from your
            customer&apos;s browser, no privacy concerns,{" "}
            <Link
              href="/fix-shopify-font-layout-shift-dawn"
              className="text-electric hover:underline"
            >
              no layout shift
            </Link>
            .
          </p>
        </header>

        <section className="flex flex-col gap-6">
          {FONT_PICKS.map((pick, idx) => (
            <article
              key={pick.name}
              className="flex flex-col gap-3 rounded-lg border border-charcoal-line/30 bg-paper p-5 sm:p-6 shadow-card"
            >
              <header className="flex flex-col gap-1">
                <p className="text-xs font-mono text-electric">
                  #{idx + 1} · {pick.category}
                </p>
                <h2 className="text-2xl font-bold tracking-tight">
                  {pick.name}
                </h2>
                <p className="text-sm text-muted">
                  {pick.source} · Weights: {pick.weights}
                </p>
              </header>
              <p className="text-charcoal/80 leading-relaxed">
                <strong>Best for:</strong> {pick.bestFor}.
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                {pick.description}
              </p>
            </article>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            How to install any of these on Shopify
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Download the WOFF2 files from{" "}
            <a
              href="https://fonts.google.com/"
              target="_blank"
              rel="noopener"
              className="text-electric hover:underline"
            >
              Google Fonts
            </a>{" "}
            (or use a third-party download tool that returns just the
            weights you need). Upload them to your theme&apos;s{" "}
            <code className="font-mono text-sm">assets/</code> folder. Open
            the{" "}
            <Link href="/" className="text-electric hover:underline">
              {SITE_NAME} generator
            </Link>{" "}
            in another tab, type the font name (e.g.,{" "}
            <em>Inter</em>), tick the formats you uploaded, and copy the
            three blocks the generator outputs into the files it points
            you to. Refresh your storefront — the new font is live.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            If you change your mind, the{" "}
            <Link
              href="/uninstall-custom-font-shopify"
              className="text-electric hover:underline"
            >
              uninstall guide
            </Link>{" "}
            walks through the reversal — nothing in this workflow is
            permanent.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight">
            When free isn&apos;t enough
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Free fonts cover most stores. They don&apos;t cover every store —
            if your brand depends on a face with real personality, or you
            want exclusivity in your category, the paid market is where
            you&apos;ll find it. The two cleanest paths:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-charcoal/80 leading-relaxed">
            <li>
              <strong>Direct from a foundry.</strong> Klim Type Foundry,
              Commercial Type, Pangram Pangram, Grilli Type — buy a web
              license tier that matches your traffic. Most cost between
              $50 and $500 for a single weight depending on the foundry.
            </li>
            <li>
              <strong>A marketplace with commercial licenses included.</strong>
              {" "}Lower per-font cost, no per-pageview tier math, full
              breadth across display and body styles. The card below is
              our affiliate placement — we use it ourselves and only
              recommend it because the included commercial license is
              what makes it work for Shopify stores.
            </li>
          </ul>
        </section>

        <CreativeFabricaCard />

        <section className="flex flex-col gap-3 rounded-lg border border-charcoal-line/30 bg-paper-dim p-5">
          <h2 className="text-xl font-bold tracking-tight">
            Still narrowing down?
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            The{" "}
            <Link
              href="/how-to-choose-a-font-for-shopify"
              className="text-electric hover:underline"
            >
              decision-framework guide
            </Link>{" "}
            walks through the six axes we use to pick fonts — brand fit,
            performance budget, licensing, weights, pairing, and
            multilingual support. Worth the ten minutes before you commit.
          </p>
        </section>
      </article>
    </>
  );
}
