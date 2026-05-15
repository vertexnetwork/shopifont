# Shopifont — Shopify App

Auto-installs custom fonts into a merchant's Shopify theme using the Theme Asset API. Reuses [`lib/generators/*`](../lib/generators/) from the parent project (the same pure functions that power [shopifont.app](https://shopifont.app) and the Chrome extension) — single source of truth, no fork.

Sibling to [`extension/`](../extension) inside the same monorepo. The backend deploys as its own Vercel project (an SSR + Postgres + OAuth runtime — it can't live in the static shopifont.app deploy), but on **one brand domain**: it's served at the `app.shopifont.app` subdomain, and the shopifont.app marketing site links merchants to the **App Store listing** (`apps.shopify.com/<handle>`), never to the backend. There is no `*.vercel.app` URL anywhere a merchant sees. See [`SETUP.md`](SETUP.md) → "Two URLs".

## What it does

The merchant opens the App from inside Shopify Admin and:

1. Picks the target theme (defaults to the published theme).
2. Types the custom font name (e.g. `Calibre`).
3. Drops their `.woff2` / `.woff` / `.ttf` files into the dropzone.
4. Selects formats, weight(s), style, and apply-to (heading / body).
5. Clicks **Install on theme**.

The App then:

- Uploads each font file to `assets/{name}.{ext}` (or `assets/{name}-{weight}.{ext}` for multi-weight families) via the Theme Asset API.
- Writes a single `assets/shopifont.css` containing the `@font-face` declarations and CSS variable overrides.
- Inserts a `{{ 'shopifont.css' | asset_url | stylesheet_tag }}` line into `layout/theme.liquid` between `{% comment %} shopifont:start/end {% endcomment %}` markers — re-runs replace cleanly, uninstall webhooks remove the block.

## Stack

- **Remix on Vite** (Shopify's official Node template)
- **Prisma + Postgres** for session storage (Vercel Postgres / Neon / Supabase — any provider)
- **Polaris** for the embedded admin UI
- **App Bridge** for embedded iframe authentication
- **TypeScript strict**, vitest

The `@/` alias resolves to the monorepo root, so imports like `@/lib/generators/fontFace` resolve to the parent project's pure functions. Same precedent as the [Chrome extension](../extension/vite.config.ts).

## One-time setup

### 1. Shopify Partners account

1. Sign up at [partners.shopify.com](https://partners.shopify.com).
2. **Apps → Create app → Custom or Public** (Public if you intend to list on the App Store).
3. Note your **Client ID** and **Client secret** — they go into `.env`.
4. Create a **Development store** for testing (Stores → Add store → Development store).

### 2. Postgres for session storage

Pick any Postgres provider. Recommended:

- **Neon** ([neon.tech](https://neon.tech)) — generous free tier, branch-per-environment.
- **Vercel Postgres** ([vercel.com/storage/postgres](https://vercel.com/storage/postgres)) — same dashboard as the deploy.
- **Supabase** ([supabase.com](https://supabase.com)) — also gives you Auth + Storage if you want them later.

Copy the connection string (with `?sslmode=require`) into `DATABASE_URL`.

### 3. Local environment

```bash
cd shopify-app
cp .env.example .env
# fill in SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_URL, DATABASE_URL

npm install
npm run prisma:generate
npm run prisma:migrate:dev   # creates the Session table

# Link this project to the app you created in Partners:
npm run config:link
# (CLI prompts you to pick the org + app, then rewrites shopify.app.toml)

npm run dev
# CLI starts a tunnel, registers webhooks, opens the dev store with
# the embedded App ready for install.
```

### 4. Deploy to Vercel

The backend deploys as its **own Vercel project** — **do NOT** import it into the main `shopifont.app` deploy (different runtime). It is **not** a separate brand domain: serve it at the `app.shopifont.app` subdomain (a custom domain on this Vercel project). The marketing site links merchants to the App Store listing, never to this backend.

[`SETUP.md`](SETUP.md) is the authoritative, step-by-step runbook (DNS/subdomain, env vars, migrations, Partners config, listing, and flipping the upsell live on shopifont.app after approval). The short version:

1. **Vercel → Add New → Project → Import**, **Root Directory: `shopify-app`**.
2. Add the custom domain `app.shopifont.app` to this project (one `CNAME` in shopifont.app's DNS).
3. Env vars (Production + Preview): `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL=https://app.shopifont.app`, `SCOPES=write_themes`, `DATABASE_URL`, `SHOPIFY_BILLING_PLAN_NAME`, `SHOPIFY_BILLING_PLAN_PRICE_USD`, `SHOPIFY_BILLING_TRIAL_DAYS`.
4. After first deploy, run `npm run prisma:migrate:deploy` against the production DB.
5. `npm run deploy` pushes `shopify.app.toml` (already pointing `application_url` + `redirect_urls` at `https://app.shopifont.app`) to Partners.

### 5. Submit to App Store (when ready)

- Make sure the **Privacy policy URL** points at `https://shopifont.app/about` (parent site has the disclosure).
- **Pricing** = `$4.99/mo` with 7-day trial (matches `SHOPIFY_BILLING_PLAN_*` env vars).
- **Single-purpose justification**: "Auto-installs a custom font into a merchant's Shopify theme via the Theme Asset API."

## Repo layout

```
shopify-app/
├── shopify.app.toml         # Partners-app config (rewritten by `config:link`)
├── prisma/schema.prisma     # Session model
├── vite.config.ts           # @/ alias → monorepo root
├── app/
│   ├── shopify.server.ts    # shopifyApp factory, BILLING_PLAN constant
│   ├── db.server.ts         # Prisma singleton
│   ├── entry.server.tsx     # SSR pipe with Shopify response headers
│   ├── root.tsx
│   ├── routes/
│   │   ├── _index/route.tsx       # Public landing (redirect into auth)
│   │   ├── auth.$.tsx             # OAuth catch-all
│   │   ├── auth.login/route.tsx   # Standalone shop-domain login
│   │   ├── webhooks.$.tsx         # app/uninstalled, app/scopes_update
│   │   ├── app.tsx                # Authed parent: billing gate + Polaris
│   │   ├── app._index.tsx         # Main install UI
│   │   └── app.install.tsx        # POST action: Theme Asset API writes
│   └── components/
│       └── InstallForm.tsx        # Polaris form + DropZone
└── README.md
```

## What's intentionally NOT in this repo

- No CMS, no content tables — sessions are the only persisted rows.
- No copy of `lib/generators/*` — imported via `@/` alias from the monorepo root.
- No marketing surface — the parent [shopifont.app](https://shopifont.app) site owns SEO + lead capture; this app is the upsell tier.
- No webhook secret rotation logic — Shopify's SDK handles signature verification with `apiSecretKey`.
- No analytics / Mediavine / AdSense — embedded apps shouldn't load any non-Shopify scripts inside the merchant's Admin iframe.

## Limits + edge cases

- **20 MB total upload, 5 MB per file**. The Theme Asset API has a 5MB-per-asset limit; we enforce both.
- **Heavily-customized themes** that load `<head>` from a partial (`{% include 'head' %}`) won't get the marker block injected. The action returns success on uploads but instructs the merchant to add the line manually — see the message text in [app.install.tsx](app/routes/app.install.tsx).
- **Multi-weight filename matching** is heuristic: file at index `i` is assigned weight `expectedAllWeights[Math.floor(i / formats.length)]`. The form helper text tells merchants to upload in `weight × format` order. Future work: explicit per-file weight/format selection.

## Robustness audit (pre-port)

PR-1 hardened the generators that this App imports:

- Format-aware `settings_schema.json` instruction text
- `font_picker` controls relabeled as Theme Editor fallbacks
- CSS variable selector widened to `:root, [data-shopify-section], .shopify-section`
- Multi-weight family support
- See [`lib/generators/`](../lib/generators/)

This means the App ships on the same hardened core as the website + extension. Silent-failure modes that would have generated chargebacks in V1 of this App are already closed.
