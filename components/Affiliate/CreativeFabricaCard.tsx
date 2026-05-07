import { CREATIVE_FABRICA_REF } from "@/lib/site";

/**
 * Below-the-generator affiliate card. Pitched at the user who arrived
 * needing a font (not just the code that installs one) — they're the
 * audience most likely to leave the site to go font-shopping, and
 * Creative Fabrica is the cleanest "all-in-one with commercial
 * license included" option to send them to.
 *
 * Conversion psychology applied:
 *
 *  - Headline anchors on the *friction the user actually feels at
 *    this moment* ("Don't have a font yet?") rather than abstract
 *    benefits.
 *  - Body bridges the affiliate back to the site's value ("ready to
 *    drop into the @font-face block this site generates") so the
 *    placement reads as helpful, not interruptive.
 *  - Specificity beats puffery: "30,000+ web fonts," "under $20,"
 *    "commercial license included" are concrete and falsifiable.
 *  - The "Affiliate" badge is rendered ABOVE the headline so the
 *    relationship is disclosed before the pitch lands — clearer than
 *    a buried footer note and consistent with Mediavine + FTC
 *    expectations.
 */
export function CreativeFabricaCard() {
  return (
    <section
      aria-labelledby="cf-card-heading"
      className="rounded-lg border border-electric/30 bg-gradient-to-br from-electric/[0.06] via-electric/[0.02] to-transparent p-5 sm:p-6 shadow-card"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex flex-col gap-2">
          <p className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-soft text-amber-deep px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-amber" />
            Affiliate · No cost to you
          </p>
          <h2
            id="cf-card-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight"
          >
            Don&apos;t have a font yet?
          </h2>
          <p className="text-sm sm:text-base text-charcoal/80 max-w-2xl">
            Creative Fabrica has 30,000+ web fonts with commercial licenses
            included — ready to drop into the{" "}
            <code className="font-mono text-sm">@font-face</code> block this
            site generates. Most are under $20, and the all-access
            subscription unlocks the full library.
          </p>
        </div>
        <a
          href={CREATIVE_FABRICA_REF}
          target="_blank"
          rel="sponsored noopener"
          className="group inline-flex items-center justify-center self-start sm:self-center min-h-[2.75rem] px-5 rounded-md bg-electric text-paper font-semibold text-sm shadow-cta hover:bg-electric-hover whitespace-nowrap"
        >
          Browse Creative Fabrica
          <span
            aria-hidden
            className="ml-1.5 transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </a>
      </div>
    </section>
  );
}
