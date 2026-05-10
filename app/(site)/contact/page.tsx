import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

const TITLE = `Contact ${siteConfig.name}`;
const DESCRIPTION = `Get in touch with the ${siteConfig.name} maintainer — bug reports, theme-update breakage, generator requests, and partnership inquiries.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/contact",
    type: "website",
  },
};

export default function ContactPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <BreadcrumbSchema id="contact-breadcrumb-schema" crumbs={crumbs} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-8">
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
          <p className="text-xs uppercase tracking-wide text-muted">Contact</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Get in touch
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80">
            {siteConfig.name} is maintained by an independent developer who
            works with Shopify themes day-to-day. Email is the only inbox —
            it&apos;s read by a real person and you&apos;ll get a real reply.
          </p>
        </header>

        <section
          aria-labelledby="email-heading"
          className="flex flex-col gap-3 rounded-lg border border-electric/30 bg-paper-dim p-5 sm:p-6 shadow-card"
        >
          <h2
            id="email-heading"
            className="text-xs uppercase tracking-wide text-muted font-semibold"
          >
            Email
          </h2>
          <p className="text-2xl sm:text-3xl font-mono">
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="text-charcoal hover:text-electric"
            >
              {siteConfig.supportEmail}
            </a>
          </p>
          <p className="text-sm text-muted">
            Typical reply time is under 48 hours on weekdays.
          </p>
        </section>

        <section
          aria-labelledby="what-to-write-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="what-to-write-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight"
          >
            What to write about
          </h2>
          <ul className="flex flex-col gap-3">
            <Item label="Theme-update breakage">
              Shopify or a theme vendor pushed an update and the generated
              code now produces the wrong selector / file path / token name.
              These are the highest-priority emails — correctness regressions
              get fixed first.
            </Item>
            <Item label="Bug reports">
              Generator output that&apos;s syntactically wrong, copy buttons
              that don&apos;t copy, mobile layout glitches, accessibility
              issues. Include browser + viewport size if you can.
            </Item>
            <Item label="New theme support">
              A free OS 2.0 theme that isn&apos;t in the dropdown yet. Send
              the theme name and the Theme Store link; I&apos;ll add the
              metadata.
            </Item>
            <Item label="Embedding the generator">
              Tutorial author, theme reviewer, or partner who wants to host
              the generator inline? See{" "}
              <Link href="/embed-this" className="text-electric hover:underline">
                /embed-this
              </Link>{" "}
              first — most embed questions are answered there.
            </Item>
            <Item label="Press / partnerships">
              Open to coverage, podcast invites, and product partnerships
              that respect the &quot;free, no signup&quot; promise. Skip
              sponsored-post pitches that require editorial slots.
            </Item>
          </ul>
        </section>

        <section
          aria-labelledby="not-here-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="not-here-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight"
          >
            Things this address can&apos;t help with
          </h2>
          <ul className="list-disc pl-6 flex flex-col gap-1.5 text-charcoal/80 leading-relaxed">
            <li>
              Account or billing questions for Shopify itself —{" "}
              {siteConfig.name} is not affiliated with Shopify Inc.
            </li>
            <li>
              Font licensing disputes. The generator doesn&apos;t host fonts
              and has no relationship with foundries or marketplaces.
            </li>
            <li>
              Custom theme development. The generator covers font installs;
              full theme builds are not part of the service.
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}

function Item({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-1.5 sm:gap-4">
      <p className="text-sm font-semibold text-charcoal">{label}</p>
      <p className="text-sm text-charcoal/80 leading-relaxed">{children}</p>
    </li>
  );
}
