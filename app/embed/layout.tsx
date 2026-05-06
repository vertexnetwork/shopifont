import type { Metadata } from "next";
import Script from "next/script";

/**
 * Layout for the iframe embed surface. Lives outside the (site) route
 * group so it inherits NONE of the site chrome — no Header, no Footer,
 * no sticky CTA, no Mediavine, no Clarity. The only third-party tag
 * we keep is Plausible, because it's privacy-safe and lets us see how
 * many partner sites are actually loading the embed.
 */

export const metadata: Metadata = {
  title: "Shopifont — Embed",
  description: "Embeddable Shopify custom font code generator.",
  // noindex/nofollow: this is a partner endpoint, not a content page.
  // The marketing page lives at /embed-this and is the indexable
  // surface that points partners here.
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {plausibleDomain ? (
        <Script
          id="plausible-embed"
          strategy="lazyOnload"
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.outbound-links.js"
        />
      ) : null}
      {children}
    </>
  );
}
