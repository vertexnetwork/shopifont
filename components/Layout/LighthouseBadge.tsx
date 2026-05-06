/**
 * Verification link to PageSpeed Insights. Deliberately renders no
 * numeric score — the prior version baked claimed scores into a
 * committed JSON, which drifted from reality and read as overstated
 * trust signal once a real Lighthouse run was compared. Linking out
 * for self-verification is the honest version of the same idea.
 */
export function LighthouseBadge() {
  return (
    <a
      href="https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fshopifont.app"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-electric transition-colors"
    >
      <span className="font-mono uppercase tracking-wide">
        Verify on PageSpeed
      </span>
      <span aria-hidden>↗</span>
    </a>
  );
}
