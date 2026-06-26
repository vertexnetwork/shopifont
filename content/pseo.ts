/**
 * pSEO content map. Single source of truth for the dynamic [slug] route,
 * the sitemap, the llms.txt generator, and the internal-link footer.
 *
 * Entries are generated from `themes.ts` metadata via per-intent
 * builders so:
 *
 *   1. Each page's intro, useCaseSteps, and FAQs are theme-specific
 *      (no boilerplate). The build asserts that no FAQ Q-string
 *      appears on more than 3 pages (PLAN.md §3 KGR guardrail).
 *   2. Adding a new theme to `themes.ts` automatically expands the
 *      pSEO surface — no hand-rolled entries to maintain.
 *
 * `useCaseSteps` is an ordered list rendered as `<ol>` on the page,
 * which scans far better than the prior multi-sentence paragraph for
 * users skimming installation steps on mobile.
 *
 * Page count target: 50–80 (PLAN.md §3 says ~80 at launch). Today this
 * file generates 71 entries:
 *   13 generator + 15 format-specific + 13 Liquid tutorial +
 *   13 CSS-variable tutorial + 13 layout-shift fix + 4 comparison.
 */

import { THEMES, TIER_1_THEMES, type ThemeMeta } from "./themes";

export type PseoIntent = "generator" | "tutorial" | "comparison" | "fix";

export type PseoEntry = {
  /** URL slug, no leading slash. Becomes the [slug] route param. */
  slug: string;
  /** Theme name (display form) — Dawn, Sense, etc. "multi" for comparisons. */
  theme: string;
  intent: PseoIntent;
  h1: string;
  /** <= 60 chars per PLAN.md §3. Asserted at build time. */
  metaTitle: string;
  /** <= 155 chars per PLAN.md §3. Asserted at build time. */
  metaDescription: string;
  /**
   * The pGEO "one-line direct answer" rendered above the tool. Inverted
   * pyramid for AI extractors per PLAN.md §4.
   */
  oneLineAnswer: string;
  /** 2-3 sentence introduction. */
  intro: string;
  /**
   * Ordered installation/usage steps. Rendered as `<ol>` on the page.
   * Each entry is a single sentence or short paragraph; the test
   * suite asserts the joined text contributes to the ≥250 word
   * unique-copy requirement.
   */
  useCaseSteps: ReadonlyArray<string>;
  faqs: ReadonlyArray<{ q: string; a: string }>;
  relatedSlugs: ReadonlyArray<string>;
  breadcrumbLabel: string;
  /**
   * Vertical-specific typography guidance rendered as a standalone
   * paragraph. Genuine editorial value that differs per theme, so each
   * page carries unique main content beyond the templated noun-swap
   * (audit Dimension #1/#2).
   */
  verticalAngle: string;
  /**
   * Per-page sitemap weighting derived from a real signal (page intent +
   * theme popularity) instead of one uniform value across the whole set
   * (audit Dimension #6/#7).
   */
  sitemapPriority: number;
  sitemapChangeFrequency: SitemapChangeFrequency;
};

export type SitemapChangeFrequency = "yearly" | "monthly" | "weekly";

/* ------------------------------------------------------------------ */
/* Helpers — guarded references to per-theme defaults                  */
/* ------------------------------------------------------------------ */

/**
 * Cite the theme's specific default heading face only when verified;
 * otherwise return a generic phrasing. Keeps every pSEO page honest
 * about what we've actually confirmed against a live install.
 */
function defaultHeading(theme: ThemeMeta): string {
  return theme.defaultsVerified
    ? theme.defaultHeadingFont
    : "the theme's default heading face";
}

function defaultBody(theme: ThemeMeta): string {
  return theme.defaultsVerified
    ? theme.defaultBodyFont
    : "the theme's default body face";
}

function defaultFallbackName(theme: ThemeMeta): string {
  return theme.defaultsVerified
    ? `${theme.defaultHeadingFont} fallback`
    : "system fallback";
}

/**
 * A parenthetical "such as ..." example of the theme's heading selectors,
 * emitted ONLY when the selectors have been verified against a live
 * install. For unverified themes it returns an empty string, so the
 * surrounding copy reads "the theme's heading selectors" without citing
 * specific class names that might be wrong. Generalization over
 * fabrication — see audit playbook Part 6 and Dimension #5.
 */
function selectorEg(theme: ThemeMeta): string {
  return theme.selectorsVerified ? ` (such as ${theme.notableSelector})` : "";
}

/**
 * Split prose useCase into ordered steps on sentence boundaries.
 * Preserves abbreviation-safe behavior because we only break on
 * `.!?` followed by whitespace + capital letter.
 */
