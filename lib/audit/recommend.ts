/**
 * The Shopify Typography Audit — pure, deterministic recommendation
 * engine behind the free diagnostic tool.
 *
 * The audit is the top-of-funnel re-cut: instead of answering "what are
 * good fonts" generically (which the free guides already do, completely),
 * it takes a few answers about the visitor's OWN store and reveals the
 * specific reason it reads as "just another Shopify store" — then
 * prescribes the exact kit that fixes it. Same move etsymargin made with
 * its single-line-item audit.
 *
 * Everything here is a pure function of the answers + the existing repo
 * data (`content/themes.ts`, `content/kits.ts`). No I/O, no randomness,
 * no backend — so it is unit-testable and ships in a static export.
 *
 * HONESTY GUARD: only Dawn's default font is verified
 * (`ThemeMeta.defaultsVerified`). For every other theme we say "your
 * theme's stock font" rather than asserting a specific name we haven't
 * confirmed against a live install — mirroring the pSEO copy rule.
 */

import { kitBySlug, type Kit } from "@/content/kits";
import { THEME_BY_SLUG, THEMES, type ThemeMeta } from "@/content/themes";

// --- Answer shape ---------------------------------------------------

/** Store vertical — maps 1:1 onto a kit's `vertical`. */
export type StoreType =
  | "premium-fashion"
  | "luxury-beauty"
  | "dtc-lifestyle"
  | "editorial-artisan"
  | "tech-electronics"
  | "minimal-unsure";

/** Whether the merchant has moved off the theme's stock font. */
export type FontStatus = "default" | "custom" | "unsure";

/** The tie-breaker axis: brand personality vs. raw speed/simplicity. */
export type Priority = "personality" | "balanced" | "speed";

export type AuditAnswers = {
  themeSlug: string;
  fontStatus: FontStatus;
  storeType: StoreType;
  priority: Priority;
};

// --- Question option metadata (consumed by the UI) ------------------

export type Option<T extends string> = {
  value: T;
  label: string;
  /** Short supporting line shown under the label. */
  hint: string;
};

/** Theme picker options, derived from the single source of truth. */
export const THEME_OPTIONS: ReadonlyArray<Option<string>> = THEMES.map((t) => ({
  value: t.slug,
  label: t.name,
  hint: t.category,
}));

export const FONT_STATUS_OPTIONS: ReadonlyArray<Option<FontStatus>> = [
  {
    value: "default",
    label: "Still the theme default",
    hint: "I never changed the fonts",
  },
  {
    value: "custom",
    label: "I picked my own font",
    hint: "I've already swapped it",
  },
  {
    value: "unsure",
    label: "Not sure",
    hint: "I don't know what's installed",
  },
];

export const STORE_TYPE_OPTIONS: ReadonlyArray<Option<StoreType>> = [
  {
    value: "premium-fashion",
    label: "Premium fashion / curated goods",
    hint: "Apparel, home, food — premium positioning",
  },
  {
    value: "luxury-beauty",
    label: "Beauty, jewelry, or luxury",
    hint: "Skincare-as-luxury, fine jewelry, high-end apparel",
  },
  {
    value: "dtc-lifestyle",
    label: "Skincare, supplements, DTC lifestyle",
    hint: "Friendly, consumer-facing brands",
  },
  {
    value: "editorial-artisan",
    label: "Editorial / artisan / long-copy",
    hint: "Makers, cookbooks, story-rich product pages",
  },
  {
    value: "tech-electronics",
    label: "Electronics / tech",
    hint: "Consumer electronics, smart home, software-adjacent",
  },
  {
    value: "minimal-unsure",
    label: "Minimal — or still figuring it out",
    hint: "Performance-first, or not sure yet",
  },
];

export const PRIORITY_OPTIONS: ReadonlyArray<Option<Priority>> = [
  {
    value: "personality",
    label: "Brand personality",
    hint: "I want the type to carry the brand",
  },
  {
    value: "balanced",
    label: "A balance",
    hint: "Some character, but keep it safe",
  },
  {
    value: "speed",
    label: "Fastest & simplest",
    hint: "Lightest possible, hardest to mess up",
  },
];

// --- Store-type vocabulary ------------------------------------------

const STORE_TYPE_TO_KIT: Record<StoreType, string> = {
  "premium-fashion": "premium-editorial",
  "luxury-beauty": "luxury-classic",
  "dtc-lifestyle": "dtc-friendly",
  "editorial-artisan": "editorial-warm",
  "tech-electronics": "modern-tech",
  "minimal-unsure": "minimal-fast",
};

/** Short label for prose ("a {label} store"). */
const STORE_TYPE_LABEL: Record<StoreType, string> = {
  "premium-fashion": "premium fashion or curated-goods",
  "luxury-beauty": "beauty, jewelry, or luxury",
  "dtc-lifestyle": "skincare, supplements, or DTC lifestyle",
  "editorial-artisan": "editorial, artisan, or long-copy",
  "tech-electronics": "electronics or tech",
  "minimal-unsure": "minimal",
};

/** The brand job the type should be doing for each vertical. */
const STORE_TYPE_DESIRE: Record<StoreType, string> = {
  "premium-fashion":
    "real character at headline scale — type that signals “premium” before a word is read",
  "luxury-beauty":
    "an upmarket, established feel that reads as luxury instantly",
  "dtc-lifestyle":
    "an approachable, friendly, consumer-facing voice",
  "editorial-artisan":
    "editorial gravitas and comfortable long-form reading",
  "tech-electronics":
    "a precise, intentional, modern-tech feel",
  "minimal-unsure":
    "a clean, fast, no-nonsense baseline that's impossible to get wrong",
};

