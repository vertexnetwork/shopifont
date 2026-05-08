import Link from "next/link";
import { ShopifontGenerator } from "@/components/Generator";
import { Logo } from "@/components/Brand/Logo";
import { SoftwareApplicationSchema } from "@/components/Schema/SoftwareApplicationSchema";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Iframe embed surface. Mounts the full Generator with `mode="embed"`
 * (URL hydration/sync off, share-config button hidden) inside a
 * stripped-down chrome — only an attribution strip pointing back at
 * the homepage so partner-site visitors who like the tool can find us.
 *
 * Partners drop:
 *
 *   <iframe
 *     src="https://shopifont.app/embed"
 *     width="100%"
 *     height="900"
 *     frameborder="0"
 *     loading="lazy"
 *   ></iframe>
 *
 * /embed-this hosts the marketing copy + copy-paste snippet. /embed
 * itself is noindexed (see app/embed/layout.tsx).
 */
export default function EmbedPage() {
  // utm_source on the attribution link lets us see which partners are
  // sending traffic without needing a separate analytics property per
  // site. The host page's own analytics never see this — it's only
  // visible when a visitor clicks through.
  const homeHref = absoluteUrl("/?utm_source=embed&utm_medium=iframe");
  const aboutHref = absoluteUrl("/about?utm_source=embed&utm_medium=iframe");
  const recommendationsHref = absoluteUrl(
    "/recommendations?utm_source=embed&utm_medium=iframe",
  );

  return (
    <>
      <SoftwareApplicationSchema
        name={`${SITE_NAME} — Embedded Generator`}
        url="/embed"
      />

      <div className="min-h-screen flex flex-col bg-paper">
        <header className="border-b border-charcoal-line/30 bg-paper">
          <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
            <a
              href={homeHref}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 text-charcoal font-semibold tracking-tight hover:text-electric"
              aria-label={`Open ${SITE_NAME} in a new tab`}
            >
              <Logo className="w-5 h-5 text-charcoal" />
              <span className="text-sm">{SITE_NAME}</span>
              <span className="text-[10px] uppercase tracking-wide text-muted font-medium">
                Embed
              </span>
            </a>
            <a
              href={homeHref}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-electric"
            >
              Open full version
              <ArrowOut />
            </a>
          </div>
        </header>

        <div className="flex-1 px-3 sm:px-4 py-4 sm:py-6">
          <ShopifontGenerator mode="embed" />
        </div>

        <footer className="border-t border-charcoal-line/20 bg-paper-dim">
          <div className="px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
            <p>
              Embedded from{" "}
              <a
                href={homeHref}
                target="_blank"
                rel="noopener"
                className="text-charcoal hover:text-electric"
              >
                {SITE_NAME.toLowerCase()}.app
              </a>
              . Free, no signup, no upload.
            </p>
            {/*
             * Recommendations CTA — every embed becomes a free
             * affiliate distribution channel. utm_source=embed lets
             * /recommendations attribute clicks back to this iframe
             * surface in Plausible / GSC. opens in new tab so the
             * partner page never loses focus.
             */}
            <a
              href={recommendationsHref}
              target="_blank"
              rel="noopener"
              className="hover:text-electric"
            >
              Recommended Shopify tools →
            </a>
            <Link
              href={aboutHref}
              target="_blank"
              rel="noopener"
              className="hover:text-electric"
            >
              About
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}

function ArrowOut() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      width="10"
      height="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 2H2v8h8V7M7 2h3v3M5 7l5-5" />
    </svg>
  );
}
