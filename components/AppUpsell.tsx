import { siteConfig } from "@/lib/site-config";

/**
 * Upsell for the paid Shopify App Store app ($4.99/mo, 7-day trial).
 *
 * Renders NOTHING until `features.shopifyApp.enabled` is true — which
 * only happens once NEXT_PUBLIC_SHOPIFY_APP_LISTING_URL is set in the
 * environment (i.e. after the app clears Shopify review and has a
 * public listing). So every placement below ships dark and flips on
 * with one env var, no code change.
 *
 * Variant copy is deliberately written to the friction at each
 * placement — the merchant only sees this at the moment they're
 * confronting the manual work the app removes, never before it:
 *
 *   - "post-generator" — directly under the generated code blocks.
 *     The single highest-friction moment: they're staring at three
 *     blocks they have to hand-paste into theme files.
 *   - "pseo-steps" — after the enumerated "How to use this on
 *     {theme}" procedure. The friction is literally numbered in
 *     front of them.
 *   - "uninstall" — on the manual-reversal guide. Highest pain /
 *     regret intent on the site.
 *   - "soft" — a single subordinate line for research-stage guides
 *     where install intent hasn't formed yet; a hard card there
 *     would be premature and read as pushy.
 */

type Variant = "post-generator" | "pseo-steps" | "uninstall" | "soft";

type Props = {
  variant: Variant;
  /** Theme display name — only used by the "pseo-steps" variant. */
  themeName?: string;
};

type Copy = { headline: string; body: string };

function copyFor(variant: Variant, themeName?: string): Copy {
  switch (variant) {
    case "post-generator":
      return {
        headline: "Skip the copy-paste entirely",
        body: "Don't want to hand-edit base.css, settings_schema.json, and theme.liquid? The Shopifont app writes all of this directly into your theme — pick the font, click once, done.",
      };
    case "pseo-steps":
      return {
        headline: "Don't want to edit theme code?",
        body: `The Shopifont app does every step above for you — uploads the font files, writes the CSS, and links it into your${
          themeName ? ` ${themeName}` : ""
        } theme. No code editor, no risk of a misplaced brace.`,
      };
    case "uninstall":
      return {
        headline: "Tired of hand-editing theme files?",
        body: "Installing and reversing fonts by hand is fiddly and easy to get wrong. The Shopifont app installs cleanly and removes cleanly — no theme.liquid surgery, no leftover CSS.",
      };
    case "soft":
      return {
        headline: "",
        body: "Prefer not to touch theme code at all? The Shopifont app installs any of these into your theme for you.",
      };
  }
}

export function AppUpsell({ variant, themeName }: Props) {
  const { enabled, listingUrl, priceLabel } = siteConfig.features.shopifyApp;
  if (!enabled || !listingUrl) return null;

  const { headline, body } = copyFor(variant, themeName);

  // Soft variant: one subordinate inline line, not a card. Used on
  // research-stage guides where a prominent paid CTA is premature.
  if (variant === "soft") {
    return (
      <p className="text-sm text-muted">
        {body}{" "}
        <a
          href={listingUrl}
          target="_blank"
          rel="noopener"
          className="text-electric hover:underline whitespace-nowrap"
        >
          Get the Shopify app →
        </a>
      </p>
    );
  }

  return (
    <section
      aria-label="Shopifont Shopify app"
      className="flex flex-col gap-3 rounded-lg border border-electric/30 bg-gradient-to-br from-electric/[0.06] via-electric/[0.02] to-transparent p-5 sm:p-6 shadow-card"
    >
      <div className="flex flex-col gap-2">
        <p className="inline-flex items-center gap-1.5 self-start rounded-full bg-electric/15 text-electric px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold">
          <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-electric" />
          Shopify app
        </p>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          {headline}
        </h2>
        <p className="text-sm sm:text-base text-charcoal/80 max-w-2xl leading-relaxed">
          {body}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={listingUrl}
          target="_blank"
          rel="noopener"
          className="group inline-flex items-center justify-center min-h-[2.75rem] px-5 rounded-md bg-electric text-paper font-semibold text-sm shadow-cta hover:bg-electric-hover whitespace-nowrap"
        >
          Install the Shopify app
          <span
            aria-hidden
            className="ml-1.5 transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </a>
        <span className="text-xs text-muted">{priceLabel}</span>
      </div>
    </section>
  );
}
