import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { CHROME_WEB_STORE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

const EXTENSION_DESCRIPTION =
  `The ${SITE_NAME} Chrome extension generates Shopify @font-face CSS, settings_schema.json, and CSS variable overrides directly from a popup — no tab switch, no upload, no telemetry. Built for Dawn and every other OS 2.0 theme.`;

export const metadata: Metadata = {
  title: `Chrome Extension — ${SITE_NAME}`,
  description: EXTENSION_DESCRIPTION,
  alternates: { canonical: "/extension" },
  openGraph: {
    title: `${SITE_NAME} Chrome Extension`,
    description: EXTENSION_DESCRIPTION,
    url: "/extension",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} Chrome Extension`,
    description: EXTENSION_DESCRIPTION,
  },
};

export default function ExtensionPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Chrome Extension", href: "/extension" },
  ];

  return (
    <>
      <BreadcrumbSchema id="extension-breadcrumb-schema" crumbs={crumbs} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-12">
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
            Chrome extension · Free
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Generate Shopify font code without leaving your tab
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80">
            The {SITE_NAME} extension puts the same generator that runs on this
            site into a browser popup. Type the font name, tick the formats,
            copy the three blocks Shopify expects — all from the toolbar,
            without opening a new tab or losing your place in the theme editor.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noopener"
              className="group inline-flex items-center justify-center min-h-[3.25rem] px-6 rounded-md bg-electric text-paper font-semibold text-base shadow-cta hover:bg-electric-hover"
            >
              Add to Chrome
              <span
                aria-hidden
                className="ml-2 transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center min-h-[3.25rem] px-4 rounded-md border border-charcoal-line/50 text-charcoal hover:border-electric hover:text-electric transition-colors"
            >
              Or use the web version
            </Link>
          </div>
        </header>

        <section
          aria-labelledby="screenshots-heading"
          className="flex flex-col gap-3"
        >
          <h2 id="screenshots-heading" className="sr-only">
            Screenshots
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="rounded-lg border border-charcoal-line/30 overflow-hidden bg-paper-dim shadow-card">
              <img
                src="/extension/screenshot-popup.png"
                alt={`${SITE_NAME} extension popup with the font name and format toggles visible`}
                width={1280}
                height={800}
                loading="lazy"
                decoding="async"
                className="w-full h-auto block"
              />
            </figure>
            <figure className="rounded-lg border border-charcoal-line/30 overflow-hidden bg-paper-dim shadow-card">
              <img
                src="/extension/screenshot-features.png"
                alt={`${SITE_NAME} extension showing the generated @font-face, settings_schema.json, and CSS variable code blocks`}
                width={1280}
                height={800}
                loading="lazy"
                decoding="async"
                className="w-full h-auto block"
              />
            </figure>
          </div>
        </section>

        <section
          aria-labelledby="why-heading"
          className="flex flex-col gap-4"
        >
          <h2
            id="why-heading"
            className="text-2xl font-bold tracking-tight"
          >
            Why install it
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            The web version of {SITE_NAME} works fine — pasting a font name
            into a tab and copying three code blocks is a 30-second job. The
            extension exists for the case where you&apos;re already deep
            inside the Shopify admin or the theme code editor, you need to
            install another font, and tab-switching breaks your flow. It
            puts the generator one click away in the browser chrome.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            <Feature title="Same generator, popup-sized">
              The extension reuses the website&apos;s generator code one-to-one
              — same output, same formatting, same Dawn-compatible{" "}
              <code className="font-mono text-sm">@font-face</code> block.
              Nothing diverges between web and extension.
            </Feature>
            <Feature title="All formats, all OS 2.0 themes">
              WOFF2, WOFF, TTF, OTF, EOT — tick what your foundry sent you and
              the generator writes the cross-format{" "}
              <code className="font-mono text-sm">src</code> stack. The output
              works on Dawn, Sense, Refresh, Crave, Origin, and every other
              free Shopify OS 2.0 theme.
            </Feature>
            <Feature title="Three copy-ready blocks">
              The popup outputs the{" "}
              <code className="font-mono text-sm">@font-face</code>{" "}
              declaration with the Liquid{" "}
              <code className="font-mono text-sm">asset_url</code> filter, a{" "}
              <code className="font-mono text-sm">settings_schema.json</code>{" "}
              snippet, and CSS variable overrides — each with a copy button.
            </Feature>
            <Feature title="Zero telemetry">
              No analytics, no tracking, no remote config. The extension only
              requests storage permission to remember your last-used settings
              between popup opens. Nothing leaves the browser.
            </Feature>
          </ul>
        </section>

        <section
          aria-labelledby="privacy-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="privacy-heading"
            className="text-2xl font-bold tracking-tight"
          >
            Privacy
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            The extension does not load any analytics, telemetry, or remote
            scripts. It does not read or modify the contents of any web page
            — there is no content script. The popup is a self-contained tool
            that runs the generator locally and writes its output to your
            clipboard when you click a copy button. The font name and format
            toggles you set are kept in the extension&apos;s own local
            storage so the popup remembers your preferences; that storage
            stays on your device and is never synced or transmitted.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            The single outbound link in the popup — &ldquo;Open full
            site&rdquo; — opens shopifont.app in a new tab with a UTM parameter
            so the website can count how many extension users visit, which is
            the only signal we use to decide whether the extension is worth
            maintaining. No identifiers, no fingerprints — just an aggregate
            referral count.
          </p>
        </section>

        <section
          aria-labelledby="when-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="when-heading"
            className="text-2xl font-bold tracking-tight"
          >
            When to use the extension vs. the website
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Use the <strong>extension</strong> when you&apos;re inside the
            Shopify admin or your theme&apos;s code editor and you just need
            the three code blocks — the popup keeps you in context. Use the{" "}
            <strong>
              <Link href="/" className="text-electric hover:underline">
                website
              </Link>
            </strong>{" "}
            when you want the longer-form material: the{" "}
            <Link
              href="/shopify-dawn-custom-font-generator"
              className="text-electric hover:underline"
            >
              Dawn-specific guide
            </Link>
            , the per-theme generators for the other twelve free OS 2.0
            themes, the live font preview that lets you drop a file and see it
            render before you paste anything into production, and{" "}
            <Link href="/about" className="text-electric hover:underline">
              the background on how the tool is built
            </Link>
            . Most workflows end up using both — the extension for the daily
            paste-and-go, the site for the first install on a new theme.
          </p>
        </section>

        <section
          aria-labelledby="install-heading"
          className="flex flex-col gap-4 rounded-lg border border-electric/30 bg-gradient-to-br from-electric/[0.06] via-electric/[0.02] to-transparent p-5 sm:p-6 shadow-card"
        >
          <h2
            id="install-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight"
          >
            Install the {SITE_NAME} extension
          </h2>
          <p className="text-sm sm:text-base text-charcoal/80">
            Free, no account required. Available now on the Chrome Web Store —
            also works on Edge and any Chromium-based browser that supports
            Chrome Web Store extensions.
          </p>
          <a
            href={CHROME_WEB_STORE_URL}
            target="_blank"
            rel="noopener"
            className="group inline-flex items-center justify-center self-start min-h-[2.75rem] px-5 rounded-md bg-electric text-paper font-semibold text-sm shadow-cta hover:bg-electric-hover whitespace-nowrap"
          >
            Add to Chrome
            <span
              aria-hidden
              className="ml-1.5 transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
        </section>
      </div>
    </>
  );
}

function Feature({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-col gap-1.5 rounded-lg border border-charcoal-line/30 p-4 shadow-card">
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-charcoal/80 leading-relaxed">{children}</p>
    </li>
  );
}
