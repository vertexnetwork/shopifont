import type { Metadata } from "next";
import Link from "next/link";
import { ArticleSchema } from "@/components/Schema/ArticleSchema";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { FaqSchema } from "@/components/Schema/FaqSchema";
import { SITE_NAME } from "@/lib/site";
import { siteConfig } from "@/lib/site-config";
import { EVERGREEN_ENTRIES } from "@/content/evergreen";
import { KITS } from "@/content/kits";

export const dynamic = "force-static";

const ENTRY = EVERGREEN_ENTRIES.find(
  (e) => e.slug === "shopify-typography-kits",
)!;

const META_DESCRIPTION =
  "Done-for-you Shopify typography. Each kit is a proven font pairing for your store type, with copy-paste install code pre-built for all 13 free OS 2.0 themes, a visual specimen, the licensing cleared, and a clean uninstall sheet. One-time, instant download, no account.";

export const metadata: Metadata = {
  title: `Shopify Typography Kits — done-for-you font pairings | ${SITE_NAME}`,
  description: META_DESCRIPTION,
  alternates: { canonical: `/${ENTRY.slug}` },
  openGraph: {
    title: "Shopify Typography Kits",
    description: META_DESCRIPTION,
    url: `/${ENTRY.slug}`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopify Typography Kits",
    description: META_DESCRIPTION,
  },
};

const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "What exactly do I get?",
    a: "A proven heading-and-body font pairing chosen for your store type, plus copy-paste install code pre-built for all 13 free Shopify OS 2.0 themes, a visual specimen you can open in any browser, font-download instructions, a license-and-usage sheet, and a clean uninstall sheet. It is a one-time digital download — no account, no subscription, nothing phones home.",
  },
  {
    q: "Aren't these fonts free on Google Fonts?",
    a: "The fonts are free and open-licensed — you are not paying for the fonts. You are paying to skip the work: the decision of which pairing fits your brand and won't break your theme, the exact per-theme install code, the licensing confirmation, and a specimen so you see the result before you ship it. The kit is the finished decision, not the raw materials.",
  },
  {
    q: "Will this break my theme?",
    a: "No. The install is two CSS blocks pasted into one file (assets/base.css) plus the font files in your assets/ folder. It adds zero JavaScript, retargets your theme's own font variables, and survives theme updates. Every kit includes an uninstall sheet that reverses it completely in three steps.",
  },
  {
    q: "Which kit should I buy?",
    a: "Match the kit to your store's vibe — each one lists exactly who it's for. Premium Editorial and Luxury Classic suit fashion, beauty, and curated goods; DTC Friendly suits skincare, supplements, and lifestyle; Editorial Warm suits long-copy and artisan-food stores; Modern Tech suits electronics and tech DTC; Minimal & Fast is the lightest, fastest, safest default when you're unsure.",
  },
  {
    q: "Can I use it on more than one store?",
    a: "Yes — you may use a kit on any store you own or operate. Please don't resell or redistribute the kit itself. Every font inside is SIL Open Font License, which clears it for commercial use on a Shopify storefront with no seat counts or pageview tiers.",
  },
  {
    q: "What if it doesn't work for me?",
    a: "No-questions-asked refund within 7 days — just reply to your receipt. The kit is built to be entirely self-contained so you never have to wait on support; the refund exists so a mismatch is never your problem.",
  },
];

function BuyCta({ block = false }: { block?: boolean }) {
  const { enabled, gumroadUrl, priceLabel } = siteConfig.features.kit;
  if (enabled && gumroadUrl) {
    return (
      <div
        className={
          "flex flex-wrap items-center gap-3 " + (block ? "" : "sm:flex-nowrap")
        }
      >
        <a
          href={gumroadUrl}
          target="_blank"
          rel="noopener"
          className="group inline-flex items-center justify-center min-h-[3rem] px-6 rounded-md bg-electric text-paper font-semibold text-base shadow-cta hover:bg-electric-hover whitespace-nowrap"
        >
          Get a Typography Kit on Gumroad
          <span
            aria-hidden
            className="ml-1.5 transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </a>
        <span className="text-sm text-muted">{priceLabel}</span>
      </div>
    );
  }
  // Dark state — page stays live + indexable; the store just isn't open
  // yet. Honest, no dead button.
  return (
    <div className="inline-flex flex-col gap-1 rounded-md border border-charcoal-line/40 bg-paper-dim px-4 py-3">
      <span className="text-sm font-semibold text-charcoal">
        Launching shortly
      </span>
      <span className="text-xs text-muted">
        The kits are built and finalized. The store opens in days — this
        page will carry the buy link the moment it&apos;s live.
      </span>
    </div>
  );
}

