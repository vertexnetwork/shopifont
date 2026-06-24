import type { Metadata } from "next";
import Link from "next/link";
import { KitUpsell } from "@/components/KitUpsell";
import { ArticleSchema } from "@/components/Schema/ArticleSchema";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { FaqSchema } from "@/components/Schema/FaqSchema";
import { SITE_NAME } from "@/lib/site";
import { EVERGREEN_ENTRIES } from "@/content/evergreen";

export const dynamic = "force-static";

const ENTRY = EVERGREEN_ENTRIES.find((e) => e.slug === "best-free-fonts-for-shopify")!;

const META_DESCRIPTION =
  "The best fonts for a Shopify store in 2026 — six curated picks for performance-first storefronts plus the six popular fonts (Montserrat, Roboto, Poppins, Playfair Display, Open Sans, Lora) most lists recommend, with side-by-side weight, file-size, and license data.";

export const metadata: Metadata = {
  title: `Best Fonts for Shopify Stores (2026) | ${SITE_NAME}`,
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
  fileSize: string;
  description: string;
};

/**
 * The curated section. These are the fonts we actually install on
 * storefronts when we have full discretion — chosen for screen-rendering
 * quality, weight range, and license cleanliness. Order is "default-safe
 * → editorial → display."
 */
const CURATED_PICKS: ReadonlyArray<FontPick> = [
  {
    name: "Inter",
    source: "Google Fonts · SIL OFL",
    category: "Geometric sans",
    bestFor: "Default-safe modern storefronts",
    weights: "100 → 900, italic",
    fileSize: "~35KB / weight (WOFF2)",
    description:
      "The closest thing to a default-safe choice in 2026. Designed for screen rendering at small sizes, with a wide weight range and excellent multilingual coverage (Latin, Cyrillic, Greek). Reads as modern and trustworthy without committing to a strong personality. If you can't pick, this is the one.",
  },
  {
    name: "Manrope",
    source: "Google Fonts · SIL OFL",
    category: "Geometric sans",
    bestFor: "Tech-adjacent and digital-first brands",
    weights: "200 → 800",
    fileSize: "~30KB / weight (WOFF2)",
    description:
      "More personality than Inter — slightly tighter spacing, friendlier curves on the lowercase a and g. Pairs well with itself for headings + body. Common in SaaS marketing sites, which makes it a good fit for software-adjacent ecommerce (electronics, accessories, smart home).",
  },
  {
    name: "Public Sans",
    source: "Google Fonts · SIL OFL",
    category: "Humanist sans",
    bestFor: "Stores prioritizing legibility",
    weights: "100 → 900, italic",
    fileSize: "~28KB / weight (WOFF2)",
    description:
      "Designed by the U.S. Web Design System team for government interfaces. Optimized for screen legibility at small sizes — ideal for body copy, product descriptions, and shipping policy pages. Less stylish than Inter, more readable. Good choice for high-information stores.",
  },
  {
    name: "IBM Plex Sans",
    source: "Google Fonts · SIL OFL",
    category: "Humanist sans",
    bestFor: "Editorial-leaning brands",
    weights: "100 → 700, italic",
    fileSize: "~32KB / weight (WOFF2)",
    description:
      "Distinctive lowercase shapes (look at the a, g, and ampersand) give it more personality than the geometric sans options without sacrificing legibility. Excellent body face. Pair with IBM Plex Serif if you want a serif-for-headings pairing without leaving the family.",
  },
  {
    name: "Outfit",
    source: "Google Fonts · SIL OFL",
    category: "Geometric display",
    bestFor: "Lifestyle and consumer-goods brands",
    weights: "100 → 900",
    fileSize: "~26KB / weight (WOFF2)",
    description:
      "More display-leaning than Inter or Manrope — high contrast, crisp terminals, slightly playful. Strong as a heading face; works for body but can feel busy at long lengths. Good fit for fashion-adjacent, beauty, and home-goods stores that want a face with character.",
  },
  {
    name: "Fraunces",
    source: "Google Fonts · SIL OFL",
    category: "Display serif",
    bestFor: "Premium, fashion, and food brands",
    weights: "100 → 900, italic, optical sizes",
    fileSize: "~45KB / weight (WOFF2)",
    description:
      "A modern display serif with real character — soft entrance strokes, an unexpected ampersand, and optical sizes that let the typeface look right at headline scale and body scale without changing files. Pair it with a neutral sans (Inter, Public Sans) for the best of both worlds.",
  },
];

