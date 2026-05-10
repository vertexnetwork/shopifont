import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { siteConfig, getBuildDateLabel } from "@/lib/site-config";

export const dynamic = "force-static";

const TITLE = "Terms of Use";
const DESCRIPTION = `Terms of use for ${siteConfig.name} — what the generator does and doesn't guarantee, the no-warranty clause, and what you can and can't do with the generated code.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: {
    title: `${TITLE} | ${siteConfig.name}`,
    description: DESCRIPTION,
    url: "/terms",
    type: "article",
  },
};

export default function TermsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Terms", href: "/terms" },
  ];

  return (
    <>
      <BreadcrumbSchema id="terms-breadcrumb-schema" crumbs={crumbs} />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-8">
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

        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide text-muted">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            {TITLE}
          </h1>
          <p className="text-sm text-muted">
            Last updated {getBuildDateLabel()}.
          </p>
        </header>

        <Section title="Acceptance">
          <p>
            By using {siteConfig.name} you agree to these terms. If you
            don&apos;t agree, don&apos;t use the site or the generated code.
          </p>
        </Section>

        <Section title="What the tool does">
          <p>
            {siteConfig.name} generates three copy-paste code blocks for
            installing a custom font on a Shopify Online Store 2.0 theme: an{" "}
            <code className="font-mono text-sm">@font-face</code> CSS block,
            a{" "}
            <code className="font-mono text-sm">settings_schema.json</code>{" "}
            snippet, and CSS variable overrides. All generation is pure
            client-side string interpolation. There is no upload, no
            server-side processing, no account.
          </p>
        </Section>

        <Section title="Generated code: license + no warranty">
          <p>
            Generated code blocks are released under{" "}
            <a
              href="https://creativecommons.org/publicdomain/zero/1.0/"
              target="_blank"
              rel="noopener"
              className="text-electric hover:underline"
            >
              CC0
            </a>{" "}
            — public domain dedication. You may use them for any purpose,
            commercial or otherwise, with or without attribution.
          </p>
          <p>
            <strong>
              The generated code is provided &quot;as is,&quot; without
              warranty of any kind, express or implied.
            </strong>{" "}
            That includes (but isn&apos;t limited to) warranties of
            merchantability, fitness for a particular purpose, and
            non-infringement. Theme updates from Shopify or third-party
            theme vendors may change the selectors, file paths, or token
            names the generated code depends on. We do our best to keep the
            theme metadata current, but you are responsible for reviewing
            generated code against your live theme before deploying it.
          </p>
        </Section>

        <Section title="Font files are your responsibility">
          <p>
            You must have the legal right to use any font file you install
            via the generated code. This site does not host, distribute, or
            license fonts. Most foundry and marketplace licenses require a
            web-license tier specifically for use in a public website;
            verify your license covers a Shopify storefront before
            uploading the file to your theme&apos;s assets.
          </p>
          <p>
            The optional file-preview feature in the generator reads the
            font in your browser only — there is no upload to our servers,
            so we never see, store, or transmit the file. That&apos;s a
            privacy guarantee, not a license escape: it does not relieve
            you of license obligations toward the font&apos;s
            rights-holders.
          </p>
        </Section>

        <Section title="Trademarks and attribution">
          <p>{siteConfig.trademarkDisclaimer}</p>
          <p>
            References to specific Shopify themes (Dawn, Sense, Refresh,
            Crave, Origin, Studio, Taste, Spotlight, Colorblock, Craft,
            Ride, Publisher, Trade) are nominative — used only to identify
            the theme the generated code targets. We are not affiliated
            with the theme vendors, and the use of theme names does not
            imply endorsement.
          </p>
        </Section>

        <Section title="Embedding the generator">
          <p>
            The{" "}
            <code className="font-mono text-sm">/embed</code> route is
            available for partners who want to host the live generator
            inside their own pages via an iframe. Embedding is permitted at
            no cost, with one rule: you may not strip the &quot;Embedded
            from {siteConfig.name}&quot; attribution. The marketing copy
            and copy-paste snippet live at{" "}
            <Link href="/embed-this" className="text-electric hover:underline">
              /embed-this
            </Link>
            .
          </p>
        </Section>

        <Section title="Acceptable use">
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li>
              Don&apos;t scrape the site at a rate that meaningfully
              impacts other users. There&apos;s nothing to scrape that
              isn&apos;t also published in{" "}
              <a href="/llms-full.txt" className="text-electric hover:underline">
                /llms-full.txt
              </a>
              .
            </li>
            <li>
              Don&apos;t attempt to use the email-capture API for anything
              other than legitimate signups.
            </li>
            <li>
              Don&apos;t represent generated code as having been audited or
              endorsed by Shopify Inc.
            </li>
          </ul>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the maximum extent permitted by law, {siteConfig.name}, the
            maintainer, and any contributors are not liable for any
            indirect, incidental, special, consequential, or punitive
            damages — including lost revenue, lost data, or business
            interruption — arising out of or in connection with the
            generated code or your use of the site. Aggregate liability is
            capped at zero, because zero is the price of the service.
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            We may update these terms at any time. Material changes are
            reflected in the &quot;Last updated&quot; line at the top of
            this page. Continued use of the site after a change means you
            accept the updated terms.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about these terms:{" "}
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="text-electric hover:underline"
            >
              {siteConfig.supportEmail}
            </a>
            .
          </p>
        </Section>
      </article>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
      <div className="text-charcoal/80 leading-relaxed flex flex-col gap-3">
        {children}
      </div>
    </section>
  );
}
