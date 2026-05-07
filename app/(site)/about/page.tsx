import type { Metadata } from "next";
import Link from "next/link";
import { AboutPageSchema } from "@/components/Schema/AboutPageSchema";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

const CONTACT_EMAIL = "hello@shopifont.app";

const ABOUT_DESCRIPTION =
  `${SITE_NAME} is a free, independently-built tool that generates the exact code Shopify merchants need to install custom fonts on Dawn and other OS 2.0 themes — without layout shifts, without uploads, and without paid plans.`;

export const metadata: Metadata = {
  title: `About ${SITE_NAME}`,
  description: ABOUT_DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About ${SITE_NAME}`,
    description: ABOUT_DESCRIPTION,
    url: "/about",
    type: "website",
  },
};

export default function AboutPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      <AboutPageSchema
        description={ABOUT_DESCRIPTION}
        contactEmail={CONTACT_EMAIL}
      />
      <BreadcrumbSchema id="about-breadcrumb-schema" crumbs={crumbs} />

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
          <p className="text-xs uppercase tracking-wide text-muted">About</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            About {SITE_NAME}
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80">
            {ABOUT_DESCRIPTION}
          </p>
        </header>

        <section
          aria-labelledby="mission-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="mission-heading"
            className="text-2xl font-bold tracking-tight"
          >
            Why this site exists
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Installing a custom font on a Shopify theme is one of those tasks
            that&apos;s simple in theory and consistently painful in practice.
            The merchant has the font file, knows roughly which CSS file to
            edit, and ends up either pasting Stack Overflow snippets that
            don&apos;t match Dawn&apos;s OS 2.0 token system, or paying for an
            app that does what amounts to a string substitution.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            {SITE_NAME} replaces both options with a single page: type the
            font name, tick the formats you have, and copy the three blocks
            Shopify actually expects — an <code className="font-mono text-sm">@font-face</code>{" "}
            declaration that uses the Liquid <code className="font-mono text-sm">asset_url</code>{" "}
            filter, a <code className="font-mono text-sm">settings_schema.json</code>{" "}
            snippet that exposes a Theme Editor toggle, and CSS variable
            overrides that retarget Dawn&apos;s typography roots so the font
            propagates site-wide without touching core templates. No upload,
            no signup, no JavaScript dependencies the merchant has to ship.
          </p>
        </section>

        <section
          aria-labelledby="approach-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="approach-heading"
            className="text-2xl font-bold tracking-tight"
          >
            How the tool is built
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            {SITE_NAME} is a static Next.js site exported to plain HTML and
            CSS. The generator runs entirely in the browser via string
            interpolation — there is no server, no database, no API. The
            optional live preview uses the FontFace API on a blob URL so the
            font you drop never leaves your machine. The site is open about
            this on every page because trust is the only reason a developer
            would paste generated code into a production storefront.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            We maintain a typed metadata file for every free Shopify OS 2.0
            theme — Dawn, Sense, Refresh, Crave, Origin, Studio, Taste,
            Spotlight, Colorblock, Craft, Ride, Publisher, and Trade — and
            generate a dedicated guide for each. The guides cover the
            theme&apos;s default fonts, the exact file path the{" "}
            <code className="font-mono text-sm">@font-face</code> block belongs
            in, and the CSS variable convention that lets a single override
            block survive theme updates.
          </p>
        </section>

        <section
          aria-labelledby="business-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="business-heading"
            className="text-2xl font-bold tracking-tight"
          >
            How {SITE_NAME} stays free
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            The site is funded by display advertising. We work with Mediavine
            so that ad density stays inside the bounds Mediavine sets for its
            partners — that means no interstitials, no auto-playing video
            with sound, and reserved-height ad slots so a loading ad cannot
            cause the page to jump while you&apos;re reading. If display
            advertising ever conflicts with the developer-tool experience,
            the experience wins.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            We take no affiliate commission for any Shopify theme, app, or
            service mentioned on the site. The theme metadata is sourced
            directly from Shopify&apos;s public Theme Store and from each
            theme&apos;s own documentation.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            We do work with one font marketplace as an affiliate:{" "}
            <strong>Creative Fabrica</strong>. When you click a Creative
            Fabrica link from anywhere on the site and end up buying a font,
            we receive a small commission at no extra cost to you. We picked
            Creative Fabrica because their web fonts ship with commercial
            licenses included — the merchant doesn&apos;t need a separate
            license to use the font in a Shopify storefront. Affiliate links
            carry{" "}
            <code className="font-mono text-sm">rel=&quot;sponsored&quot;</code>{" "}
            per Google&apos;s webmaster guidelines. The partnership does not
            influence which themes we cover, the order they appear in, or
            anything else about the editorial content of the site.
          </p>
        </section>

        <section
          aria-labelledby="privacy-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="privacy-heading"
            className="text-2xl font-bold tracking-tight"
          >
            Privacy and data
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            {SITE_NAME} uses two analytics tools. Plausible Analytics, when
            enabled, is cookie-free and reports only aggregate page views
            and country — no individual tracking. Microsoft Clarity is also
            loaded to capture heatmaps and session recordings so we can
            see where the tool is hard to use; Clarity sets first-party
            cookies and masks sensitive form fields by default. Clarity
            never has access to the contents of any font file you load
            locally — the preview reads the file in your browser&apos;s
            memory only, and there is no upload endpoint for it to
            intercept.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            The optional file-preview feature loads your font in your
            browser only — there is no upload endpoint and no telemetry
            attached to the file itself. Display advertising, when active,
            is served by Mediavine and follows Mediavine&apos;s own privacy
            controls; users in regulated jurisdictions see Mediavine&apos;s
            consent flow before personalized ads load.
          </p>
        </section>

        <section
          aria-labelledby="maintainer-heading"
          className="flex flex-col gap-3 rounded-lg border border-charcoal-line/30 bg-paper-dim p-5"
        >
          <h2
            id="maintainer-heading"
            className="text-2xl font-bold tracking-tight"
          >
            Who maintains {SITE_NAME}
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            {SITE_NAME} is built and maintained by an independent developer
            who works with Shopify themes day-to-day. The generators on this
            site are pure client-side string interpolation — what you copy is
            what runs in your browser, with no server round-trip and no
            obfuscation. If a theme update breaks the generated code or
            something looks off, email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-electric hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            and you&apos;ll get a real reply.
          </p>
        </section>

        <section
          aria-labelledby="contact-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="contact-heading"
            className="text-2xl font-bold tracking-tight"
          >
            Contact
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Questions, theme-specific bug reports, or requests for additional
            generators are welcome at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-electric hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            . If a theme update breaks the generated code, that&apos;s the
            email to send — correctness regressions are priority work.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            {SITE_NAME} is not affiliated with Shopify Inc. &quot;Shopify&quot;
            and &quot;Dawn&quot; are trademarks of Shopify Inc. and are used
            here for compatibility reference only.
          </p>
        </section>
      </div>
    </>
  );
}
