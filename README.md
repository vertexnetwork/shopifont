# Shopifont

Free Shopify custom-font CSS generator. Pure client-side string interpolation that outputs three copy-paste blocks for any OS 2.0 theme:

1. `@font-face` CSS using Shopify's Liquid `asset_url` filter
2. A `settings_schema.json` snippet for the Theme Editor
3. CSS variable overrides for `--font-heading-family` / `--font-body-family`

Built per [PLAN.md](PLAN.md). Static export, deployed on Vercel + GitHub. No backend, no database, no Supabase.

## Stack

- Next.js 15 (App Router) with `output: "export"`
- TypeScript strict
- Tailwind CSS v4 (`@theme`-driven tokens)
- `next/font` for Inter (UI) and Geist Mono (code blocks)
- `prism-react-renderer` for syntax highlighting
- Vitest for unit tests

## Quick start

```bash
npm install
cp .env.example .env.local      # set NEXT_PUBLIC_SITE_URL, optional Mediavine + Plausible IDs
npm run dev                     # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next dev server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint via `next lint` |
| `npm test` | Vitest run (generators + content map invariants) |
| `npm run build` | Regenerates `public/llms.txt`, then runs `next build` to emit `out/` |
| `npm start` | Serves the static export from `out/` on port 3000 |

## Deploy

1. Push the repo to GitHub.
2. In Vercel, **Add New Project → Import** the GitHub repo. Framework auto-detects as Next.js.
3. Set environment variables (Production):
   - `NEXT_PUBLIC_SITE_URL` — `https://shopifont.app`
   - `NEXT_PUBLIC_MEDIAVINE_SITE_ID` — from your Mediavine dashboard
   - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — `shopifont.app` (or your domain)
4. Add the custom domain `shopifont.app` to the Vercel project.
5. Subsequent pushes to `main` deploy to production; PRs get preview URLs.

## Repo layout

```
shopifont/
├── app/
│   ├── layout.tsx              # fonts + Mediavine + Plausible + JSON-LD
│   ├── page.tsx                # homepage (hero, generator, themes index)
│   ├── [slug]/page.tsx         # pSEO dynamic route, force-static
│   ├── sitemap.ts
│   ├── robots.ts
│   └── not-found.tsx
├── components/
│   ├── Generator/              # Inputs · Preview · CodeBlock · state
│   ├── Schema/                 # JSON-LD wrappers
│   └── Layout/                 # Header · Footer · AdSlot · RelatedLinks
├── content/
│   ├── themes.ts               # 13 free Shopify theme metadata records
│   └── pseo.ts                 # generated pSEO entries + build-time guardrails
├── lib/
│   ├── generators/             # @font-face / settings-schema / CSS-vars + tests
│   ├── llmsTxt.ts              # build-time generator for public/llms.txt
│   └── site.ts                 # site-wide constants
├── scripts/
│   └── build-llms-txt.ts       # prebuild hook: writes public/llms.txt
├── public/
│   ├── favicon.svg
│   └── llms.txt                # generated on `next build`
└── .github/workflows/ci.yml    # typecheck, lint, vitest, Lighthouse CI
```

## Content invariants (asserted at build time)

- Every pSEO `metaTitle` ≤ 60 chars; `metaDescription` ≤ 155 chars
- No FAQ question string appears on more than 3 pages
- Every `relatedSlugs[*]` references a real generated slug
- `intro + useCase + faqs` ≥ 250 words per page

These live in [content/pseo.ts](content/pseo.ts) and are also covered by the Vitest suite.

## What's intentionally NOT in this repo

- No backend, API routes, database, or Supabase
- No CMS — pSEO content is a typed TS file (`content/pseo.ts`)
- No analytics dashboards — Mediavine Grow + a single Plausible tag
- No i18n at launch (English only)

See [PLAN.md](PLAN.md) §1 and §10.
