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
      <ProofItem metric="CLS" value="0.00" />
      <Divider />
      <ProofItem metric="LCP" value="< 2s" />
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