export default function TypographyKitsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Typography Kits", href: `/${ENTRY.slug}` },
  ];

  return (
    <>
      <ArticleSchema
        id="kits-article-schema"
        title="Shopify Typography Kits"
        description={META_DESCRIPTION}
        path={`/${ENTRY.slug}`}
      />
      <BreadcrumbSchema id="kits-breadcrumb-schema" crumbs={crumbs} />
      <FaqSchema id="kits-faq-schema" faqs={FAQS} />

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

        <header className="flex flex-col gap-5">
          <p className="text-xs uppercase tracking-wide text-muted">
            Done-for-you · One-time · Instant download
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Shopify Typography Kits
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80 leading-relaxed">
            The free generator gives you code. A kit gives you the{" "}
            <strong>decision already made</strong>: a proven font pairing
            for your store type, the exact copy-paste install code for all
            13 free Shopify themes, the licensing cleared, and a visual
            specimen so you see it before you ship it. Stop researching
            fonts and second-guessing the install — buy the finished
            result and move on.
          </p>
          <BuyCta />
        </header>

        <section aria-labelledby="inside-heading" className="flex flex-col gap-4">
          <h2
            id="inside-heading"
            className="text-2xl font-bold tracking-tight"
          >
            What&apos;s in every kit
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              [
                "A proven pairing",
                "A heading + body combination that passes every axis we test — chosen for your store type, not a generic list.",
              ],
              [
                "Code for all 13 themes",
                "Pre-built @font-face + CSS-variable blocks for Dawn, Sense, Crave, and every other free OS 2.0 theme. Paste two blocks, done.",
              ],
              [
                "A visual specimen",
                "An HTML preview you open in any browser — headings, body, a product card — so you see exactly what you bought.",
              ],
              [
                "Licensing cleared",
                "Every font is SIL Open Font License. The kit spells out, in plain English, that you're free to use it commercially on Shopify.",
              ],
              [
                "Font-download sheet",
                "Exactly which files to get (free, from Google Fonts) and the precise filenames the install code expects. No guesswork.",
              ],
              [
                "A clean uninstall sheet",
                "Three steps to reverse everything. Nothing is permanent or stateful — decide with zero risk.",
              ],
            ].map(([h, b]) => (
              <li
                key={h}
                className="flex flex-col gap-1.5 rounded-lg border border-charcoal-line/30 p-4 shadow-card"
              >
                <h3 className="font-semibold tracking-tight">{h}</h3>
                <p className="text-sm text-charcoal/80 leading-relaxed">{b}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="kits-heading" className="flex flex-col gap-5">
          <h2 id="kits-heading" className="text-2xl font-bold tracking-tight">
            The kits
          </h2>
          <div className="flex flex-col gap-4">
            {KITS.map((kit) => (
              <article
                key={kit.slug}
                className="flex flex-col gap-3 rounded-lg border border-charcoal-line/30 bg-paper p-5 sm:p-6 shadow-card"
              >
                <header className="flex flex-col gap-1">
                  <p className="text-xs font-mono text-electric">
                    {kit.singleFamily
                      ? kit.heading.family
                      : `${kit.heading.family} + ${kit.body.family}`}
                  </p>
                  <h3 className="text-xl font-bold tracking-tight">
                    {kit.name}
                  </h3>
                  <p className="text-sm text-muted">For: {kit.vertical}</p>
                </header>
                <p className="text-sm text-charcoal/80 leading-relaxed">
                  {kit.rationale}
                </p>
                <p className="text-xs text-muted">
                  File budget on your storefront: {kit.fileBudget}. Includes
                  install code for all 13 free Shopify themes.
                </p>
              </article>
            ))}
          </div>
          <p className="text-sm text-muted">
            Not sure which one? The free{" "}
            <Link
              href="/shopify-font-pairings"
              className="text-electric hover:underline"
            >
              pairings guide
            </Link>{" "}
            and{" "}
            <Link
              href="/how-to-choose-a-font-for-shopify"
              className="text-electric hover:underline"
            >
              decision framework
            </Link>{" "}
            walk through the same logic the kits are built on — read those
            first if you want to understand the call before you buy it.
          </p>
        </section>

        <section
          aria-labelledby="how-heading"
          className="flex flex-col gap-4 rounded-lg border border-electric/30 bg-gradient-to-br from-electric/[0.06] via-electric/[0.02] to-transparent p-5 sm:p-6"
        >
          <h2
            id="how-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight"
          >
            How it works — about five minutes
          </h2>
          <ol className="flex flex-col gap-3 text-sm sm:text-base text-charcoal/80 leading-relaxed">
            <li>
              <strong>1.</strong> Buy the kit for your store type. Instant
              download, no account.
            </li>
            <li>
              <strong>2.</strong> Get the fonts (free, from Google Fonts —
              the kit gives you the exact links and filenames).
            </li>
            <li>
              <strong>3.</strong> Open the folder for your theme, paste two
              blocks into <code className="font-mono text-sm">base.css</code>,
              save. Done — and the uninstall sheet is in the box if you
              change your mind.
            </li>
          </ol>
          <BuyCta block />
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
      </article>
    </>
  );
}
