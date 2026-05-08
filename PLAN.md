# Engineering Handoff: Shopifont (Shopify Dawn Custom Font CSS Generator)

## Context

[PLAN.md](PLAN.md) is a strategy doc that mixes engineering requirements with internal business material (RPM math, ad-network ranking rationale, market sizing, B2B directory launch lists). This plan extracts only what engineering needs to ship the site and explicitly notes what is out of scope.

The repository is currently empty except for [PLAN.md](PLAN.md). Goal: one-shot a deploy of the production site to **GitHub + Vercel only**. **Supabase is intentionally not used** — the tool is pure client-side string interpolation with no persistence, auth, or server logic, so adding Supabase would be unjustified surface area.

Brand: **shopifont.app** (domain).

---

## 1. Stack & non-goals

**Stack:**
- Next.js 15 (App Router) with `output: 'export'` for fully static deployment
- TypeScript, strict mode
- Tailwind CSS v4 + CSS variables for theming
- `next/font` for Inter (UI) and Geist Mono (code blocks)
- Deployed on Vercel; GitHub repo wired via Vercel's GitHub integration (auto-deploy on push to `main`, preview deploys per PR)

**Non-goals (do not build):**
- No backend, no API routes, no database, no Supabase, no auth
- No server-side rendering at request time — every route must be statically pre-rendered
- No CMS — pSEO content lives in a typed TS data file checked into the repo
- No analytics dashboards — Mediavine Grow + a single GA4 / Plausible tag only
- No i18n at launch (English only)

---

## 2. Core tool spec

The tool produces **three** copy-pasteable code blocks from user inputs. All generation is pure client-side string interpolation, fully reactive on input change.

**Inputs:**
- Custom font name (text)
- Format checkboxes: WOFF2, WOFF, TTF, OTF, EOT (WOFF2 default-on)
- Font weight (numeric, default 400) and style (normal/italic) — affects `@font-face` descriptors
- Optional: drag-and-drop a WOFF2/WOFF/TTF for **live preview only**. The file is loaded via `URL.createObjectURL` + `FontFace` API and registered in `document.fonts` so the preview pane renders sample text in the user's actual font. **The file is never uploaded anywhere** — no fetch, no Supabase, no Vercel Blob. Preview is purely a browser-side convenience.

**Outputs (each in its own card with a Copy button):**
1. `@font-face` CSS block using Shopify's `{{ 'fontname.woff2' | asset_url }}` Liquid filter syntax for each selected format, in the correct `format()` precedence order.
2. `settings_schema.json` snippet that injects the font option into the Theme Editor (must include `id`, `type: "font_picker"` interaction or a `select` fallback as appropriate).
3. CSS variable overrides that override Dawn's `base.css` typography roots (`--font-heading-family`, `--font-body-family`, etc.).

**UX requirements:**
- Real-time regeneration on every keystroke (no submit button)
- Copy button gives clear visual confirmation (icon swap + aria-live announcement)
- Code blocks render in **Geist Mono**, syntax-highlighted (use `shiki` at build time for the static example, `prism-react-renderer` or similar for the dynamic output)
- Mobile: code blocks must be horizontally scrollable inside a fixed-height container; copy button must remain in viewport (sticky within the card)

**Reference marketing copy** (from [PLAN.md](PLAN.md), use verbatim or as inspiration for hero/meta):
- "Conversion-optimized typography without layout shifts"
- "Error-free custom font injections for Shopify OS 2.0"

---

## 3. Programmatic SEO layer (full generation, 50-200 pages)

**Architecture:**
- Single dynamic route: `app/[slug]/page.tsx`
- `generateStaticParams()` reads from a typed content map at `content/pseo.ts`
- Each entry produces one statically pre-rendered HTML page at build time
- The same generator component is embedded on every pSEO page (the tool itself is the conversion); page-specific content is the surrounding copy, schema, and FAQ block

**Content map shape** (`content/pseo.ts`):
```ts
type PseoEntry = {
  slug: string;
  theme: string;          // "Dawn", "Sense", "Refresh", ...
  intent: 'generator' | 'tutorial' | 'comparison' | 'fix';
  h1: string;
  metaTitle: string;      // <= 60 chars
  metaDescription: string;// <= 155 chars
  intro: string;          // 2-3 sentences answering query immediately
  faqs: { q: string; a: string }[];
  relatedSlugs: string[]; // internal linking
};
```