function splitSteps(prose: string): string[] {
  return prose
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Builders                                                            */
/* ------------------------------------------------------------------ */

function buildGeneratorEntry(theme: ThemeMeta): PseoEntry {
  const slug = `shopify-${theme.slug}-custom-font-generator`;
  const h1 = `Free Shopify ${theme.name} Custom Font Generator`;
  const oneLineAnswer = `Paste any font name above to generate the exact @font-face CSS, settings_schema.json snippet, and CSS variable overrides Shopify ${theme.name} needs to render your custom font without layout shifts.`;
  const intro = `${theme.name} is ${theme.positioning} Out of the box, ${theme.name} ships with ${defaultHeading(theme)} for headings and ${defaultBody(theme)} for body — typography that's deliberately ${theme.typographyCharacter} If you need a brand-specific face on a ${theme.category} ${theme.name} store, this generator builds the three code blocks Shopify expects in seconds.`;
  const useCase = `Upload your custom font files to your ${theme.name} theme's \`assets/\` folder. Paste the generated @font-face block into ${theme.injectionPoint} so Shopify's Liquid \`asset_url\` filter resolves correctly. Add the settings_schema.json snippet to expose a Theme Editor toggle for non-technical merchants. Finally, the CSS variable overrides retarget ${theme.name}'s heading selectors${selectorEg(theme)} and every other element that reads from \`--font-heading-family\` or \`--font-body-family\` — meaning your custom face propagates site-wide without touching ${theme.name}'s core templates.`;

  return {
    slug,
    theme: theme.name,
    intent: "generator",
    h1,
    metaTitle: clampTitle(`${theme.name} Custom Font Generator | Shopify`),
    metaDescription: clampDescription(
      `Generate copy-paste @font-face CSS, settings_schema.json, and CSS variable overrides for the Shopify ${theme.name} theme. Free, no signup, zero CLS.`,
    ),
    oneLineAnswer,
    intro,
    useCaseSteps: splitSteps(useCase),
    faqs: [
      {
        q: `How do I add a custom font to the Shopify ${theme.name} theme?`,
        a: `Upload your font files to ${theme.name}'s \`assets/\` folder, paste the @font-face block this generator outputs into ${theme.injectionPoint}, and override \`--font-heading-family\` and \`--font-body-family\` to point at your font name. ${theme.name} reads those tokens for every typography rule, so the swap propagates instantly.`,
      },
      {
        q: `What font formats does ${theme.name} support for custom uploads?`,
        a: `${theme.name} supports WOFF2, WOFF, TTF, OTF, and EOT — anything the browser can decode. WOFF2 is the only format you strictly need on a modern store; the others are legacy fallbacks. The generator orders them WOFF2 → WOFF → TTF so each browser stops at the smallest file it understands.`,
      },
      {
        q: `Will a custom font cause layout shift on ${theme.name}?`,
        a: `Not if you set \`font-display: swap\` (the generator does this automatically) and reserve typography metrics by overriding ${theme.name}'s CSS variables instead of swapping fonts via JavaScript. ${theme.name}'s heading selectors${selectorEg(theme)} read from \`--font-heading-family\`, so the override happens before paint and the metric box doesn't change after load.`,
      },
      {
        q: `Do I need to edit Liquid to use a custom font on ${theme.name}?`,
        a: `Only once. The @font-face block goes into ${theme.injectionPoint}, which is CSS, not Liquid. The optional settings_schema.json block is JSON. The only Liquid in play is Shopify's \`{{ 'yourfont.woff2' | asset_url }}\` filter inside the @font-face, which resolves to the public URL of the file you uploaded.`,
      },
      {
        q: `Can I use Google Fonts with ${theme.name} instead of self-hosting?`,
        a: `${theme.name} already supports Google Fonts via the Theme Editor's font picker, but that route is limited to fonts in Shopify's curated catalog. Self-hosting your own WOFF2 unlocks any face — including paid foundry fonts you've licensed — and avoids the third-party request that Google Fonts adds to every page load.`,
      },
    ],
    relatedSlugs: [
      `add-custom-font-${theme.slug}-liquid`,
      `${theme.slug}-theme-typography-css-variables`,
      `fix-shopify-font-layout-shift-${theme.slug}`,
    ],
    breadcrumbLabel: `${theme.name} Generator`,
    verticalAngle: theme.verticalAngle,
    sitemapPriority: theme.popularity === "tier-1" ? 0.8 : 0.7,
    sitemapChangeFrequency: "monthly",
  };
}

function buildLiquidTutorialEntry(theme: ThemeMeta): PseoEntry {
  const slug = `add-custom-font-${theme.slug}-liquid`;
  const h1 = `Add a Custom Font to Shopify ${theme.name} with Liquid`;
  const oneLineAnswer = `On Shopify ${theme.name}, custom fonts are wired up by uploading the file to \`assets/\`, then referencing it inside an @font-face block via the Liquid \`asset_url\` filter — no Liquid template edits required.`;
  const intro = `Adding a custom font to ${theme.name} is mostly a CSS task — the only Liquid you need is the one-liner that Shopify uses to resolve uploaded asset paths. Because ${theme.name} is ${theme.positioning} you can drop the @font-face block directly into ${theme.injectionPoint} and skip every snippet file.`;
  const useCase = `In your ${theme.name} theme's code editor, navigate to \`assets/\` and upload your WOFF2 (and any fallbacks). Open the file at ${theme.injectionPoint} and paste the @font-face block from the generator above. The crucial detail is the Liquid filter \`{{ 'yourfont.woff2' | asset_url }}\` — Shopify rewrites this at render time to the actual CDN URL for the asset, including a cache-busting hash. Reference that font-family from anywhere in your stylesheet, or — preferred — override \`--font-heading-family\` so all of ${theme.name}'s heading selectors${selectorEg(theme)} inherit the new face automatically.`;

  return {
    slug,
    theme: theme.name,
    intent: "tutorial",
    h1,
    metaTitle: clampTitle(`Add Custom Font to ${theme.name} via Liquid`),
    metaDescription: clampDescription(
      `Step-by-step Liquid + CSS workflow to add a self-hosted custom font to the Shopify ${theme.name} theme without touching template files.`,
    ),
    oneLineAnswer,
    intro,
    useCaseSteps: splitSteps(useCase),
    faqs: [
      {
        q: `Where do I paste the @font-face block in ${theme.name}?`,
        a: `${theme.injectionPoint}. ${theme.name} loads that file before any section-level CSS, so the @font-face declaration is registered in time for every page that follows.`,
      },
      {
        q: `How does Liquid's asset_url filter work inside an @font-face on ${theme.name}?`,
        a: `When ${theme.name}'s stylesheet is rendered server-side, Shopify replaces \`{{ 'yourfont.woff2' | asset_url }}\` with the absolute CDN URL of the uploaded file. The browser then sees a normal CSS \`url(...)\` call. This is why the @font-face block must live in a \`.css.liquid\` or a stylesheet served through Liquid, never in a static \`.css\` file outside Shopify's pipeline.`,
      },
      {
        q: `Do I need to edit any Liquid templates to install a custom font on ${theme.name}?`,
        a: `No. ${theme.name}'s typography reads from \`--font-heading-family\` and \`--font-body-family\` CSS variables, which means a stylesheet override is enough. You only edit Liquid templates if you want to gate the font behind a Theme Editor toggle, in which case you wire it through \`settings_schema.json\`.`,
      },
      {
        q: `How do I scope the font to only headings on ${theme.name}?`,
        a: `Set \`--font-heading-family\` only and leave \`--font-body-family\` untouched. ${theme.name}'s heading selectors${selectorEg(theme)} read from the heading token, while paragraph and form copy continue to use the body token and ${defaultBody(theme)}.`,
      },
    ],
    relatedSlugs: [
      `shopify-${theme.slug}-custom-font-generator`,
      `${theme.slug}-theme-typography-css-variables`,
      `fix-shopify-font-layout-shift-${theme.slug}`,
    ],
    breadcrumbLabel: `${theme.name} Liquid`,
    verticalAngle: theme.verticalAngle,
    sitemapPriority: 0.6,
    sitemapChangeFrequency: "monthly",
  };
}

function buildCssVarTutorialEntry(theme: ThemeMeta): PseoEntry {
  const slug = `${theme.slug}-theme-typography-css-variables`;
  const h1 = `${theme.name} Theme Typography CSS Variables`;
  const oneLineAnswer = `${theme.name} exposes \`--font-heading-family\`, \`--font-heading-style\`, \`--font-heading-weight\`, and the matching \`--font-body-*\` tokens on \`:root\` — overriding them is the cleanest way to swap typography without forking core theme files.`;
  const intro = `${theme.name} centralizes its entire typography system in six CSS custom properties on \`:root\`. Because ${theme.positioning}, every page-level heading and paragraph reads from those tokens — meaning a single override block can retarget the whole site.`;
  const useCase = `The six tokens are: \`--font-heading-family\`, \`--font-heading-style\`, \`--font-heading-weight\`, \`--font-body-family\`, \`--font-body-style\`, and \`--font-body-weight\`. ${theme.name} sets them in \`base.css\` from the values configured in the Theme Editor. To swap them, you append a \`:root { ... }\` override to ${theme.injectionPoint} — that override loads after the theme's defaults and wins by source order. Every heading and body selector${selectorEg(theme)} picks up the change without any template edits, and the override survives ${theme.name} updates because you're modifying values, not the cascade chain itself.`;

  return {
    slug,
    theme: theme.name,
    intent: "tutorial",
    h1,
    metaTitle: clampTitle(`${theme.name} Typography CSS Variables Guide`),
    metaDescription: clampDescription(
      `Reference for the six CSS custom properties that control typography in the Shopify ${theme.name} theme, plus the override pattern that survives upgrades.`,
    ),
    oneLineAnswer,
    intro,
    useCaseSteps: splitSteps(useCase),
    faqs: [
      {
        q: `Which CSS variables control typography in ${theme.name}?`,
        a: `${theme.name} sets six tokens on \`:root\`: \`--font-heading-family\`, \`--font-heading-style\`, \`--font-heading-weight\`, \`--font-body-family\`, \`--font-body-style\`, and \`--font-body-weight\`. Heading selectors read the heading triplet, body selectors read the body triplet — there's no per-section override.`,
      },
      {
        q: `What's the difference between --font-heading-family and --font-body-family in ${theme.name}?`,
        a: `\`--font-heading-family\` is consumed by every heading-level rule${selectorEg(theme)}. \`--font-body-family\` is consumed by paragraphs, list items, form copy, and the cart drawer in ${theme.name}. Setting only one lets you mix a display heading face with ${defaultBody(theme)} on body — a useful split when your custom font is large.`,
      },
      {
        q: `How do I override ${theme.name}'s typography without touching base.css directly?`,
        a: `Add a \`:root { --font-heading-family: ... }\` block at ${theme.injectionPoint}. The cascade resolves the later declaration as the winner, so ${theme.name}'s defaults are overridden without removing them. This pattern survives Shopify's quarterly theme updates, which often modify \`base.css\` but rarely touch the trailing customization region.`,
      },
      {
        q: `Will a CSS-variable typography override survive a ${theme.name} update?`,
        a: `Yes — provided you append the override at ${theme.injectionPoint} rather than editing the original token declarations. ${theme.name} ships theme updates that may rewrite the \`base.css\` defaults, but appended override blocks are preserved as long as they live below the auto-generated section. As a hardening step, paste the override behind a clearly marked comment so future you (or a subsequent developer) recognizes it as customization.`,
      },
    ],
    relatedSlugs: [
      `shopify-${theme.slug}-custom-font-generator`,
      `add-custom-font-${theme.slug}-liquid`,
      `fix-shopify-font-layout-shift-${theme.slug}`,
    ],
    breadcrumbLabel: `${theme.name} CSS Vars`,
    verticalAngle: theme.verticalAngle,
    sitemapPriority: 0.6,
    sitemapChangeFrequency: "monthly",
  };
}

function buildLayoutShiftFixEntry(theme: ThemeMeta): PseoEntry {
  const slug = `fix-shopify-font-layout-shift-${theme.slug}`;
  const h1 = `Fix Custom Font Layout Shift on Shopify ${theme.name}`;
  const oneLineAnswer = `Layout shift on ${theme.name} after a custom font installs is almost always a missing \`font-display: swap\`, an unpreloaded WOFF2, or a JS-driven font swap that fires after first paint — fix all three and your CLS drops to zero.`;
  const intro = `${theme.name} ships clean Core Web Vitals out of the box, but a poorly configured custom font can knock CLS up by 0.10 or more. Because ${theme.positioning}, the merchant audience tends to research these issues directly on mobile — making CLS a conversion-impacting metric, not just an SEO one.`;
  const useCase = `Three fixes cover almost every case. First, set \`font-display: swap\` on every @font-face declaration so the browser renders fallback metrics immediately and swaps in your custom face when ready. Second, preload the WOFF2 with \`<link rel="preload" as="font" type="font/woff2" crossorigin>\` from ${theme.name}'s \`theme.liquid\` head — preloading saves the round-trip the browser would otherwise make after parsing CSS. Third, override \`--font-heading-family\` instead of swapping classes via JavaScript: ${theme.name}'s heading selectors${selectorEg(theme)} read the variable at first paint, eliminating the post-load reflow that JS-driven swaps cause. Verify with the Performance panel in DevTools — the CLS bar should be flat across the load.`;

  return {
    slug,
    theme: theme.name,
    intent: "fix",
    h1,
    metaTitle: clampTitle(`Fix Font Layout Shift on Shopify ${theme.name}`),
    metaDescription: clampDescription(
      `Eliminate CLS from custom fonts on the Shopify ${theme.name} theme: preload WOFF2, set font-display: swap, and override CSS variables instead of class-swapping.`,
    ),
    oneLineAnswer,
    intro,
    useCaseSteps: splitSteps(useCase),
    faqs: [
      {
        q: `Why does my custom font cause layout shift on ${theme.name}?`,
        a: `Almost always one of three causes: \`font-display\` defaults to \`auto\` which blocks rendering and then swaps, the WOFF2 isn't preloaded so the browser fetches it after parsing CSS, or a Liquid block is toggling a class via JavaScript after first paint. ${theme.name}'s ${defaultFallbackName(theme)} has different metrics than most custom faces, which exaggerates the shift if any of those three are in play.`,
      },
      {
        q: `How do I preload a font on ${theme.name} to fix CLS?`,
        a: `Open ${theme.name}'s \`layout/theme.liquid\` and insert \`<link rel="preload" href="{{ 'yourfont.woff2' | asset_url }}" as="font" type="font/woff2" crossorigin>\` inside the \`<head>\` block, above the main stylesheet link. Preloading tells the browser to fetch the font in parallel with the HTML, eliminating the wait that otherwise happens between CSS parse and font request.`,
      },
      {
        q: `Should I use font-display: swap or font-display: optional on ${theme.name}?`,
        a: `\`swap\` for nearly all ${theme.name} stores. \`optional\` is theoretically zero-CLS because it skips the swap if the font isn't ready in 100ms — but on a ${theme.category} site, brand consistency matters, and \`swap\` plus a preload is functionally CLS-free without sacrificing the custom face. The generator above defaults to \`swap\`.`,
      },
      {
        q: `What size budget should I aim for to keep CLS at zero on ${theme.name}?`,
        a: `Aim for sub-50KB WOFF2 per face. ${theme.name}'s critical render path expects the font to arrive before the layout settles — at 50KB on 4G that's well within the LCP window. If your face is larger (heavy display or icon-loaded), subset it to Latin-only and only include the weights your store actually uses, which often cuts file size by 60-70%.`,
      },
    ],
    relatedSlugs: [
      `shopify-${theme.slug}-custom-font-generator`,
      `${theme.slug}-theme-typography-css-variables`,
      `add-custom-font-${theme.slug}-liquid`,
    ],
    breadcrumbLabel: `${theme.name} CLS Fix`,
    verticalAngle: theme.verticalAngle,
    sitemapPriority: 0.6,
    sitemapChangeFrequency: "monthly",
  };
}

function buildFormatTutorialEntry(
  theme: ThemeMeta,
  format: "woff2" | "woff" | "ttf",
): PseoEntry {
  const FORMAT_LONG: Record<"woff2" | "woff" | "ttf", string> = {
    woff2: "WOFF2",
    woff: "WOFF",
    ttf: "TTF",
  };
  const formatUpper = FORMAT_LONG[format];
  const slug = `shopify-${theme.slug}-${format}-font-code`;
  const h1 = `Shopify ${theme.name} ${formatUpper} Font Code Generator`;
  const oneLineAnswer = `For Shopify ${theme.name}, the ${formatUpper} entry inside @font-face uses Liquid's \`asset_url\` filter — \`url({{ 'yourfont.${format}' | asset_url }}) format('${cssToken(format)}')\` — and must appear in WOFF2 → WOFF → TTF order so browsers stop at the smallest format they understand.`;
  const intro = `${formatUpper} is ${formatRationale(format)} On a ${theme.name} store — ${theme.positioning} — adding a ${formatUpper} entry to your @font-face block is straightforward: the generator above writes the exact line, including the Liquid filter, in the correct precedence order.`;
  const useCase = `Upload your ${formatUpper} file to ${theme.name}'s \`assets/\` folder. Paste the @font-face block at ${theme.injectionPoint}. The generator emits the ${formatUpper} entry in the right place — after WOFF2 if you've also selected it, before TTF/OTF/EOT if you haven't. Browsers parse each \`src\` line in order and stop at the first \`format()\` they can decode, so a correctly ordered list delivers the smallest file the visitor's browser supports.`;

  return {
    slug,
    theme: theme.name,
    intent: "tutorial",
    h1,
    metaTitle: clampTitle(`Shopify ${theme.name} ${formatUpper} @font-face`),
    metaDescription: clampDescription(
      `Generate the @font-face ${formatUpper} entry the Shopify ${theme.name} theme expects, in the correct format() precedence order, with Liquid's asset_url filter pre-wired.`,
    ),
    oneLineAnswer,
    intro,
    useCaseSteps: splitSteps(useCase),
    faqs: [
      {
        q: `Why does ${theme.name} prefer WOFF2 over ${formatUpper}?`,
        a: `WOFF2 is roughly 30% smaller than ${formatUpper} thanks to Brotli compression and is supported by 97% of browsers a ${theme.name} store sees. WOFF2 is the format ${theme.name}'s ${defaultFallbackName(theme)} ships in. ${formatUpper} is included only when you have a meaningful long-tail of users on browsers that can't decode WOFF2.`,
      },
      {
        q: `How do I generate ${formatUpper} from a TTF for ${theme.name}?`,
        a: `Use a tool like fonttools or an online converter to emit a ${formatUpper} from your TTF. Upload the result to ${theme.name}'s \`assets/\` folder. The generator above emits the @font-face entry that references it via Liquid's \`asset_url\` filter; Shopify resolves the URL at render time.`,
      },
      {
        q: `Is ${formatUpper} required for older browsers on ${theme.name}?`,
        a: `${formatRequirement(format)} ${theme.name}'s analytics — assuming you've enabled them — will tell you what your actual visitor mix is. If your tier-1 traffic is exclusively modern browsers, you can drop ${formatUpper} entirely.`,
      },
      {
        q: `How do I order WOFF2/WOFF/TTF in @font-face for ${theme.name}?`,
        a: `WOFF2 first, then WOFF, then TTF, OTF, and EOT. Browsers iterate the \`src\` list in order and stop at the first \`format()\` they can decode — so the smallest format a given browser supports is the one it actually downloads. The generator above always emits this order regardless of which boxes you check.`,
      },
    ],
    relatedSlugs: [
      `shopify-${theme.slug}-custom-font-generator`,
      `add-custom-font-${theme.slug}-liquid`,
      `${theme.slug}-theme-typography-css-variables`,
    ],
    breadcrumbLabel: `${theme.name} ${formatUpper}`,
    verticalAngle: theme.verticalAngle,
    sitemapPriority: 0.5,
    sitemapChangeFrequency: "yearly",
  };
}

function buildComparisonEntry(a: ThemeMeta, b: ThemeMeta): PseoEntry {
  const slug = `${a.slug}-vs-${b.slug}-custom-font`;
  const h1 = `${a.name} vs ${b.name}: Custom Font Setup Compared`;
  const oneLineAnswer = `Both ${a.name} and ${b.name} expose the same six \`--font-heading-*\` and \`--font-body-*\` CSS variables, so the @font-face block and CSS variable override generated above paste cleanly into either theme — the only material difference is the default ${defaultHeading(a)} vs ${defaultHeading(b)} fallback.`;
  const intro = `${a.name} is ${a.positioning} ${b.name} is ${b.positioning} Despite the different positioning, both themes are OS 2.0 and inherit Dawn's typography token convention — meaning the workflow to add a custom font is essentially identical. The differences are in defaults, fallback metrics, and which heading selectors each theme ships — but the override block you paste is identical.`;
  const useCase = `For a side-by-side migration: paste the same @font-face block into ${a.injectionPoint} on ${a.name} and into ${b.injectionPoint} on ${b.name}. The CSS variable override block is byte-identical between the two — both themes read \`--font-heading-family\` and \`--font-body-family\` from \`:root\`. The settings_schema.json snippet is also portable: ${a.name} and ${b.name} both honor \`font_picker\` and \`select\` types in the Theme Editor. Where the themes diverge is in their default fallback faces (${a.name} uses ${defaultHeading(a)}; ${b.name} uses ${defaultBody(b)}), so check that your custom face's \`size-adjust\` matches well enough that any swap is invisible.`;

  return {
    slug,
    theme: `${a.name} vs ${b.name}`,
    intent: "comparison",
    h1,
    metaTitle: clampTitle(`${a.name} vs ${b.name} Custom Fonts`),
    metaDescription: clampDescription(
      `Side-by-side comparison of custom font setup on the Shopify ${a.name} and ${b.name} themes, with a portable CSS variable override that works on both.`,
    ),
    oneLineAnswer,
    intro,
    useCaseSteps: splitSteps(useCase),
    faqs: [
      {
        q: `Which is easier to customize fonts on, ${a.name} or ${b.name}?`,
        a: `Equally easy. Both ${a.name} and ${b.name} are OS 2.0 themes that read typography from CSS custom properties on \`:root\`, so the override block this site generates works on either with no edits. The "easier" theme is whichever you already have installed.`,
      },
      {
        q: `Do ${a.name} and ${b.name} use the same CSS variable names for typography?`,
        a: `Yes. \`--font-heading-family\`, \`--font-heading-style\`, \`--font-heading-weight\`, and the matching \`--font-body-*\` triplet are identical across ${a.name} and ${b.name}. The variable convention is inherited from Dawn, which both themes derive from.`,
      },
      {
        q: `Can I move a custom-font setup from ${a.name} to ${b.name}?`,
        a: `Yes — copy your asset files into ${b.name}'s \`assets/\` folder, paste the same @font-face block into ${b.injectionPoint}, and append the same CSS variable override. The only file-path detail to double-check is whether you used the \`asset_url\` filter (you should have); if so, Shopify rewrites the path correctly on the new theme automatically.`,
      },
      {
        q: `Which theme has better typography defaults out of the box, ${a.name} or ${b.name}?`,
        a: `Subjective and audience-dependent. ${a.name}'s ${a.typographyCharacter} ${b.name}'s ${b.typographyCharacter} If your brand is more expressive, the ${b.category} positioning of ${b.name} probably aligns better. If you're in a ${a.category} space, ${a.name} sets a closer baseline.`,
      },
    ],
    relatedSlugs: [
      `shopify-${a.slug}-custom-font-generator`,
      `shopify-${b.slug}-custom-font-generator`,
      `${a.slug}-theme-typography-css-variables`,
      `${b.slug}-theme-typography-css-variables`,
    ],
    breadcrumbLabel: `${a.name} vs ${b.name}`,
    verticalAngle: `Whether you're running a ${a.category} store on ${a.name} or a ${b.category} store on ${b.name}, the typography goal is the same: a distinctive heading face that signals your category, paired with a body face legible enough for product and checkout copy.`,
    sitemapPriority: 0.5,
    sitemapChangeFrequency: "yearly",
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function cssToken(format: "woff2" | "woff" | "ttf"): string {
  return format === "ttf" ? "truetype" : format;
}

function formatRationale(format: "woff2" | "woff" | "ttf"): string {
  switch (format) {
    case "woff2":
      return "the modern, Brotli-compressed format that every browser shipped after 2015 can decode — and the only format you actually need on a current Shopify store.";
    case "woff":
      return "the predecessor to WOFF2 and a fallback for Internet Explorer 11 and a long tail of older Android browsers.";
    case "ttf":
      return "the uncompressed desktop format — useful as a last-resort fallback and for some embedded webviews that haven't kept pace with WOFF2.";
  }
}

function formatRequirement(format: "woff2" | "woff" | "ttf"): string {
  switch (format) {
    case "woff2":
      return "Required for ~97% of modern traffic — never skip it.";
    case "woff":
      return "Optional. WOFF covers IE11 and a sliver of legacy Android; if your visitors are on supported browsers, you can omit it without measurable harm.";
    case "ttf":
      return "Optional. TTF is rarely necessary in 2025 except for niche WebView shells that don't support WOFF2.";
  }
}

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;
/** PLAN.md §3 internal-link rule: each page links 3–5 related slugs. */
const RELATED_MAX = 5;

function clampTitle(input: string): string {
  if (input.length <= TITLE_MAX) return input;
  return input.slice(0, TITLE_MAX - 1).trimEnd() + "…";
}

function clampDescription(input: string): string {
  if (input.length <= DESCRIPTION_MAX) return input;
  return input.slice(0, DESCRIPTION_MAX - 1).trimEnd() + "…";
}

/* ------------------------------------------------------------------ */
/* Assembly + uniqueness assertions                                    */
/* ------------------------------------------------------------------ */

const COMPARISON_PAIRS: ReadonlyArray<[string, string]> = [
  ["dawn", "sense"],
  ["dawn", "refresh"],
  ["dawn", "crave"],
  ["sense", "refresh"],
];

const FORMAT_PAGES_FORMATS: ReadonlyArray<"woff2" | "woff" | "ttf"> = [
  "woff2",
  "woff",
  "ttf",
];

const generated: PseoEntry[] = [
  ...THEMES.map(buildGeneratorEntry),
  ...THEMES.map(buildLiquidTutorialEntry),
  ...THEMES.map(buildCssVarTutorialEntry),
  ...THEMES.map(buildLayoutShiftFixEntry),
  ...TIER_1_THEMES.flatMap((t) =>
    FORMAT_PAGES_FORMATS.map((f) => buildFormatTutorialEntry(t, f)),
  ),
  ...COMPARISON_PAIRS.map(([a, b]) => {
    const themeA = THEMES.find((t) => t.slug === a);
    const themeB = THEMES.find((t) => t.slug === b);
    if (!themeA || !themeB) {
      throw new Error(`Comparison pair references unknown slug: ${a} or ${b}`);
    }
    return buildComparisonEntry(themeA, themeB);
  }),
];

/**
 * Format and comparison pages are never referenced by another page's
 * `relatedSlugs`, so without this pass they'd be reachable only via the
 * sitemap — orphans (audit Dimension #8). This distributes one inbound
 * link for each across sibling pages, respecting the 3–5 cap.
 */
const linked = attachInboundLinks(generated);

assertUniqueSlugs(linked);
assertFaqUniquenessThreshold(linked, 3);
assertMetaLengths(linked);
assertRelatedLinksValid(linked);
assertNoOrphans(linked);
assertRelatedLinkCount(linked);

export const PSEO_ENTRIES: ReadonlyArray<PseoEntry> = linked;

export const PSEO_BY_SLUG: Readonly<Record<string, PseoEntry>> = Object.freeze(
  Object.fromEntries(linked.map((e) => [e.slug, e])),
);

/* ------------------------------------------------------------------ */
/* Build-time guardrails                                               */
/* ------------------------------------------------------------------ */

function assertUniqueSlugs(entries: ReadonlyArray<PseoEntry>): void {
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.slug)) {
      throw new Error(`Duplicate pSEO slug: ${entry.slug}`);
    }
    seen.add(entry.slug);
  }
}

