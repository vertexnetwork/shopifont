import { PRINTIFY_REF } from "@/lib/site";

/**
 * Homepage / recommendations-page affiliate card for Printify.
 * Mirrors CreativeFabricaCard's conversion psychology — "Affiliate"
 * pill above the headline, headline anchors on the merchant's actual
 * friction, body bridges back to Shopify integration, electric-blue
 * CTA — but sells the print-on-demand vertical instead of fonts.
 *
 * The two cards stack vertically on the homepage so a merchant who
 * arrived for fonts also sees the merch-fulfillment option without
 * needing a second click.
 */
export function PrintifyCard() {
  return (
    <section
      aria-labelledby="printify-card-heading"
      className="rounded-lg border border-electric/30 bg-gradient-to-br from-electric/[0.06] via-electric/[0.02] to-transparent p-5 sm:p-6 shadow-card"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex flex-col gap-2">
          <p className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-soft text-amber-deep px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-amber" />
            Affiliate · No cost to you
          </p>
          <h2
            id="printify-card-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight"
          >
            Custom font + custom merch?
          </h2>
          <p className="text-sm sm:text-base text-charcoal/80 max-w-2xl">
            Printify plugs into Shopify in one click. 900+ products, no
            inventory risk, fulfilled and shipped automatically when an order
            lands. Free to start — you only pay when you sell.
          </p>
        </div>
        <a
          href={PRINTIFY_REF}
          target="_blank"
          rel="sponsored noopener"
          className="group inline-flex items-center justify-center self-start sm:self-center min-h-[2.75rem] px-5 rounded-md bg-electric text-paper font-semibold text-sm shadow-cta hover:bg-electric-hover whitespace-nowrap"
        >
          Try Printify
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
