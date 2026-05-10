"use client";

import Link from "next/link";
import { Wordmark } from "@/components/Brand/Wordmark";
import { EmailCaptureForm } from "@/components/EmailCapture/EmailCaptureForm";
import { trackVertexFooterOpened } from "@/lib/analytics";
import { NETWORK_BRAND } from "@/lib/site";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const { product, company, legal } = siteConfig.nav.footer;
  return (
    <footer className="mt-12 border-t border-charcoal-line/30 bg-paper-dim">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col gap-8">
        {siteConfig.features.email.enabled ? (
          <section
            aria-labelledby="footer-signup-heading"
            className="flex flex-col gap-3 rounded-lg border border-electric/25 bg-paper p-5 sm:p-6 shadow-card"
          >
            <div className="flex flex-col gap-1">
              <h2
                id="footer-signup-heading"
                className="text-base sm:text-lg font-semibold tracking-tight"
              >
                The Shopify font-pairing checklist
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                Six-axis PDF. One email, then it&apos;s in your inbox. No
                account, no spam. Already have it? Skip to the{" "}
                <Link href="/" className="text-electric hover:underline">
                  generator
                </Link>
                .
              </p>
            </div>
            <EmailCaptureForm variant="footer" source="site-footer" />
          </section>
        ) : null}

        <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,auto))] sm:items-start">
          <div className="flex flex-col gap-3 max-w-xs">
            <Link href="/" aria-label={`${siteConfig.name} home`}>
              <Wordmark size="sm" />
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              {siteConfig.tagline}. No signup, no upload, zero CLS.
            </p>
          </div>

          <FooterColumn heading="Generators" links={product} />
          <FooterColumn heading="Guides" links={company} />
          <FooterColumn heading="Site" links={legal} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-charcoal-line/20">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {siteConfig.name}
            <span aria-hidden className="mx-1.5 text-charcoal-line/60">
              ·
            </span>
            <Link
              href="/network"
              onClick={trackVertexFooterOpened}
              className="hover:text-electric"
            >
              Part of the {NETWORK_BRAND}
            </Link>
          </p>
          <p className="text-xs text-muted">{siteConfig.trademarkDisclaimer}</p>
        </div>

        {siteConfig.features.affiliates.length > 0 ? (
          <p className="text-[11px] text-muted/80 leading-relaxed">
            {siteConfig.features.affiliates
              .map((a) => a.label)
              .join(" and ")}{" "}
            links pay us a commission at no cost to you. Display ads keep the
            rest of the lights on. Full disclosure on the{" "}
            <Link href="/about" className="underline hover:text-electric">
              About
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-electric">
              Privacy
            </Link>{" "}
            pages.
          </p>
        ) : null}
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <nav
      aria-label={heading}
      className="flex flex-col gap-2 sm:min-w-[10rem]"
    >
      <h2 className="text-xs uppercase tracking-wide text-muted font-semibold">
        {heading}
      </h2>
      <ul className="columns-2 sm:columns-1 gap-x-4 text-sm space-y-1.5 [&>li]:break-inside-avoid">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex items-center min-h-[2rem] hover:text-electric"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
