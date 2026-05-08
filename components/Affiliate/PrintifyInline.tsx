import { PRINTIFY_REF } from "@/lib/site";

/**
 * One-line Printify affiliate mention for the 13 generator-intent pSEO
 * pages. Sits below the existing Creative Fabrica inline so the two
 * affiliates read as a "font + merch" pair on the highest-commercial-
 * intent surface — the merchant who just generated install code is
 * the most likely to also be sourcing print-on-demand inventory.
 *
 * Tutorial / fix / comparison pSEO pages do NOT render this — the
 * gating happens in app/(site)/[slug]/page.tsx via `entry.intent`.
 *
 * `rel="sponsored noopener"` per the FTC + Google enforcement note on
 * PRINTIFY_REF in lib/site.ts.
 */
export function PrintifyInline({
  prefix = "Selling physical products too?",
}: {
  prefix?: string;
}) {
  return (
    <p className="text-sm text-charcoal/80">
      <span className="text-muted">{prefix}</span>{" "}
      <a
        href={PRINTIFY_REF}
        target="_blank"
        rel="sponsored noopener"
        className="text-electric font-medium hover:underline"
      >
        Printify
      </a>{" "}
      <span className="text-muted">
        plugs into Shopify in one click — 900+ products, no inventory risk,
        fulfilled and shipped automatically when an order lands.{" "}
        <span className="text-charcoal-line/70">(affiliate)</span>
      </span>
    </p>
  );
}