/**
 * The "popular alternatives" section — entity coverage. These are the
 * six fonts that every other Shopify-fonts list cites, which means
 * users searching "best font for shopify" expect to see them. We
 * include them with honest notes on where each one wins or where one
 * of our curated picks beats it for ecommerce specifically. This is
 * the EEAT differentiator — every other list regurgitates these names
 * without explaining when they're the wrong call.
 */
const POPULAR_ALTERNATIVES: ReadonlyArray<FontPick> = [
  {
    name: "Montserrat",
    source: "Google Fonts · SIL OFL",
    category: "Geometric sans",
    bestFor: "Brands that want a recognizable, friendly sans",
    weights: "100 → 900, italic",
    fileSize: "~40KB / weight (WOFF2)",
    description:
      "The single most-recommended Shopify font on the internet. Friendly, geometric, instantly readable. The catch: it's used by so many stores that it reads as a default — which is fine if your differentiation is product, not type. If you want personality, Outfit or Manrope cover similar territory with more distinction.",
  },
  {
    name: "Roboto",
    source: "Google Fonts · Apache 2.0",
    category: "Neo-grotesque sans",
    bestFor: "Tech-leaning stores that want familiarity",
    weights: "100 → 900, italic",
    fileSize: "~35KB / weight (WOFF2)",
    description:
      "Google's flagship UI font, optimized for screen rendering across devices. Looks credible and modern but blends in — your store will look like a Google product, which is either reassuring or generic depending on your brand. Inter is a slightly sharper alternative for ecommerce specifically.",
  },
  {
    name: "Poppins",
    source: "Google Fonts · SIL OFL",
    category: "Geometric sans",
    bestFor: "Youth-leaning DTC brands",
    weights: "100 → 900, italic",
    fileSize: "~32KB / weight (WOFF2)",
    description:
      "Round, geometric, friendly. Reads as approachable and consumer-facing — works well for skincare, supplements, lifestyle DTC. Watch the bold weights: at large sizes Poppins can feel uniform and lose hierarchy. Pair with itself at multiple weights, not with another geometric sans.",
  },
  {
    name: "Playfair Display",
    source: "Google Fonts · SIL OFL",
    category: "Display serif",
    bestFor: "Fashion, beauty, and luxury-positioning brands",
    weights: "400 → 900, italic",
    fileSize: "~42KB / weight (WOFF2)",
    description:
      'The default "premium" serif on Shopify storefronts. High contrast, dramatic, instantly readable as upmarket. The pitfall: it\'s so common in fashion that it can read as generic luxury. Fraunces is a more distinctive modern serif with optical sizing — use Playfair if you want safe-and-recognizable, Fraunces if you want differentiated.',
  },
  {
    name: "Open Sans",
    source: "Google Fonts · SIL OFL",
    category: "Humanist sans",
    bestFor: "High-information stores prioritizing readability",
    weights: "300 → 800, italic",
    fileSize: "~30KB / weight (WOFF2)",
    description:
      "A workhorse body face — slightly wider letterforms than Inter, friendlier than Roboto, excellent at small sizes. Reasonable default for product descriptions and policy pages. Public Sans is a more modern alternative built on similar principles with a tighter file budget.",
  },
  {
    name: "Lora",
    source: "Google Fonts · SIL OFL",
    category: "Text serif",
    bestFor: "Editorial-leaning brands wanting a body serif",
    weights: "400 → 700, italic",
    fileSize: "~38KB / weight (WOFF2)",
    description:
      "A serif designed for body copy (not headlines) — calligraphic roots, comfortable at long reading lengths. Good fit for content-heavy stores (cookbooks, journals, curated-goods brands with detailed product stories). Pair with a neutral sans like Inter or Public Sans for headings.",
  },
];

