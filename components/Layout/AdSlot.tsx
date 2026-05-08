import Script from "next/script";

/**
 * Reserved ad slot. Renders a fixed-height placeholder so the layout
 * never reflows when ads load (PLAN.md §5 zero-CLS budget).
 *
 * Network selection is driven by NEXT_PUBLIC_AD_NETWORK in the
 * (site) layout — exactly one of "adsense" / "mediavine" wins, never
 * both, never simultaneously (network policies forbid that, and
 * Mediavine can revoke Journey approval if competing scripts are
 * detected).
 *
 * Mediavine: discovered automatically via `data-mediavine` and the
 * slot `id` once the Grow Faves bootstrapper authenticates the site.
 *
 * AdSense: each slot needs its own ad-unit slot ID set via env var
 * (per position). The `<ins class="adsbygoogle">` markup is what the
 * adsbygoogle.js bootstrap fills with an ad on `push()`.
 *
 * Pre-launch (no network selected, or selected but missing ID): the
 * slot is reserved with min-height but invisible — first-time
 * visitors don't see "Advertisement" placeholders that look like a
 * broken / adblocked page. CLS budget stays zero either way.
 */
type AdPosition = "leaderboard" | "in-content" | "sidebar";

const HEIGHT_VAR: Record<AdPosition, string> = {
  leaderboard: "var(--ad-slot-leaderboard-h)",
  "in-content": "var(--ad-slot-incontent-h)",
  sidebar: "var(--ad-slot-sidebar-h)",
};

const adNetwork = process.env.NEXT_PUBLIC_AD_NETWORK?.trim().toLowerCase();
const mediavineSiteId = process.env.NEXT_PUBLIC_MEDIAVINE_SITE_ID?.trim();
const adsenseClientId =
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID?.trim();

const ADSENSE_SLOT_BY_POSITION: Record<AdPosition, string | undefined> = {
  leaderboard: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_LEADERBOARD?.trim(),
  "in-content": process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_INCONTENT?.trim(),
  sidebar: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR?.trim(),
};

const useMediavine = adNetwork === "mediavine" && Boolean(mediavineSiteId);
const useAdsense = adNetwork === "adsense" && Boolean(adsenseClientId);

export function AdSlot({
  id,
  position,
  className = "",
}: {
  id: string;
  position: AdPosition;
  className?: string;
}) {
  if (useAdsense) {
    const slotId = ADSENSE_SLOT_BY_POSITION[position];
    if (!slotId) {
      // Reserved height but no ad — keeps CLS budget at zero even when
      // a specific slot ID isn't configured yet.
      return <ReservedShell id={id} className={className} position={position} />;
    }
    return (
      <aside
        id={id}
        aria-label="Advertisement"
        className={
          "flex items-center justify-center text-xs uppercase tracking-wide text-muted bg-paper-dim border border-charcoal-line/20 rounded-md " +
          className
        }
        style={{ minHeight: HEIGHT_VAR[position] }}
      >
        <ins
          className="adsbygoogle block"
          data-ad-client={adsenseClientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
          style={{ display: "block", width: "100%", minHeight: HEIGHT_VAR[position] }}
        />
        <Script id={`adsbygoogle-push-${id}`} strategy="afterInteractive">
          {`(adsbygoogle = window.adsbygoogle || []).push({});`}
        </Script>
      </aside>
    );
  }

  if (useMediavine) {
    return (
      <aside
        id={id}
        data-mediavine={position}
        aria-label="Advertisement"
        className={
          "flex items-center justify-center text-xs uppercase tracking-wide text-muted bg-paper-dim border border-charcoal-line/20 rounded-md " +
          className
        }
        style={{ minHeight: HEIGHT_VAR[position] }}
      >
        <span className="opacity-60">Advertisement</span>
      </aside>
    );
  }

  // No network configured: invisible reservation preserves CLS budget
  // and avoids "Advertisement" placeholders pre-launch.
  return <ReservedShell id={id} className={className} position={position} />;
}

function ReservedShell({
  id,
  className,
  position,
}: {
  id: string;
  className: string;
  position: AdPosition;
}) {
  return (
    <aside
      id={id}
      aria-label="Advertisement"
      aria-hidden
      className={"block " + className}
      style={{ minHeight: HEIGHT_VAR[position] }}
    />
  );
}
