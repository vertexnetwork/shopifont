"use client";

import Link from "next/link";
import { useConsent } from "./ConsentProvider";

/**
 * Bottom-of-viewport cookie banner. Renders only when consent is in
 * the "unknown" state — once the user accepts or declines, the banner
 * stays gone for the lifetime of that consent record.
 *
 * Two buttons, no dark patterns:
 *  - Accept (primary CTA, electric)
 *  - Decline (secondary, equal visual weight to ensure GDPR
 *    reject-as-easy-as-accept compliance)
 */
export function CookieConsent() {
  const { value, grant, deny } = useConsent();
  if (value !== "unknown") return null;

  return (
    <div
      role="dialog"
      aria-labelledby="consent-banner-heading"
      className="fixed left-0 right-0 bottom-0 z-50 px-3 sm:px-4 pb-3 sm:pb-4"
    >
      <div className="mx-auto max-w-3xl rounded-lg border border-charcoal-line/30 bg-paper shadow-card p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2
            id="consent-banner-heading"
            className="text-sm font-semibold text-charcoal"
          >
            Cookies for the heatmap.
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            Plausible (cookie-free) is always on. Microsoft Clarity loads
            only with your consent — it sets a first-party cookie so we can
            see where the generator is hard to use. No personal data ever
            leaves the page.{" "}
            <Link href="/privacy" className="underline hover:text-electric">
              Details on the Privacy page
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={deny}
            className="min-h-[2.5rem] px-4 rounded-md border border-charcoal-line/40 text-charcoal text-sm hover:border-electric hover:text-electric"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={grant}
            className="min-h-[2.5rem] px-4 rounded-md bg-electric text-paper text-sm font-semibold shadow-cta hover:bg-electric-hover"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