/**
 * Pairings teaser — three representative pairings (default-safe
 * premium, friendly DTC, single-family budget). The full ten-pairing
 * guide lives at /shopify-font-pairings — concentrating pairing-query
 * authority on one canonical URL instead of competing two pages.
 */
const PAIRINGS_TEASER: ReadonlyArray<{
  heading: string;
  body: string;
  note: string;
}> = [
  {
    heading: "Fraunces",
    body: "Inter",
    note: "Modern serif headline + neutral sans body. Default-safe premium pairing for fashion, food, and curated-goods brands.",
  },
  {
    heading: "Montserrat",
    body: "Open Sans",
    note: "Friendly DTC pairing. Heavy Montserrat headings + readable body. Works for skincare, supplements, lifestyle.",
  },
  {
    heading: "Poppins",
    body: "Poppins",
    note: "Single-family pairing — Bold for headings, Regular for body. Cleanest performance budget; hardest to mess up.",
  },
];

const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "What is the best font for a Shopify store?",
    a: "There is no single best font — the right pick depends on your brand. For most modern storefronts, Inter is the default-safe choice (excellent screen rendering, wide weight range, SIL OFL licensed for free commercial use). For fashion or luxury brands, Fraunces or Playfair Display work well. For tech-adjacent DTC, Manrope or Poppins. The most important rule is keeping total font weight under 100KB and using font-display: swap to protect Core Web Vitals.",
  },
  {
    q: "How many fonts should I use on a Shopify store?",
    a: "Two at most: one for headings, one for body. Many of the best storefronts use a single typeface with multiple weights — for example, Inter Bold for headings and Inter Regular for body. Loading three or more fonts almost always pushes your LCP over budget without producing a meaningfully better visual result.",
  },
  {
    q: "Are Google Fonts free to use commercially on a Shopify store?",
    a: "Yes. Every font on Google Fonts is released under either the SIL Open Font License or Apache 2.0, both of which permit free commercial use including ecommerce. You can self-host the WOFF2 files in your theme's assets/ folder without restriction. Most premium foundries license differently — read their EULA before installing a paid font.",
  },
  {
    q: "Does font choice affect Shopify conversion rate?",
    a: "Indirectly, yes. Font choice itself rarely moves conversion on its own, but font-loading behavior does — fonts that block text rendering (no font-display: swap) or push your LCP over 2.5s measurably hurt conversion at scale. Performance-first font installation matters more for conversion than which specific typeface you pick.",
  },
  {
    q: "What's the best font pairing for a Shopify store?",
    a: "The safest pairings combine a display face for headings with a neutral sans for body — for example, Fraunces (headings) + Inter (body), or Playfair Display (headings) + Lato (body). Pairing two display faces or two faces from the same category (two geometric sans) is the most common pairing mistake and almost always reduces hierarchy rather than improving it.",
  },
];

const ALL_FONTS: ReadonlyArray<FontPick> = [...CURATED_PICKS, ...POPULAR_ALTERNATIVES];

