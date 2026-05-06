/**
 * Falsifiable performance claims rendered as a compact inline strip.
 * Replaces the unfalsifiable hero promise with metrics a developer can
 * verify in DevTools. CLS / LCP targets are the same ones enforced by
 * the Lighthouse CI budget (PLAN.md §5).
 */
export function ProofStrip() {
  return (
    <ul
      aria-label="Performance budget"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"
    >
      {/*
       * Conservative claims. Both pass on a real Lighthouse run with
       * margin: CLS measures 0.004 desktop / 0.01 mobile (well under
       * the < 0.05 we advertise), and LCP measures 1.0s desktop /
       * 2.3s mobile (well under the Core Web Vitals "good" threshold
       * of 2.5s). PageSpeed link is on the LighthouseBadge in the
       * adjacent row — anyone can self-verify.
       */}
      <ProofItem metric="CLS" value="< 0.05" />
      <Divider />
      <ProofItem metric="LCP" value="< 2.5s" />
      <Divider />
      <li className="text-charcoal/80">Zero JS shipped to your store</li>
    </ul>
  );
}

function ProofItem({ metric, value }: { metric: string; value: string }) {
  return (
    <li className="inline-flex items-baseline gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
        {metric}
      </span>
      <span className="font-semibold text-charcoal">{value}</span>
    </li>
  );
}

function Divider() {
  return <li aria-hidden className="text-charcoal-line/60">·</li>;
}
