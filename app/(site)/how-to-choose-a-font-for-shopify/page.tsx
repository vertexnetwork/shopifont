import type { Metadata } from "next";
import Link from "next/link";
import { CreativeFabricaInline } from "@/components/Affiliate/CreativeFabricaInline";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { SITE_NAME } from "@/lib/site";
import { EVERGREEN_ENTRIES } from "@/content/evergreen";

export const dynamic = "force-static";

const ENTRY = EVERGREEN_ENTRIES.find(
  (e) => e.slug === "how-to-choose-a-font-for-shopify",
)!;

const META_DESCRIPTION =
  "A practical decision framework for choosing a custom font for your Shopify store. Covers brand fit, performance budget, licensing, weight selection, pairing, and the pitfalls that bite ecommerce stores specifically.";

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
};

export default function ChooseFontPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Choosing a font", href: `/${ENTRY.slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema id="choose-font-breadcrumb-schema" crumbs={crumbs} />

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
          <p className="text-xs uppercase tracking-wide text-muted">Guide</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            How to choose a font for your Shopify store
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80">
            A custom font is one of the cheapest brand changes you can ship
            on a Shopify store and one of the easiest to get wrong. This
            guide is the framework we use to pick fonts for storefront
            installs — six axes, with the trade-offs ecommerce stores
            specifically need to weigh.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            1. Brand fit comes first
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            The font is a brand decision before it&apos;s a design decision.
            A premium leather-goods store and a science-backed wellness
            brand can both use a sans-serif, but the personalities they
            project are different — and the wrong type face works against
            the rest of your storefront, no matter how well-executed it is.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            Three rough categories that fit most stores:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-charcoal/80 leading-relaxed">
            <li>
              <strong>Geometric / neutral sans</strong> (Inter, Manrope, Public
              Sans, Outfit). Reads as modern, utilitarian, trustworthy.
              Default-safe for tech-adjacent brands, marketplaces, and
              anywhere clarity outranks personality.
            </li>
            <li>
              <strong>Humanist sans</strong> (IBM Plex Sans, Source Sans, Lato).
              Warmer than geometric, better for body copy at small sizes.
              Good for brands that want to feel human without losing
              credibility.
            </li>
            <li>
              <strong>Display / serif</strong> (Fraunces, EB Garamond, Playfair
              Display, Söhne for premium). Higher personality, more risk —
              works for fashion, beauty, food, and curated-goods brands
              where the type itself is part of the brand.
            </li>
          </ul>
          <p className="text-charcoal/80 leading-relaxed">
            If you&apos;re unsure, mock up your hero headline + a real product
            card in three candidates and compare against your existing
            storefront for an hour. Most fit problems show up in that hour.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            2. Set a performance budget before you fall in love with anything
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Shopify stores live or die by Core Web Vitals — every 100ms of
            extra LCP measurably hurts conversion at scale. Custom fonts
            are one of the most common LCP regressions because they block
            the largest visible text from rendering until the file loads.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            Three rules of thumb:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-charcoal/80 leading-relaxed">
            <li>
              <strong>Total font weight under 100KB.</strong> One regular plus
              one bold weight in WOFF2 should land in that envelope. If your
              total is north of 200KB you&apos;re paying a real LCP penalty
              for a font most of your visitors won&apos;t consciously notice.
            </li>
            <li>
              <strong>Always include WOFF2.</strong> WOFF2 covers ~97% of
              modern traffic and is roughly 30% smaller than WOFF for the
              same glyph set. Skipping it because &ldquo;the foundry sent us
              TTF&rdquo; leaves real money on the table — you can convert
              TTF→WOFF2 with{" "}
              <a
                href="https://github.com/google/woff2"
                target="_blank"
                rel="noopener"
                className="text-electric hover:underline"
              >
                google/woff2
              </a>{" "}
              or any online converter.
            </li>
            <li>
              <strong>Always use{" "}
                <code className="font-mono text-sm">font-display: swap</code>.</strong>
              Without it the browser invisibly stalls text rendering until
              the font arrives. With it, the system fallback paints first,
              and your custom font swaps in once it&apos;s ready —
              {" "}<Link
                href="/fix-shopify-font-layout-shift-dawn"
                className="text-electric hover:underline"
              >
                with size-adjust matching
              </Link>{" "}
              you can keep the swap from causing layout shift.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            3. Verify the license actually allows ecommerce use
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Most foundries split licensing into <em>desktop</em> (use in
            design software), <em>web</em> (embed on your own site), and{" "}
            <em>app/server</em> (broader redistribution). For a Shopify
            store you need a <strong>web license</strong> at minimum. Some
            web licenses are also tiered by monthly pageviews — if your
            store does 500K monthly pageviews and you bought a 100K-tier
            license, you&apos;re technically out of compliance.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            Two clean paths:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-charcoal/80 leading-relaxed">
            <li>
              <strong>Google Fonts</strong> are released under SIL Open Font
              License. You can self-host the WOFF2 files in your theme
              without restriction, including for commercial use.
            </li>
            <li>
              <strong>Marketplaces with commercial licenses included.</strong>
              {" "}<CreativeFabricaInline /> ships every web font with a
              commercial license bundled, which removes the tier-by-pageview
              math entirely.
            </li>
          </ul>
          <p className="text-charcoal/80 leading-relaxed">
            If you&apos;re buying directly from a foundry, read their EULA.
            The thirty seconds it takes is far cheaper than a takedown
            notice three months in.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            4. Pick the minimum number of weights you actually need
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Each weight is a separate file. Loading the full 100→900 family
            is a 600KB+ regression for almost no visible benefit on a
            storefront — most pages use Regular (400) for body and Semi
            Bold (600) or Bold (700) for headings. That&apos;s it.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            Audit your existing storefront before installing: which weights
            does the theme actually use today? Match those, plus an italic
            if you have body copy with emphasis. Skip the rest until you
            need them.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            5. Pair your heading and body fonts (or use one for both)
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            You have two reasonable options:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-charcoal/80 leading-relaxed">
            <li>
              <strong>One face for everything.</strong> Pick a typeface with
              enough range — at least 400 + 700, ideally a full 100→900
              superfamily — and use it for both. Cleanest performance
              budget, fewest decisions, hardest to mess up.
            </li>
            <li>
              <strong>Display for headings, neutral for body.</strong> A
              high-personality display face for H1 / H2 paired with a
              neutral sans (Inter, Public Sans) for paragraph and product
              copy. The body face does the legibility work; the display
              face does the brand work.
            </li>
          </ul>
          <p className="text-charcoal/80 leading-relaxed">
            Don&apos;t pair two display faces. Don&apos;t pair two faces from
            the same category (two geometric sans look almost identical and
            you&apos;ve doubled your file weight for no visual gain).
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            6. Multilingual stores need extra care
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            If your store ships in more than English, check the font&apos;s
            glyph coverage before you commit. A face designed for Latin
            scripts often falls back to the system font for Cyrillic,
            Greek, CJK, or Arabic — which means your Polish or Korean
            storefront looks visually inconsistent compared to the English
            version.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            Google&apos;s <strong>Noto</strong> family is built for
            multilingual coverage. IBM Plex and Inter both have Cyrillic
            and Greek subsets. For CJK you almost always need a different
            face entirely — load it conditionally per locale rather than
            shipping it to your English visitors.
          </p>
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-electric/30 bg-gradient-to-br from-electric/[0.06] via-electric/[0.02] to-transparent p-5 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Once you&apos;ve picked, install it cleanly
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            The {SITE_NAME}{" "}
            <Link href="/" className="text-electric hover:underline">
              generator
            </Link>{" "}
            outputs the three code blocks Shopify expects — @font-face CSS
            with the Liquid <code className="font-mono text-sm">asset_url</code>{" "}
            filter, the settings_schema.json snippet, and the CSS variable
            overrides — for any font you pick. If it doesn&apos;t work out,
            the{" "}
            <Link
              href="/uninstall-custom-font-shopify"
              className="text-electric hover:underline"
            >
              uninstall guide
            </Link>{" "}
            walks through the clean reversal in five steps.
          </p>
        </section>
      </article>
    </>
  );
}
