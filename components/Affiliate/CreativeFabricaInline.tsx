import { CREATIVE_FABRICA_REF } from "@/lib/site";

/**
 * One-line affiliate mention for dense surfaces (pSEO use-case
 * sections, FAQ adjacencies). Less prominent than CreativeFabricaCard
 * — used where a full card would interrupt the reading flow but a
 * relevant pointer is still useful.
 *
 * The disclosure label is rendered inline next to the link rather
 * than relying solely on the page-level disclosure on /about, so
 * users who land deep on a pSEO page from search still see the
 * "Affiliate" tag near the click target.
 */
export function CreativeFabricaInline({
  prefix = "Don't have a font yet?",
}: {
  prefix?: string;
}) {
  return (
    <p className="text-sm text-charcoal/80">
      <span className="text-muted">{prefix}</span>{" "}
      <a
        href={CREATIVE_FABRICA_REF}
        target="_blank"
        rel="sponsored noopener"
        className="text-electric font-medium hover:underline"
      >
        Creative Fabrica
      </a>{" "}
      <span className="text-muted">
        has 30,000+ web fonts with commercial licenses included — drop one
        into the <code className="font-mono text-xs">@font-face</code> block
        above and you&apos;re live.{" "}
        <span className="text-charcoal-line/70">(affiliate)</span>
      </span>
    </p>
  );
}
