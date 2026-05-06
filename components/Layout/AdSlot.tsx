/**
 * Reserved ad slot. Renders a fixed-height placeholder so the layout
 * never reflows when Mediavine Grow injects the actual ad iframe
 * (PLAN.md §5 zero-CLS budget).
 *
 * Mediavine Grow auto-discovers slot containers via the `id` and
 * `data-mediavine` attributes — once Journey ads are approved, no
 * code change is needed here.
 *
 * Pre-launch (Mediavine site ID not yet wired) the slot is reserved
 * but visually hidden so first-time visitors don't see a row of
 * "Advertisement" placeholders that look like a broken / adblocked
 * page. CLS budget stays at zero either way because we keep the
 * `min-height` reservation on the outer aside.
 */
type AdPosition = "leaderboard" | "in-content" | "sidebar";

const HEIGHT_VAR: Record<AdPosition, string> = {
  leaderboard: "var(--ad-slot-leaderboard-h)",
  "in-content": "var(--ad-slot-incontent-h)",
  sidebar: "var(--ad-slot-sidebar-h)",
};

const adsActive = Boolean(process.env.NEXT_PUBLIC_MEDIAVINE_SITE_ID?.trim());

export function AdSlot({
  id,
  position,
  className = "",
}: {
  id: string;
  position: AdPosition;
  className?: string;
}) {
  return (
    <aside
      id={id}
      data-mediavine={position}
      aria-label="Advertisement"
      aria-hidden={adsActive ? undefined : true}
      className={
        (adsActive
          ? "flex items-center justify-center text-xs uppercase tracking-wide text-muted bg-paper-dim border border-charcoal-line/20 rounded-md "
          : "block ") + className
      }
      style={{
        minHeight: HEIGHT_VAR[position],
      }}
    >
      {adsActive ? <span className="opacity-60">Advertisement</span> : null}
    </aside>
  );
}