function assertFaqUniquenessThreshold(
  entries: ReadonlyArray<PseoEntry>,
  threshold: number,
): void {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const faq of entry.faqs) {
      const key = faq.q.trim().toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  for (const [key, count] of counts) {
    if (count > threshold) {
      throw new Error(
        `FAQ question "${key}" appears on ${count} pages (>${threshold}). ` +
          `Tighten the per-theme variation in content/pseo.ts.`,
      );
    }
  }
}

function assertMetaLengths(entries: ReadonlyArray<PseoEntry>): void {
  for (const entry of entries) {
    if (entry.metaTitle.length > TITLE_MAX) {
      throw new Error(
        `metaTitle on /${entry.slug} is ${entry.metaTitle.length} chars (>${TITLE_MAX}).`,
      );
    }
    if (entry.metaDescription.length > DESCRIPTION_MAX) {
      throw new Error(
        `metaDescription on /${entry.slug} is ${entry.metaDescription.length} chars (>${DESCRIPTION_MAX}).`,
      );
    }
  }
}

function assertRelatedLinksValid(entries: ReadonlyArray<PseoEntry>): void {
  const validSlugs = new Set(entries.map((e) => e.slug));
  for (const entry of entries) {
    for (const related of entry.relatedSlugs) {
      if (!validSlugs.has(related)) {
        throw new Error(
          `/${entry.slug} links to /${related}, which is not a generated pSEO slug.`,
        );
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* Orphan elimination (audit Dimension #8)                             */
/* ------------------------------------------------------------------ */

/**
 * Sibling pages that can host an inbound link to an orphaned variant
 * page, in fallback order. Derived from the orphan's own slug so this
 * stays correct as themes are added. Returns [] for slugs that are
 * already linked by the base builders (generators/tutorials/fixes).
 */
function candidateParents(slug: string): string[] {
  const fmt = slug.match(/^shopify-(.+)-(?:woff2|woff|ttf)-font-code$/);
  if (fmt) {
    const t = fmt[1];
    return [
      `shopify-${t}-custom-font-generator`,
      `add-custom-font-${t}-liquid`,
      `${t}-theme-typography-css-variables`,
      `fix-shopify-font-layout-shift-${t}`,
    ];
  }
  const cmp = slug.match(/^(.+)-vs-(.+)-custom-font$/);
  if (cmp) {
    const [, a, b] = cmp;
    return [
      `fix-shopify-font-layout-shift-${a}`,
      `fix-shopify-font-layout-shift-${b}`,
      `${a}-theme-typography-css-variables`,
      `${b}-theme-typography-css-variables`,
    ];
  }
  return [];
}

/**
 * Give every page at least one inbound internal link. Pages that no base
 * builder links to (format + comparison variants) each receive a single
 * link from a sibling page, chosen so no page's related list exceeds
 * RELATED_MAX. Pure: returns new entries with extended relatedSlugs.
 */
function attachInboundLinks(entries: PseoEntry[]): PseoEntry[] {
  const related = new Map(entries.map((e) => [e.slug, [...e.relatedSlugs]]));
  const inboundCount = new Map<string, number>();
  for (const arr of related.values()) {
    for (const r of arr) inboundCount.set(r, (inboundCount.get(r) ?? 0) + 1);
  }

  for (const entry of entries) {
    if ((inboundCount.get(entry.slug) ?? 0) > 0) continue;
    const parent = candidateParents(entry.slug).find((p) => {
      const list = related.get(p);
      return (
        list !== undefined &&
        p !== entry.slug &&
        list.length < RELATED_MAX &&
        !list.includes(entry.slug)
      );
    });
    if (!parent) {
      throw new Error(
        `No capacity to give /${entry.slug} an inbound link without ` +
          `exceeding ${RELATED_MAX} related links on a sibling page.`,
      );
    }
    related.get(parent)!.push(entry.slug);
    inboundCount.set(entry.slug, 1);
  }

  return entries.map((e) => ({ ...e, relatedSlugs: related.get(e.slug)! }));
}

function assertNoOrphans(entries: ReadonlyArray<PseoEntry>): void {
  const linkedSlugs = new Set<string>();
  for (const e of entries) for (const r of e.relatedSlugs) linkedSlugs.add(r);
  for (const e of entries) {
    if (!linkedSlugs.has(e.slug)) {
      throw new Error(`/${e.slug} has no inbound internal link (orphan).`);
    }
  }
}

function assertRelatedLinkCount(entries: ReadonlyArray<PseoEntry>): void {
  for (const e of entries) {
    if (e.relatedSlugs.length < 3 || e.relatedSlugs.length > RELATED_MAX) {
      throw new Error(
        `/${e.slug} has ${e.relatedSlugs.length} related links (must be 3–${RELATED_MAX}).`,
      );
    }
  }
}
