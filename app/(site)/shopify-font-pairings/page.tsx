import type { Metadata } from "next";
import Link from "next/link";
import { ArticleSchema } from "@/components/Schema/ArticleSchema";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { FaqSchema } from "@/components/Schema/FaqSchema";
import { SITE_NAME } from "@/lib/site";
import { EVERGREEN_ENTRIES } from "@/content/evergreen";

export const dynamic = "force-static";

const ENTRY = EVERGREEN_ENTRIES.find(
  (e) => e.slug === "shopify-font-pairings",
)!;

const META_DESCRIPTION =
  "Ten concrete Shopify font pairings with named heading + body fonts (Fraunces + Inter, Playfair Display + Lato, Montserrat + Open Sans, and more), file-weight budgets, brand fits, and the pitfall each pairing avoids. Plus the three pairings most stores reach for that almost always fail.";

export const metadata: Metadata = {
  title: `Shopify Font Pairings That Work (2026) | ${SITE_NAME}`,
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

type Pairing = {
  /** Slug-safe key for React. */
  key: string;
  heading: string;
  body: string;
  category: string;
  bestFor: string;
  /** Total WOFF2 file weight, conservative — assumes 2 weights per face. */
  fileBudget: string;
  /** What makes this pairing work. */
  works: string;
  /** What goes wrong if you misuse it. */
  pitfall: string;
};

/**
 * Ten named pairings. Order: curated first (the pairings we'd install
 * unprompted), popular pairings second (entity coverage for what
 * competitor lists recommend). Each pairing names specific weights so
 * the file-budget number is honest, not aspirational.
 */
const PAIRINGS: ReadonlyArray<Pairing> = [
  {
    key: "fraunces-inter",
    heading: "Fraunces",
    body: "Inter",
    category: "Display serif + neutral sans",
    bestFor: "Premium fashion, food, and curated-goods brands",
    fileBudget: "~160KB (2 weights each, WOFF2)",
    works:
      "Fraunces brings real serif character at headline scale — soft entrance strokes, optical sizes that look right at H1 and H2. Inter handles body copy with screen-rendering quality no display serif can match. The contrast is high enough to create hierarchy without feeling forced.",
    pitfall:
      "Don't use Fraunces for body copy at small sizes. The optical-size variant that flatters headlines distracts at 16px paragraph scale. Ship Fraunces only for H1–H3.",
  },
  {
    key: "playfair-lato",
    heading: "Playfair Display",
    body: "Lato",
    category: "Classic luxury serif + workhorse sans",
    bestFor: "Beauty, jewelry, and luxury-positioning apparel",
    fileBudget: "~150KB (2 weights each, WOFF2)",
    works:
      "The most-recommended luxury pairing on Shopify, and for good reason — Playfair Display reads as upmarket instantly, Lato is forgiving across body sizes and weights. Zero-thought-required setup for fashion-adjacent stores.",
    pitfall:
      "Playfair Display is on so many luxury stores that it can read as generic now. If you want premium feel without the cookie-cutter look, swap Playfair for Fraunces — same vertical, fresher silhouette.",
  },
  {
    key: "montserrat-open-sans",
    heading: "Montserrat",
    body: "Open Sans",
    category: "Friendly geometric + humanist body",
    bestFor: "Skincare, supplements, and DTC lifestyle brands",
    fileBudget: "~145KB (2 weights each, WOFF2)",
    works:
      "Both fonts have wide letterforms and friendly proportions — they read as approachable and consumer-facing without being childish. The most common pairing on DTC storefronts, which means it scans as trustworthy to a shopping audience.",
    pitfall:
      "Don't use Montserrat below 14px for body text — its wide letterforms eat horizontal space and break product-card layouts. Keep Montserrat headlines + Open Sans body, never the inverse.",
  },
  {
    key: "lora-open-sans",
    heading: "Lora",
    body: "Open Sans",
    category: "Text serif + humanist sans (inverted)",
    bestFor: "Editorial brands, cookbooks, curated-goods with long-form copy",
    fileBudget: "~150KB (2 weights each, WOFF2)",
    works:
      "Lora is a serif designed for body reading — calligraphic roots, comfortable at long lengths. Used here as a heading face (in Bold), it brings editorial gravitas without the high-contrast drama of Playfair. Open Sans handles secondary body and UI text.",
    pitfall:
      "Lora wasn't built for display sizes. At above 60px it can feel underweight — use Lora Bold (700), not Regular, for headlines, and don't push it past H1. For larger hero text, switch to Playfair Display or Fraunces.",
  },
  {
    key: "outfit-public-sans",
    heading: "Outfit",
    body: "Public Sans",
    category: "Display sans + legibility sans",
    bestFor: "Consumer electronics, smart home, and tech-leaning DTC",
    fileBudget: "~135KB (2 weights each, WOFF2)",
    works:
      "Outfit has more personality than Inter or Manrope — high contrast and crisp terminals make it feel intentional at display sizes. Public Sans was designed for legibility at small sizes by the U.S. Web Design System team, so body copy stays workable even on long product-detail pages.",
    pitfall:
      "Don't use Outfit for body text on content-heavy pages. Its display-leaning character that flatters H1 feels busy by paragraph three.",
  },
  {
    key: "poppins-poppins",
    heading: "Poppins (Bold)",
    body: "Poppins (Regular)",
    category: "Single-family pairing",
    bestFor: "First-time installers, performance-budget-constrained stores",
    fileBudget: "~95KB (2 weights, WOFF2)",
    works:
      "Single-family pairings are the cleanest budget choice on Shopify — half the font files, no x-height mismatch, no licensing headaches. Poppins specifically has friendly geometry that works for both display and body without straining.",
    pitfall:
      "Poppins bold weights at large sizes can feel uniform and lose hierarchy between H1 and H2. Compensate with size and color contrast rather than reaching for a third weight.",
  },
  {
    key: "inter-inter",
    heading: "Inter (Bold)",
    body: "Inter (Regular)",
    category: "Single-family pairing",
    bestFor: "Tech-adjacent stores, marketplaces, and anywhere clarity outranks personality",
    fileBudget: "~70KB (2 weights, WOFF2)",
    works:
      "The lightest performance budget on this list. Inter was designed for screen rendering across every size, so the single family handles both display and body without compromise. Default-safe choice when you can't decide.",
    pitfall:
      "Inter is neutral by design. If your brand depends on type doing the heavy lifting (fashion, luxury, food editorial), Inter alone reads as anonymous — pair it with a display face like Fraunces or Playfair for hero treatments.",
  },
  {
    key: "playfair-roboto",
    heading: "Playfair Display",
    body: "Roboto",
    category: "Luxury serif + familiar sans",
    bestFor: "Mid-market apparel and accessories that want a recognizable feel",
    fileBudget: "~155KB (2 weights each, WOFF2)",
    works:
      "Playfair gives the upmarket positioning, Roboto handles body with screen-tested familiarity. Roboto reads as trustworthy because it's everywhere — Material UI, Google products, countless DTC stores. The combination feels premium without being precious.",
    pitfall:
      "Roboto blends in by design. If your brand differentiation depends on the body face (e.g., a magazine-style storefront), swap Roboto for Inter or IBM Plex Sans — both have more character without sacrificing legibility.",
  },
  {
    key: "plex-sans-plex-serif",
    heading: "IBM Plex Sans",
    body: "IBM Plex Serif",
    category: "Same-foundry sans + serif",
    bestFor: "Editorial-leaning brands, content-heavy stores",
    fileBudget: "~165KB (2 weights each, WOFF2)",
    works:
      "Same-family pairings get x-height harmony, weight scaling, and OpenType feature parity for free. IBM Plex specifically has distinctive lowercase shapes (the a, g, ampersand) that give the pairing personality without leaving one foundry — which means consistent licensing and one team's design judgment.",
    pitfall:
      "Inverted pairing (Plex Serif heading + Plex Sans body) feels academic and slows scanning on storefronts. Keep sans for headings, serif for body — readers expect serif to slow them down for reading, not display.",
  },
  {
    key: "manrope-plex-sans",
    heading: "Manrope",
    body: "IBM Plex Sans",
    category: "Geometric sans + humanist sans",
    bestFor: "Software-adjacent ecommerce, design tools, premium electronics",
    fileBudget: "~125KB (2 weights each, WOFF2)",
    works:
      "Two sans faces can pair well if they sit in different categories. Manrope is geometric (tight, tech-leaning); Plex Sans is humanist (warmer, with character in the letterforms). The contrast is subtle but real — headlines feel structured, body feels approachable.",
    pitfall:
      "Two geometric sans never work — they look identical to a quick scan and you've doubled file weight for zero visual gain. Never pair Manrope with Inter, Outfit, or Poppins.",
  },
];

const ANTIPATTERNS: ReadonlyArray<{ pairing: string; why: string }> = [
  {
    pairing: "Two geometric sans (Inter + Manrope, Poppins + Outfit, Montserrat + Inter)",
    why: "Two fonts from the same category look identical at a glance. You've doubled file weight, complicated licensing, and produced no visible hierarchy. If you want sans-on-sans, pair a geometric with a humanist (Manrope + IBM Plex Sans) so the contrast is real.",
  },
  {
    pairing: "Two display faces (Playfair Display + Fraunces, Bebas Neue + Oswald)",
    why: "Display faces compete for attention. Pairing two means your H1 and H2 fight each other instead of building a reading order. Pick one display face and pair it with a neutral sans or text serif.",
  },
  {
    pairing: "Display face used for body copy (Playfair Display body, Bebas Neue paragraphs)",
    why: "Display faces are tuned for headline scale — high contrast, dramatic terminals, exaggerated proportions. At 16px they feel exhausting after two paragraphs. Reserve display faces for H1 through H3 and use a body-optimized face for everything else.",
  },
  {
    pairing: "Inverted serif/sans hierarchy (sans heading + serif body in a sans-first design system)",
    why: "Not technically wrong — some editorial brands use it — but it inverts what storefront shoppers expect. Serif body slows scanning; on an ecommerce site where users skim product cards in two seconds, that's a conversion cost. Use this only if your store is explicitly content-first (a magazine-style commerce site).",
  },
];

const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "What are the best font pairings for a Shopify store?",
    a: "The pairings that work most reliably on Shopify are Fraunces + Inter for premium brands, Montserrat + Open Sans for friendly DTC, Playfair Display + Lato for classic luxury, and Poppins + Poppins (single-family) for performance-budget-constrained stores. All four follow the same rule: a display or display-leaning face for headings paired with a neutral, legibility-first face for body — or a single family used at multiple weights.",
  },
  {
    q: "How many fonts should I pair on a Shopify store?",
    a: "Two at most: one for headings, one for body. Many of the best storefronts use a single typeface at multiple weights (e.g., Inter Bold for headings and Inter Regular for body) — that's still a pairing, just within one family. Pairing three or more fonts almost always pushes Largest Contentful Paint over budget without producing a meaningfully better visual result.",
  },
  {
    q: "Can I pair two sans-serif fonts on Shopify?",
    a: "Yes, but only if they sit in different sub-categories. Pairing a geometric sans (Manrope, Inter, Poppins) with a humanist sans (IBM Plex Sans, Public Sans, Lato) creates a real visual contrast. Pairing two geometric sans (e.g., Inter + Manrope) almost always fails because they look identical at a glance — you've doubled file weight for no visible difference.",
  },
  {
    q: "What's the lowest-file-weight font pairing for Shopify?",
    a: "Inter + Inter at two weights (Bold and Regular) is the lightest pairing on this list — roughly 70KB total in WOFF2. Single-family pairings always win the performance budget because you ship half the files and avoid the OpenType feature mismatch between two foundries. If you need more personality, Poppins + Poppins lands around 95KB.",
  },
  {
    q: "What font pairings should I avoid on Shopify?",
    a: "Three pairings fail almost every time: two display faces (Playfair Display + Fraunces), two geometric sans (Inter + Manrope), and any display face used for body copy (Bebas Neue paragraphs). The underlying rule is that pairings need real contrast — same-category pairings produce visual noise without hierarchy, and display faces aren't tuned for paragraph-scale reading.",
  },
];

