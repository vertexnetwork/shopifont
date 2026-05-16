import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

/**
 * Upsell for the paid product: Shopify Typography Kits (Gumroad,
 * one-time, instant download).
 *
 * Renders NOTHING until `features.kit.enabled` is true — which only
 * happens once NEXT_PUBLIC_KIT_GUMROAD_URL is set in the environment
 * (i.e. after the Gumroad product is live). Every placement ships
 * dark and flips on with one env var, no code change.
 *
 * The internal sales page (/shopify-typography-kits) always exists;
 * it is what the prominent cards link to (it explains the product,
 * then sends to Gumroad). The "soft" variant links straight to the
 * sales page too. Only the sales page itself touches the raw Gumroad
 * URL — so a buyer never bounces to Gumroad without context.
 *
 * Variant copy is written to the friction at each placement — the
 * merchant only sees this at the moment they're confronting the
 * decide-it-then-hand-install work the kit removes:
 *
 *   - "post-generator" — directly under the generated code blocks.
 *     They have working code but still own the decision + the paste.
 *   - "pseo-steps" — after the enumerated install procedure. The
 *     friction is literally numbered in front of them.
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

const SALES_PATH = "/shopify-typography-kits";

function copyFor(variant: Variant, themeName?: string): Copy {
  switch (variant) {
    case "post-generator":
      return {
        headline: "Don't want to make the decision?",
        body: "You've got working code — but you still have to pick fonts that fit your brand, confirm they're licensed for ecommerce, and paste it in without breaking the theme. A Shopify Typography Kit is the decision already made: a proven pairing, the exact copy-paste code for your theme, the license cleared, and a visual specimen — instant download.",
      };
    case "pseo-steps":
      return {
        headline: "Skip straight to a finished result",
        body: `Every step above, already done for you${
          themeName ? ` on ${themeName}` : ""
        } — a proven font pairing, the install code pre-built, the licensing confirmed, and a specimen so you see it before you ship it. One-time, instant download, no account.`,
      };
    case "uninstall":
      return {
        headline: "Don't want to do this dance again?",
        body: "Picking a font, hand-installing it, second-guessing it, reversing it — that's the loop a Shopify Typography Kit ends. A proven pairing for your store type, the exact code for your theme, and a clean uninstall sheet in the box. Decide once.",
      };
    case "soft":
      return {
        headline: "",
        body: "Don't want to pick and hand-install yourself? Shopify Typography Kits are done-for-you pairings with copy-paste code for every theme.",
      };
  }
}

export function KitUpsell({ variant, themeName }: Props) {
  const { enabled, priceLabel } = siteConfig.features.kit;
  // Ship dark until the Gumroad product exists.
  if (!enabled) return null;

  const { headline, body } = copyFor(variant, themeName);

  // Soft variant: one subordinate inline line, not a card. Used on
  // research-stage guides where a prominent paid CTA is premature.
  if (variant === "soft") {
    return (
      <p className="text-sm text-muted">
        {body}{" "}
        <Link
          href={SALES_PATH}
          className="text-electric hover:underline whitespace-nowrap"
        >
          See the kits →
        </Link>
      </p>
    );
  }

  return (
    <section
      aria-label="Shopify Typography Kits"
      className="flex flex-col gap-3 rounded-lg border border-electric/30 bg-gradient-to-br from-electric/[0.06] via-electric/[0.02] to-transparent p-5 sm:p-6 shadow-card"
    >
      <div className="flex flex-col gap-2">
        <p className="inline-flex items-center gap-1.5 self-start rounded-full bg-electric/15 text-electric px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold">
          <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-electric" />
          Typography Kit
        </p>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          {headline}
        </h2>
        <p className="text-sm sm:text-base text-charcoal/80 max-w-2xl leading-relaxed">
          {body}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={SALES_PATH}
          className="group inline-flex items-center justify-center min-h-[2.75rem] px-5 rounded-md bg-electric text-paper font-semibold text-sm shadow-cta hover:bg-electric-hover whitespace-nowrap"
        >
          See the Typography Kits
          <span
            aria-hidden
            className="ml-1.5 transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
        <span className="text-xs text-muted">{priceLabel}</span>
      </div>
    </section>
  );
}
