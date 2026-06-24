"use client";

import Link from "next/link";
import { safeTrack } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
import { useFoundingOffer } from "@/components/Kit/useFoundingOffer";

/**
 * Site-wide cold-start strip. Renders nothing until the founder offer is
 * confirmed active (and vanishes the moment it sells out, because it's
 * driven by the live remaining count) — so there's never a stale or fake
 * banner. Routes to the sales page, where the overlay buy button lives, so
 * the buyer lands in context rather than on a raw checkout.
 *
 * Double-gated: the offer can only be active when the kit feature is
 * enabled AND the server can read the live count, so this is dark-safe.
 */
export function FounderBanner() {
  const { enabled } = siteConfig.features.kit;
  const offer = useFoundingOffer();

  if (!enabled || !offer?.active) return null;

  return (
    <Link
      href="/shopify-typography-kits"
      onClick={() => safeTrack("kit_buy_click", { source: "founder-banner" })}
      className="block bg-electric px-4 py-2 text-center text-xs sm:text-sm text-paper transition-colors hover:bg-electric-hover"
    >
      <strong>Founder price</strong> — {offer.discountPct}% off the Shopify Typography Kits · only{" "}
      {offer.remaining} left
      <span aria-hidden className="ml-1">
        →
      </span>
    </Link>
  );
}
