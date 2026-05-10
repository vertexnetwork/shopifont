"use client";

import { safeTrack } from "@/lib/analytics";
import type { Affiliate } from "@/lib/site-config";

/**
 * Generic affiliate slot. Reads from `siteConfig.features.affiliates[]`
 * (we ship two — Creative Fabrica + Printify) and renders a card or an
 * inline mention.
 *
 * Click telemetry: fires an `affiliate_click` event with `provider`
 * and `placement` props via the `safeTrack` no-op-safe wrapper.
 *
 * Per spec §10, every link carries `rel="sponsored noopener"` (Google
 * webmaster + FTC compliance) and opens in a new tab.
 */
export function AffiliateSlot({
  affiliate,
  variant = "card",
  placement,
  headline,
  body,
  cta,
}: {
  affiliate: Affiliate;
  variant?: "card" | "inline";
  /** Analytics tag for the surface — e.g. "homepage", "pseo-faq". */
  placement: string;
  headline?: string;
  body?: React.ReactNode;
  cta?: string;
}) {
  const onClick = () =>
    safeTrack("affiliate_click", {
      provider: affiliate.provider,
      placement,
    });
  const rel = affiliate.rel ?? "sponsored noopener";

  if (variant === "inline") {
    return (
      <p className="text-sm text-charcoal/80">
        <span className="text-muted">{headline}</span>{" "}
        <a
          href={affiliate.url}
          target="_blank"
          rel={rel}
          onClick={onClick}
          className="text-electric font-medium hover:underline"
        >
          {affiliate.label}
        </a>{" "}
        <span className="text-muted">
          {body}{" "}
          <span className="text-charcoal-line/70">(affiliate)</span>
        </span>
      </p>
    );
  }

  return (
    <section
      aria-label={`Affiliate placement: ${affiliate.label}`}
      className="rounded-lg border border-electric/30 bg-gradient-to-br from-electric/[0.06] via-electric/[0.02] to-transparent p-5 sm:p-6 shadow-card"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex flex-col gap-2">
          <p className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-soft text-amber-deep px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-amber" />
            Affiliate · No cost to you
          </p>
          {headline ? (
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {headline}
            </h2>
          ) : null}
          {body ? (
            <p className="text-sm sm:text-base text-charcoal/80 max-w-2xl">
              {body}
            </p>
          ) : null}
        </div>
        <a
          href={affiliate.url}
          target="_blank"
          rel={rel}
          onClick={onClick}
          className="group inline-flex items-center justify-center self-start sm:self-center min-h-[2.75rem] px-5 rounded-md bg-electric text-paper font-semibold text-sm shadow-cta hover:bg-electric-hover whitespace-nowrap"
        >
          {cta ?? `Visit ${affiliate.label}`}
          <span
            aria-hidden
            className="ml-1.5 transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </a>
      </div>
    </section>
  );
}