export default function FontPairingsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Font pairings", href: `/${ENTRY.slug}` },
  ];

  return (
    <>
      <ArticleSchema
        id="pairings-article-schema"
        title={ENTRY.title}
        description={META_DESCRIPTION}
        path={`/${ENTRY.slug}`}
      />
      <BreadcrumbSchema id="pairings-breadcrumb-schema" crumbs={crumbs} />
      <FaqSchema id="pairings-faq-schema" faqs={FAQS} />

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
            Curated pairings · Updated 2026
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Shopify font pairings that actually work (2026)
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80">
            Ten concrete heading-and-body font combinations for Shopify
            storefronts — with the file-weight budget, the kind of brand
            each pairing fits, and the specific pitfall each one avoids.
            Plus the four pairings most stores reach for that almost
            always fail.
          </p>
          <p className="text-sm text-muted">
            Every font referenced here is free, commercially licensed
            under SIL Open Font License or Apache 2.0, and self-hostable
            as WOFF2 from your theme&apos;s{" "}
            <code className="font-mono text-xs">assets/</code> folder.
          </p>
        </header>

        <section
          aria-labelledby="rule-heading"
          className="flex flex-col gap-3 rounded-lg border border-electric/30 bg-gradient-to-br from-electric/[0.06] via-electric/[0.02] to-transparent p-5 sm:p-6"
        >
          <h2 id="rule-heading" className="text-xl sm:text-2xl font-bold tracking-tight">
            The one rule every working pairing follows
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            A working pairing has <strong>real contrast</strong> between
            the heading face and the body face — either across categories
            (display serif + neutral sans, geometric sans + humanist
            text), or within a single family at different weights. If
            your two fonts look the same at a glance, you&apos;ve doubled
            your file weight without building hierarchy.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            That&apos;s it. Every pairing below applies the rule
            differently; every pairing in the &ldquo;avoid&rdquo; section
            breaks it.
          </p>
        </section>

        <section
          aria-labelledby="table-heading"
          className="flex flex-col gap-3"
        >
          <h2 id="table-heading" className="text-2xl font-bold tracking-tight">
            Ten pairings at a glance
          </h2>
          <p className="text-sm text-muted">
            Sorted by how often we&apos;d reach for each. File budgets
            assume two weights per face (Regular + Bold) in WOFF2.
          </p>
          <div className="overflow-x-auto rounded-lg border border-charcoal-line/30">
            <table className="w-full text-sm">
              <thead className="bg-paper-dim text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Heading</th>
                  <th className="text-left px-3 py-2 font-semibold">Body</th>
                  <th className="text-left px-3 py-2 font-semibold">Best for</th>
                  <th className="text-left px-3 py-2 font-semibold">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-line/20">
                {PAIRINGS.map((p) => (
                  <tr key={p.key}>
                    <td className="px-3 py-2 font-semibold whitespace-nowrap">
                      {p.heading}
                    </td>
                    <td className="px-3 py-2 text-charcoal/80 whitespace-nowrap">
                      {p.body}
                    </td>
                    <td className="px-3 py-2 text-charcoal/80">{p.bestFor}</td>
                    <td className="px-3 py-2 text-charcoal/80 font-mono text-xs whitespace-nowrap">
                      {p.fileBudget}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          aria-labelledby="detail-heading"
          className="flex flex-col gap-6"
        >
          <h2 id="detail-heading" className="text-2xl font-bold tracking-tight">
            The pairings, one by one
          </h2>
          {PAIRINGS.map((p, idx) => (
            <article
              key={p.key}
              className="flex flex-col gap-3 rounded-lg border border-charcoal-line/30 bg-paper p-5 sm:p-6 shadow-card"
            >
              <header className="flex flex-col gap-1">
                <p className="text-xs font-mono text-electric">
                  #{idx + 1} · {p.category}
                </p>
                <h3 className="text-2xl font-bold tracking-tight">
                  {p.heading} + {p.body}
                </h3>
                <p className="text-sm text-muted">
                  Budget: {p.fileBudget}
                </p>
              </header>
              <p className="text-charcoal/80 leading-relaxed">
                <strong>Best for:</strong> {p.bestFor}.
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                <strong>Why it works:</strong> {p.works}
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                <strong>Pitfall:</strong> {p.pitfall}
              </p>
            </article>
          ))}
        </section>

        <section
          aria-labelledby="avoid-heading"
          className="flex flex-col gap-4"
        >
          <h2 id="avoid-heading" className="text-2xl font-bold tracking-tight">
            Pairings to avoid (and why)
          </h2>
          <p className="text-sm text-muted">
            The four pairing patterns we see most often on Shopify stores
            that don&apos;t work — and the underlying rule each one
            breaks.
          </p>
          <ul className="flex flex-col gap-3">
            {ANTIPATTERNS.map((a) => (
              <li
                key={a.pairing}
                className="flex flex-col gap-2 rounded-lg border border-charcoal-line/30 bg-paper-dim p-4 sm:p-5"
              >
                <p className="text-base font-semibold text-charcoal">
                  {a.pairing}
                </p>
                <p className="text-sm text-charcoal/80 leading-relaxed">
                  {a.why}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            How to install a pairing on Shopify
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Pick one heading font and one body font from the list above.
            Download the WOFF2 files (Regular + Bold for each, four
            files total) from{" "}
            <a
              href="https://fonts.google.com/"
              target="_blank"
              rel="noopener"
              className="text-electric hover:underline"
            >
              Google Fonts
            </a>{" "}
            and upload them to your theme&apos;s{" "}
            <code className="font-mono text-sm">assets/</code> folder.
            Open the{" "}
            <Link href="/" className="text-electric hover:underline">
              {SITE_NAME} generator
            </Link>
            , generate the @font-face CSS block for each face, paste
            them into your theme&apos;s base CSS, and update the heading
            and body CSS variables to your new font-family names.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            For the full installation walkthrough including the
            settings_schema.json snippet that exposes the new font in
            the Shopify theme editor, see the{" "}
            <Link
              href="/shopify-dawn-custom-font-generator"
              className="text-electric hover:underline"
            >
              Dawn-specific generator page
            </Link>{" "}
            (or pick your theme from the{" "}
            <Link href="/#themes" className="text-electric hover:underline">
              themes grid
            </Link>
            ).
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

        <section className="flex flex-col gap-3 rounded-lg border border-charcoal-line/30 bg-paper-dim p-5">
          <h2 className="text-xl font-bold tracking-tight">
            Related guides
          </h2>
          <ul className="flex flex-col gap-2 text-charcoal/80 leading-relaxed">
            <li>
              <Link
                href="/best-free-fonts-for-shopify"
                className="text-electric hover:underline"
              >
                The best fonts for a Shopify store
              </Link>{" "}
              — the twelve fonts these pairings draw from, with side-by-side
              category, file-cost, and license data.
            </li>
            <li>
              <Link
                href="/how-to-choose-a-font-for-shopify"
                className="text-electric hover:underline"
              >
                How to choose a font for your Shopify store
              </Link>{" "}
              — the six-axis decision framework (brand fit, performance,
              licensing, weights, pairing, multilingual) we use before
              picking either face.
            </li>
            <li>
              <Link
                href="/font-pairing-checklist"
                className="text-electric hover:underline"
              >
                Free Shopify font-pairing checklist
              </Link>{" "}
              — printable PDF for evaluating a pairing against six axes
              before you commit.
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}