export function storeTypeLabel(storeType: StoreType): string {
  return STORE_TYPE_LABEL[storeType];
}

// --- Recommendation -------------------------------------------------

/**
 * Pick the kit. Base mapping is store-type → vertical; the priority axis
 * is a deliberate, explainable tie-breaker:
 *   - "speed" always wins to Minimal & Fast (the lightest, single-family
 *     kit) — if they asked for fastest/simplest, that's the honest answer.
 *   - "personality" on an otherwise-undecided store ("minimal-unsure")
 *     upgrades to Premium Editorial (Fraunces) — the most characterful
 *     pick — instead of defaulting them to neutral Inter.
 * Every branch returns a kit that exists in KITS (asserted in tests).
 */
export function recommendKit(answers: AuditAnswers): Kit {
  if (answers.priority === "speed") {
    return kitBySlug("minimal-fast")!;
  }
  if (answers.priority === "personality" && answers.storeType === "minimal-unsure") {
    return kitBySlug("premium-editorial")!;
  }
  return kitBySlug(STORE_TYPE_TO_KIT[answers.storeType])!;
}

// --- Findings -------------------------------------------------------

export type Finding = {
  kind: "problem" | "good";
  title: string;
  detail: string;
};

/** True when the merchant is (or might be) on the stock theme font. */
function onStockFont(status: FontStatus): boolean {
  return status === "default" || status === "unsure";
}

/**
 * Name the stock font only when the theme's default is verified; else
 * use the generic phrasing the pSEO copy uses. Never assert an
 * unconfirmed font name.
 */
function stockFontPhrase(theme: ThemeMeta): string {
  return theme.defaultsVerified
    ? `${theme.name}'s stock font, ${theme.defaultHeadingFont}`
    : `${theme.name}'s stock font`;
}

/**
 * The personalized scorecard rows. Order: the sharpest problem first,
 * then the reassuring "good" row last (it lowers the risk of acting).
 */
export function buildFindings(answers: AuditAnswers): Finding[] {
  const theme = THEME_BY_SLUG[answers.themeSlug];
  const findings: Finding[] = [];

  if (!theme) {
    // Defensive: unknown theme slug shouldn't happen via the UI, but the
    // function stays total rather than throwing.
    return [
      {
        kind: "problem",
        title: "We couldn't read your theme",
        detail:
          "Pick your theme above and we'll show exactly what its stock typography is doing to your store.",
      },
    ];
  }

  if (onStockFont(answers.fontStatus)) {
    findings.push({
      kind: "problem",
      title: "You're on the stock font",
      detail: `Your store is running ${stockFontPhrase(
        theme,
      )} — the same default the vast majority of ${theme.name} stores never change. It's the single biggest tell that a store reads as “just another Shopify store” instead of a brand.`,
    });
    findings.push({
      kind: "problem",
      title: "No hierarchy",
      detail:
        "The stock setup uses one neutral face for headings and body at almost the same weight, so nothing on the page signals “this matters.” Shoppers skim — and there's nothing for the eye to catch.",
    });
  } else {
    findings.push({
      kind: "problem",
      title: "The real risk is the pairing",
      detail:
        "You've already moved off the default — good. The next trap is contrast: if your heading and body are two faces from the same category (two geometric sans), they look identical at a glance and you've added file weight for zero hierarchy.",
    });
  }

  findings.push({
    kind: "problem",
    title: "Brand fit",
    detail: `A ${STORE_TYPE_LABEL[answers.storeType]} store wants ${
      STORE_TYPE_DESIRE[answers.storeType]
    }. ${
      onStockFont(answers.fontStatus)
        ? "A neutral stock sans does none of that brand work."
        : "Make sure the face you picked is actually doing that job, not just a different default."
    }`,
  });

  findings.push({
    kind: "good",
    title: "The fix is low-risk",
    detail: `Good news: this is a CSS-only change you paste into ${theme.injectionPoint.replace(
      /`/g,
      "",
    )} — about five minutes, zero JavaScript, and fully reversible with a clean uninstall. Nothing about trying it is permanent.`,
  });

  return findings;
}

// --- Score ----------------------------------------------------------

export type ScoreResult = {
  score: number;
  max: number;
  /** Headline verdict — a gut-check framing, not a live scan. */
  label: string;
};

/**
 * An illustrative "brand-distinctiveness" read derived purely from the
 * answers. It is explicitly a framing device (the UI says so) — we don't
 * scan the live store, so we never claim a precise measurement.
 */
export function scoreStore(answers: AuditAnswers): ScoreResult {
  if (onStockFont(answers.fontStatus)) {
    return { score: 2, max: 5, label: "Reads as stock Shopify" };
  }
  return { score: 3, max: 5, label: "Halfway there" };
}

// --- Convenience aggregate ------------------------------------------

export type AuditResult = {
  answers: AuditAnswers;
  theme: ThemeMeta | undefined;
  kit: Kit;
  findings: Finding[];
  score: ScoreResult;
};

export function buildAuditResult(answers: AuditAnswers): AuditResult {
  return {
    answers,
    theme: THEME_BY_SLUG[answers.themeSlug],
    kit: recommendKit(answers),
    findings: buildFindings(answers),
    score: scoreStore(answers),
  };
}

/** All store-type values — handy for exhaustive tests/iteration. */
export const ALL_STORE_TYPES: ReadonlyArray<StoreType> =
  STORE_TYPE_OPTIONS.map((o) => o.value);

/** Sanity: every store-type maps to a real kit slug. Used by tests. */
export const STORE_TYPE_KIT_MAP = STORE_TYPE_TO_KIT;
