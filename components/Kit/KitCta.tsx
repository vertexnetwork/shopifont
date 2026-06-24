"use client";

import Script from "next/script";
import { safeTrack } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
import { useFoundingOffer } from "@/components/Kit/useFoundingOffer";

/**
 * The one paid-product buy button. Opens the Gumroad checkout as an
 * IN-PAGE OVERLAY (a modal over our own page) instead of throwing the
 * buyer to gumroad.com in a new tab — one fewer context switch, on the
 * domain they already trust. It also reflects the live founder offer:
 * struck-through price → discounted price, "37% off", and a "only N left"
 * counter, all gated on the same server-confirmed remaining count so a
 * buyer never sees a deal the checkout won't honor.
 *
 * Renders NOTHING until `features.kit.enabled` (i.e. the Gumroad URL is
 * set). Callers that need a visible dark state (the sales page) render
 * their own "launching shortly" fallback when this returns null.
 *
 * The overlay requires three things, all handled here:
 *   1. load gumroad.js,
 *   2. tag the link `gumroad-button`,
 *   3. NEVER add `wanted=true` — Gumroad's overlay bundle refuses to bind
 *      the modal to any link already carrying it and just navigates away
 *      full-page. The script appends `overlay=true` itself. (See CSP +
 *      .env notes.) The target/rel are the no-JS fallback only.
 */

type Source = "kits-hero" | "kits-how" | "audit-scorecard" | "header" | "upsell";

type Props = {
  /** Placement identifier — threads into UTM + the buy-click event. */
  source: Source;
  /** Override the button label. */
  label?: string;
  /** Stack the price/scarcity caption under the button instead of beside. */
  block?: boolean;
  /** Button scale. `sm` is for the header. */
  size?: "sm" | "md" | "lg";
  /** Drop the price/scarcity caption — used in tight chrome (the header). */
  hideCaption?: boolean;
  className?: string;
};

const GUMROAD_OVERLAY_SRC = "https://gumroad.com/js/gumroad.js";

// "$12" for whole numbers, "$11.97" if a discount ever lands on cents —
// match what Gumroad actually charges rather than rounding to a prettier
// figure.
function fmtPrice(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

function buildHref(rawUrl: string, source: Source, offerCode?: string): string {
  try {
    const url = new URL(rawUrl);
    url.searchParams.set("utm_source", "shopifont");
    url.searchParams.set("utm_medium", source);
    url.searchParams.set("utm_campaign", "typography-kits");
    // Founder code. Gumroad auto-applies a URL `offer_code`, so the overlay
    // opens already discounted. Attached ONLY while the offer is active —
    // dropped in the same render that drops the discounted price, so a
    // buyer never sees a price the checkout won't honor.
    if (offerCode) url.searchParams.set("offer_code", offerCode);
    return url.toString();
  } catch {
    return rawUrl;
  }
}

const SIZE_CLASS: Record<NonNullable<Props["size"]>, string> = {
  sm: "min-h-[2.25rem] px-3.5 text-sm",
  md: "min-h-[2.75rem] px-5 text-sm",
  lg: "min-h-[3rem] px-6 text-base",
};

export function KitCta({
  source,
  label,
  block = false,
  size = "md",
  hideCaption = false,
  className = "",
}: Props) {
  const { enabled, gumroadUrl } = siteConfig.features.kit;
  const fullPrice = siteConfig.features.kit.price;

  const offer = useFoundingOffer();
  const showOffer = Boolean(offer?.active);

  // Ship dark until the Gumroad product exists. Callers own the fallback.
  if (!enabled || !gumroadUrl) return null;

  const offerCode = showOffer ? offer!.code : undefined;
  const href = buildHref(gumroadUrl, source, offerCode);

  const fullPriceStr = `$${fullPrice}`;
  const nowPriceStr = showOffer
    ? fmtPrice(Math.max(0, fullPrice - (offer!.discountUsd ?? 0)))
    : null;
  // Two composable scraps so every placement frames the deal the same way:
  // a percentage (rule of 100 — below $100 "37% off" reads bigger than "$7
  // off") plus a denominator-free count ("only N left", no "/37" tell that
  // would reveal how few have sold at launch).
  const pctOff = showOffer ? `${offer!.discountPct}% off` : null;
  const spotsLeft = showOffer ? `only ${offer!.remaining} left` : null;

  const defaultLabel = showOffer
    ? `Get all six kits for ${nowPriceStr}`
    : "Get the Typography Kits";

  function track() {
    safeTrack("kit_buy_click", {
      source,
      offer: showOffer ? "founder" : "full",
      price: showOffer ? (nowPriceStr ?? "") : fullPriceStr,
    });
  }

  return (
    <>
      <Script id="gumroad-overlay-js" src={GUMROAD_OVERLAY_SRC} strategy="afterInteractive" />
      <div
        className={
          "flex flex-wrap items-center gap-x-3 gap-y-1.5 " + (block ? "" : "sm:flex-nowrap")
        }
      >
        <a
          href={href}
          onClick={track}
          // `target`/`rel` are the no-JS fallback; the overlay intercepts.
          target="_blank"
          rel="noopener"
          className={
            "gumroad-button group inline-flex items-center justify-center rounded-md bg-electric text-paper font-semibold shadow-cta hover:bg-electric-hover whitespace-nowrap " +
            SIZE_CLASS[size] +
            " " +
            className
          }
        >
          {label ?? defaultLabel}
          <span aria-hidden className="ml-1.5 transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </a>
        {hideCaption ? null : showOffer ? (
          <span className="inline-flex items-center gap-1.5 text-xs">
            <s className="text-muted">{fullPriceStr}</s>
            <span className="font-semibold text-electric">{pctOff}</span>
            <span className="text-muted">· {spotsLeft}</span>
          </span>
        ) : (
          <span className="text-xs text-muted">{siteConfig.features.kit.priceLabel}</span>
        )}
      </div>
    </>
  );
}
