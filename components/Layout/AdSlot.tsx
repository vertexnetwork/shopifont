/**
 * Reserved ad slot. Renders a fixed-height placeholder so the layout
 * never reflows when Mediavine Grow injects the actual ad iframe
 * (PLAN.md §5 zero-CLS budget).
 *
 * Mediavine Grow auto-discovers slot containers via the `id` and
 * `data-mediavine` attributes — once Journey ads are approved, no
 * code change is needed here.
 *
 * The placeholder is intentionally muted ("Ad" pill) so it doesn't
 * look broken on first deploy when ads aren't serving yet.
 */
type AdPosition = "leaderboard" | "in-content" | "sidebar";

const HEIGHT_VAR: Record<AdPosition, string> = {
  leaderboard: "var(--ad-slot-leaderboard-h)",
  "in-content": "var(--ad-slot-incontent-h)",
  sidebar: "var(--ad-slot-sidebar-h)",
};

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
      className={
        "flex items-center justify-center text-xs uppercase tracking-wide text-muted bg-paper-dim border border-charcoal-line/20 rounded-md " +
        className
      }
      style={{
        minHeight: HEIGHT_VAR[position],
      }}
    >
      <span className="opacity-60">Advertisement</span>
    </aside>
  );
}
