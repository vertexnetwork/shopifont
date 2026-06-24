/**
 * Hero visual for the audit-led homepage. Replaces the old `@font-face`
 * code block, which read as a developer tool — the wrong first impression
 * for the design-minded store owner who buys a typography kit. Instead it
 * shows the PROBLEM the audit diagnoses: the same storefront copy rendered
 * once in a flat stock theme font and once in an on-brand pairing, so the
 * visitor *sees* "it's the fonts" before reading a word of pitch.
 *
 * Deliberately uses only websafe/system fonts (a plain system sans for the
 * "stock" panel, a serif heading + system-sans body for the "on-brand"
 * panel — mirroring how the real kits pair a display serif with a screen
 * sans). Zero webfont requests means no extra network cost and no layout
 * shift, which keeps the homepage's performance story intact.
 *
 * Pure presentational server component — no client JS.
 */

const STOCK_SANS = "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif";
const BRAND_SERIF = "Georgia, 'Iowan Old Style', 'Times New Roman', serif";

// A believable small Shopify brand — same words in both panels so the only
// variable on screen is the type.
const STORE_NAME = "Wild Bloom Botanicals";
const STORE_LINE = "Small-batch skincare, made in Vermont";

function Dot({ className }: { className: string }) {
  return <span aria-hidden className={`inline-block w-1.5 h-1.5 rounded-full ${className}`} />;
}

export function HeroSpecimen() {
  return (
    <figure
      aria-label="The same storefront in a stock theme font versus an on-brand pairing"
      className="not-prose flex flex-col overflow-hidden rounded-lg border border-charcoal-line/30 bg-paper shadow-card"
    >
      {/* Stock — flat, generic, muted. */}
      <div className="flex flex-col gap-1.5 p-4 sm:p-5">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
          <Dot className="bg-muted/60" />
          Stock theme font
        </span>
        <p
          className="text-xl sm:text-2xl text-muted"
          style={{ fontFamily: STOCK_SANS, fontWeight: 600 }}
        >
          {STORE_NAME}
        </p>
        <p className="text-sm text-muted/90" style={{ fontFamily: STOCK_SANS }}>
          {STORE_LINE}
        </p>
      </div>

      <div aria-hidden className="h-px bg-charcoal-line/20" />

      {/* On-brand — a serif display head + clean body, confident and dark. */}
      <div className="flex flex-col gap-1.5 bg-gradient-to-br from-electric/[0.06] via-electric/[0.02] to-transparent p-4 sm:p-5">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-electric">
          <Dot className="bg-electric" />
          On-brand pairing
        </span>
        <p
          className="text-2xl sm:text-3xl text-charcoal tracking-tight"
          style={{ fontFamily: BRAND_SERIF, fontWeight: 700 }}
        >
          {STORE_NAME}
        </p>
        <p className="text-sm text-charcoal/80" style={{ fontFamily: STOCK_SANS }}>
          {STORE_LINE}
        </p>
      </div>

      <figcaption className="border-t border-charcoal-line/20 bg-paper-dim/60 px-4 py-2 text-[11px] text-muted sm:px-5">
        Same store, same words — the type is doing all the brand work.
      </figcaption>
    </figure>
  );
}