**Slug pattern matrix** (target ~80 pages at launch):
- Theme-only: `/shopify-{theme}-custom-font-generator` × 13 free Shopify themes (Dawn, Sense, Refresh, Crave, Origin, Studio, Taste, Spotlight, Colorblock, Craft, Ride, Publisher, Trade)
- Theme + format: `/shopify-{theme}-{woff2|woff|ttf}-font-code` × top 5 themes × 3 formats
- Intent variants: `/add-custom-font-{theme}-liquid`, `/{theme}-theme-typography-css-variables`, `/fix-shopify-font-layout-shift-{theme}`
- Comparison: `/{themeA}-vs-{themeB}-custom-font` for 3-4 high-traffic theme pairs

**KGR / thin-content guardrails:**
- Each page must have at least 250 words of unique copy outside the tool itself (intro + 4 FAQs + use-case section)
- FAQs must be theme-specific, not boilerplate (the templating function should fail a build assertion if the same FAQ string appears on >3 pages)
- Each page links to 3-5 related slugs in a footer module to build internal link graph

**Sitemap:**
- `app/sitemap.ts` enumerates the same content map + the homepage
- `robots.txt` allows all and points to `/sitemap.xml`

---

## 4. Generative Engine Optimization (pGEO)

These are the technical signals AI search engines (ChatGPT, Perplexity, Gemini) look for. Bake all of them in from day 1:

- **`public/llms.txt`** — root-level plain-text map summarizing what the site is, the tool's inputs/outputs, and a list of canonical URLs. Generated from the same content map at build time so it stays in sync.
- **`SoftwareApplication` JSON-LD** on every page (homepage + pSEO):
  - `applicationCategory: "DeveloperApplication"`
  - `operatingSystem: "Web"`
  - `offers: { price: "0", priceCurrency: "USD" }`
  - `aggregateRating` only if/when real reviews exist (do not fake)
- **`FAQPage` JSON-LD** on every pSEO page, fed from the `faqs` array in the content map
- **`HowTo` JSON-LD** on the homepage (the 3-step "input font name → pick formats → copy code")
- **`BreadcrumbList` JSON-LD** on pSEO pages
- All schema rendered in a `<Script type="application/ld+json" strategy="beforeInteractive">` block — keep it inline, do not lazy-load
- Content structure: each page leads with a direct one-sentence answer to the query, then the tool, then expanded explanation. AI extractors prefer this inverted-pyramid shape.

---

## 5. Mobile optimization (first-class, not an afterthought)

The Shopify merchant audience skews heavily mobile when researching. Treat desktop as the secondary surface.

- **Mobile-first Tailwind breakpoints** — design every component at 360px width first
- **Touch targets ≥ 44×44 px** for all checkboxes, copy buttons, format toggles
- **Code blocks**: fixed `max-height` with `overflow-x: auto` and `overflow-y: auto`; momentum scrolling enabled (`-webkit-overflow-scrolling: touch`)
- **Sticky copy button** on the code-block card so it stays reachable while scrolling
- **Zero CLS budget**: reserve space for ad slots, the preview pane, and the three code-block cards using `min-height` from the start so generated content doesn't shift layout
- **LCP target < 2.0s on 4G**: critical fonts preloaded via `next/font`, hero text uses `font-display: swap`, no above-the-fold images that aren't `priority`
- **INP target < 200ms**: regeneration runs in `useDeferredValue` to avoid blocking input on slower phones
- Lighthouse mobile budget enforced in CI: Performance ≥ 90, Accessibility ≥ 95, SEO = 100

---

## 6. Brand & design system

From [PLAN.md](PLAN.md):
- **Palette**: Charcoal (`#1A1A1A` for text/surfaces) / White / Electric Blue (`#0066FF` accent for CTAs and copy-success state)
- **Fonts**: Inter (UI) + Geist Mono (code) — both via `next/font/google` for self-hosted, zero-CLS loading
- **Voice**: technical, B2B, trust-signaling — no marketing fluff in microcopy

Implement as Tailwind theme tokens + CSS variables in `app/globals.css` so palette swaps remain trivial.

---

## 7. Ad & analytics layer