export default function BestFontsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Best fonts for Shopify", href: `/${ENTRY.slug}` },
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
      <FaqSchema id="best-fonts-faq-schema" faqs={FAQS} />

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
          <p className="text-xs uppercase tracking-wide text-muted">Curated list · Updated 2026</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            The best fonts for a Shopify store (2026)
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80">
            Twelve fonts that actually work on a Shopify storefront — six curated picks for
            performance-first stores, plus the six popular fonts most lists recommend, with honest
            notes on where each one wins or loses. Every font on this list is free, commercially
            licensed, and self-hostable as WOFF2.
          </p>
          <p className="text-sm text-muted">
            Why self-hosted matters: every font here ships from your theme&apos;s{" "}
            <code className="font-mono text-xs">assets/</code> folder. No third-party CSS, no Google
            Fonts CDN call from your customer&apos;s browser, no privacy concerns,{" "}
            <Link
              href="/fix-shopify-font-layout-shift-dawn"
              className="text-electric hover:underline"
            >
              no layout shift
            </Link>
            .
          </p>
        </header>

        <Link
          href="/shopify-typography-audit"
          className="group flex flex-col gap-1 rounded-lg border border-electric/30 bg-gradient-to-br from-electric/[0.06] via-electric/[0.02] to-transparent p-4 sm:p-5 hover:border-electric/60 transition-colors"
        >
          <span className="text-sm font-semibold text-charcoal">
            Not sure which of these is right for your store?
          </span>
          <span className="text-sm text-muted">
            Take the free 30-second typography audit — it reads your theme and store type and tells
            you the exact pairing to use, and whether your current font is making you look stock.{" "}
            <span className="text-electric group-hover:underline whitespace-nowrap">
              Start the audit →
            </span>
          </span>
        </Link>

        <section aria-labelledby="comparison-heading" className="flex flex-col gap-3">
          <h2 id="comparison-heading" className="text-2xl font-bold tracking-tight">
            Side-by-side comparison
          </h2>
          <p className="text-sm text-muted">
            Sorted by category, then by how often we install them. Weight figures are per-weight
            WOFF2 file size — multiply by the number of weights you ship.
          </p>
          <div className="overflow-x-auto rounded-lg border border-charcoal-line/30">
            <table className="w-full text-sm">
              <thead className="bg-paper-dim text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Font</th>
                  <th className="text-left px-3 py-2 font-semibold">Category</th>
                  <th className="text-left px-3 py-2 font-semibold">Best for</th>
                  <th className="text-left px-3 py-2 font-semibold">Weight cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-line/20">
                {ALL_FONTS.map((f) => (
                  <tr key={f.name}>
                    <td className="px-3 py-2 font-semibold whitespace-nowrap">{f.name}</td>
                    <td className="px-3 py-2 text-charcoal/80">{f.category}</td>
                    <td className="px-3 py-2 text-charcoal/80">{f.bestFor}</td>
                    <td className="px-3 py-2 text-charcoal/80 font-mono text-xs whitespace-nowrap">
                      {f.fileSize}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="curated-heading" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 id="curated-heading" className="text-2xl font-bold tracking-tight">
              The six fonts we actually install
            </h2>
            <p className="text-sm text-muted">
              These are the fonts we reach for when we have full discretion over a storefront
              install. Chosen for screen-rendering quality, weight range, license cleanliness, and
              how cleanly they pair.
            </p>
          </div>
          {CURATED_PICKS.map((pick, idx) => (
            <article
              key={pick.name}
              className="flex flex-col gap-3 rounded-lg border border-charcoal-line/30 bg-paper p-5 sm:p-6 shadow-card"
            >
              <header className="flex flex-col gap-1">
                <p className="text-xs font-mono text-electric">
                  #{idx + 1} · {pick.category}
                </p>
                <h3 className="text-2xl font-bold tracking-tight">{pick.name}</h3>
                <p className="text-sm text-muted">
                  {pick.source} · Weights: {pick.weights} · {pick.fileSize}
                </p>
              </header>
              <p className="text-charcoal/80 leading-relaxed">
                <strong>Best for:</strong> {pick.bestFor}.
              </p>
              <p className="text-charcoal/80 leading-relaxed">{pick.description}</p>
            </article>
          ))}
        </section>

        <section aria-labelledby="popular-heading" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 id="popular-heading" className="text-2xl font-bold tracking-tight">
              The six popular alternatives every other list recommends
            </h2>
            <p className="text-sm text-muted">
              These are the fonts you&apos;ll see on every &ldquo;best Shopify fonts&rdquo; list —
              Montserrat, Roboto, Poppins, Playfair Display, Open Sans, Lora. They&apos;re all good
              fonts. Below, honest notes on where each one is the right call and where one of the
              curated picks above beats it for ecommerce specifically.
            </p>
          </div>
          {POPULAR_ALTERNATIVES.map((pick, idx) => (
            <article
              key={pick.name}
              className="flex flex-col gap-3 rounded-lg border border-charcoal-line/30 bg-paper p-5 sm:p-6 shadow-card"
            >
              <header className="flex flex-col gap-1">
                <p className="text-xs font-mono text-electric">
                  #{idx + 7} · {pick.category}
                </p>
                <h3 className="text-2xl font-bold tracking-tight">{pick.name}</h3>
                <p className="text-sm text-muted">
                  {pick.source} · Weights: {pick.weights} · {pick.fileSize}
                </p>
              </header>
              <p className="text-charcoal/80 leading-relaxed">
                <strong>Best for:</strong> {pick.bestFor}.
              </p>
              <p className="text-charcoal/80 leading-relaxed">{pick.description}</p>
            </article>
          ))}
        </section>

        <section aria-labelledby="pairings-heading" className="flex flex-col gap-4">
          <h2 id="pairings-heading" className="text-2xl font-bold tracking-tight">
            Three pairings to get you started
          </h2>
          <p className="text-sm text-muted">
            Each pairing follows the same rule: a display face for headings paired with a neutral,
            legible face for body — or a single family used for both at different weights.
          </p>
          <ul className="flex flex-col gap-3">
            {PAIRINGS_TEASER.map((p) => (
              <li
                key={`${p.heading}-${p.body}`}
                className="flex flex-col gap-1 rounded-lg border border-charcoal-line/30 bg-paper p-4"
              >
                <p className="text-sm">
                  <span className="font-bold">Heading:</span> {p.heading}
                  <span className="mx-2 text-charcoal-line">·</span>
                  <span className="font-bold">Body:</span> {p.body}
                </p>
                <p className="text-sm text-charcoal/80">{p.note}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">
            See the full{" "}
            <Link href="/shopify-font-pairings" className="text-electric hover:underline">
              ten Shopify font pairings guide
            </Link>{" "}
            for the complete list with file-budget data and pitfalls per pairing — plus the four
            pairings to avoid. For the broader framework on heading + body selection, the{" "}
            <Link
              href="/how-to-choose-a-font-for-shopify"
              className="text-electric hover:underline"
            >
              decision-framework guide
            </Link>{" "}
            covers all six axes.
          </p>
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
            (or use a third-party download tool that returns just the weights you need). Upload them
            to your theme&apos;s <code className="font-mono text-sm">assets/</code> folder. Open the{" "}
            <Link href="/" className="text-electric hover:underline">
              {SITE_NAME} generator
            </Link>{" "}
            in another tab, type the font name (e.g., <em>Inter</em> or <em>Montserrat</em>), tick
            the formats you uploaded, and copy the three blocks the generator outputs into the files
            it points you to. Refresh your storefront — the new font is live.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            If you change your mind, the{" "}
            <Link href="/uninstall-custom-font-shopify" className="text-electric hover:underline">
              uninstall guide
            </Link>{" "}
            walks through the reversal — nothing in this workflow is permanent.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight">When free isn&apos;t enough</h2>
          <p className="text-charcoal/80 leading-relaxed">
            Free fonts cover most stores. They don&apos;t cover every store — if your brand depends
            on a face with real personality, or you want exclusivity in your category, the paid
            market is where you&apos;ll find it. The two cleanest paths:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-charcoal/80 leading-relaxed">
            <li>
              <strong>Direct from a foundry.</strong> Klim Type Foundry, Commercial Type, Pangram
              Pangram, Grilli Type — buy a web license tier that matches your traffic. Most cost
              between $50 and $500 for a single weight depending on the foundry.
            </li>
            <li>
              <strong>A marketplace with commercial licenses included.</strong> Sites like Creative
              Fabrica or Envato Elements bundle the commercial license into a low per-font cost — no
              per-pageview tier math, full breadth across display and body styles. Just confirm the
              license explicitly covers web/embedding before you ship it to a storefront.
            </li>
          </ul>
        </section>

        <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
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

        <section className="flex flex-col gap-3 rounded-lg border border-charcoal-line/30 bg-paper-dim p-5">
          <h2 className="text-xl font-bold tracking-tight">Still narrowing down?</h2>
          <p className="text-charcoal/80 leading-relaxed">
            The{" "}
            <Link
              href="/how-to-choose-a-font-for-shopify"
              className="text-electric hover:underline"
            >
              decision-framework guide
            </Link>{" "}
            walks through the six axes we use to pick fonts — brand fit, performance budget,
            licensing, weights, pairing, and multilingual support. Worth the ten minutes before you
            commit.
          </p>
          <KitUpsell variant="soft" />
        </section>
      </article>
    </>
  );
}
