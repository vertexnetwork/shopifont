import scores from "@/content/lighthouse.json";

/**
 * Renders Lighthouse scores from `content/lighthouse.json`. This is
 * NOT yet wired to CI — the JSON is hand-maintained from the latest
 * verified Lighthouse run. To wire up: have CI run Lighthouse, parse
 * the result JSON, write it back to `content/lighthouse.json`, and
 * commit on `main`. Until then, update the file when scores change.
 *
 * Hand-typed claims live in ProofStrip; this component is the
 * verifiable-on-disk counterpart so the "Lighthouse 100/100/100/100"
 * marketing line has a file behind it.
 */
export function LighthouseBadge() {
  return (
    <a
      href="https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fshopifont.app"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Lighthouse scores — opens PageSpeed Insights"
      className="inline-flex items-center gap-2 text-[11px] hover:text-electric transition-colors"
    >
      <span className="font-mono uppercase tracking-wide text-muted">
        Lighthouse
      </span>
      <span className="inline-flex items-center gap-1.5 text-charcoal">
        <ScoreDot label="P" value={scores.performance} />
        <ScoreDot label="A" value={scores.accessibility} />
        <ScoreDot label="B" value={scores.bestPractices} />
        <ScoreDot label="S" value={scores.seo} />
      </span>
    </a>
  );
}

function ScoreDot({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 95
      ? "border-electric text-electric"
      : value >= 85
        ? "border-amber text-amber-deep"
        : "border-error text-error";
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-7 rounded-md border ${tone}`}
      title={`Lighthouse ${label}: ${value}/100`}
    >
      <span className="font-mono font-semibold">{value}</span>
    </span>
  );
}