**Day 1 (per [PLAN.md](PLAN.md) Mediavine Journey path):**
- Install **Mediavine Grow** script in the root layout `<head>` so the 30-day authentication window begins on launch. The site needs this running for Mediavine to approve Journey ads at the 1k-sessions threshold.
- Reserve display ad slots in the layout: one above-the-fold sidebar slot (desktop only), one in-content slot below the tool, one at the page footer. Reserve via fixed-height placeholders to keep CLS = 0 even before ads serve.
- Wire a single analytics tag (Plausible recommended for privacy + lighter weight than GA4; GA4 acceptable if the team prefers).
- Tier-1 traffic share matters for future Raptive eligibility (50% from US/UK/CA/AU/NZ) — make sure the analytics tag captures country so we can monitor this. **No engineering action beyond enabling country dimension** — this is a marketing concern surfaced for visibility.

**Out of scope at deploy time** (do not pre-build for these — adds dead code):
- Mediavine Official, Raptive, AdSense — these come later based on traffic milestones

---

## 8. Repository & deployment

**Repo layout:**
```
shopifont/
├── app/
│   ├── layout.tsx           # <head> incl. Grow + analytics + JSON-LD
│   ├── page.tsx             # homepage (hero + tool + HowTo schema)
│   ├── [slug]/page.tsx      # pSEO dynamic route
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── Generator/           # the core tool (Inputs, Preview, CodeBlock × 3)
│   ├── Schema/              # JSON-LD components per type
│   └── Layout/              # Header, Footer, AdSlot
├── content/
│   └── pseo.ts              # typed content map (single source of truth)
├── lib/
│   ├── generators/          # @font-face / settings-schema / css-vars string builders + unit tests
│   └── llmsTxt.ts           # build-time llms.txt generator
├── public/
│   └── llms.txt             # generated at build time, committed
└── next.config.ts           # output: 'export'
```

**Deployment pipeline:**
1. Push to GitHub (`main` branch protected, PRs required)
2. Vercel GitHub integration auto-deploys `main` to production, every PR to a preview URL
3. Custom domain `shopifont.app` pointed at the Vercel project
4. No environment variables needed for the tool itself; only the Mediavine site ID and analytics ID, both set as Vercel env vars and read at build time
5. Pre-deploy CI on GitHub Actions: typecheck, lint, unit tests for the three generator functions, Lighthouse CI mobile budget

---

## 9. Verification

End-to-end before declaring shipped:
- [ ] Generated `@font-face` block, `settings_schema.json`, and CSS variable overrides paste cleanly into a fresh Dawn theme dev store and the custom font renders without console errors and without CLS in DevTools' Performance panel
- [ ] All three Copy buttons confirmed working on iOS Safari and Android Chrome (clipboard API behaves differently on iOS — must test)
- [ ] Optional file upload + live preview round-trip tested with a real WOFF2 file; preview renders, no network request fires
- [ ] At least 50 pSEO pages built and present in `/sitemap.xml`; spot-check 5 for unique intro/FAQ copy
- [ ] `public/llms.txt` regenerates correctly on `next build` and lists every canonical URL
- [ ] Validate `SoftwareApplication`, `FAQPage`, `HowTo`, and `BreadcrumbList` JSON-LD via Google's Rich Results Test on the homepage and 2 pSEO pages
- [ ] Mediavine Grow script confirmed firing in production (network tab + Mediavine dashboard says "authenticated")
- [ ] Lighthouse mobile run on production URL: Perf ≥ 90, A11y ≥ 95, SEO = 100, CLS = 0
- [ ] Sitemap submitted in Google Search Console and Bing Webmaster Tools

---

## 10. Explicitly NOT engineering's concern (from [PLAN.md](PLAN.md))

Surfacing these so the team can ignore them confidently — they're tracked elsewhere by the business / marketing side:

- RPM projections, earnings targets, ad-network rationale, and the Mediavine vs. Raptive vs. AdSense comparison
- Product Hunt, G2, Capterra, GetApp, TrustRadius, AppSumo, SaaSHub, etc. directory launches
- Domain purchase and DNS — assumed handled before code lands; engineering only needs the domain pointed at Vercel

The team should optimize for code quality and the verification checklist above. Anything in this section that surfaces in a ticket should be redirected to marketing/ops.
