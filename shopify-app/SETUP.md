> # ⚠️ SHELVED — DO NOT FOLLOW THIS UNLESS THE APP IS UN-SHELVED
>
> The Shopify App is not the active product. The product is the
> **Shopify Typography Kits** (Gumroad). This runbook is preserved
> intact for the day the app might be revived as a scale lever — but
> do not start it without re-deciding that the support/maintenance
> cost is worth it. See the main project's `/shopify-typography-kits`
> page and `content/kits.ts` for what's actually being sold.

---

# Shopifont Shopify App — Setup & Submission Walkthrough

This is the step-by-step runbook to take the app from the current
repo state to **submitted for App Store review**. The code is
complete and verified (`npm run typecheck` and `npm run build` both
pass clean). Everything remaining is account creation, credentials,
deployment, and Shopify's listing/review flow — none of which can
live in the repo.

Work top to bottom. Each step says what to do, the exact command,
and how to know it worked.

---

## 0. Current state (what's already done)

- ✅ All app code complete: OAuth, embedded UI, Theme Asset API
  install pipeline, billing gate, webhooks.
- ✅ **GDPR/compliance webhooks wired** (`customers/data_request`,
  `customers/redact`, `shop/redact`) — required for review.
- ✅ Billing configured: **$4.99/mo, 7-day trial**, single line-item
  subscription plan (env-driven in `.env` / Vercel).
- ✅ `typecheck` + `build` pass; Vercel build command is
  `npm run prisma:generate && npm run build` (in `vercel.json`).
- ❌ Not done (this runbook): Partners app, Postgres, `.env`,
  `config:link`, dev-store test, Vercel deploy, listing, submission.

Estimated time to "submitted for review": **2–4 hours** of active
work (plus Shopify's review queue, typically 5–10 business days).

---

## 1. Accounts you need (do these first)

| Account | URL | Why |
|---|---|---|
| Shopify Partners | partners.shopify.com | Create the app, get API credentials, manage the listing |
| A Postgres provider | neon.tech (recommended) | Session storage — the app cannot run without it |
| Vercel | vercel.com | Hosts the app backend as its own project, served at the `app.shopifont.app` subdomain (see "Two URLs" below) |
| A development store | Created inside Partners | Test install + billing without real charges |
| DNS for shopifont.app | wherever the domain is managed | Add one `CNAME` so `app.shopifont.app` points at the app's Vercel project |

### Two URLs — read this before you start

There is **one brand domain**. There is no `*.vercel.app` URL anywhere
a merchant can see. Two distinct URLs are involved and they are not
interchangeable:

| URL | What it is | Who sees it | Set as |
|---|---|---|---|
| `https://app.shopifont.app` | The app **backend** — the Remix server Shopify loads inside the admin iframe. Its own Vercel project (it's an SSR + Postgres + OAuth app; it physically cannot live in the static shopifont.app deploy). | Only Shopify's iframe + OAuth redirects. Not a marketing surface. | `SHOPIFY_APP_URL` in the **shopify-app** Vercel project; `application_url` in `shopify.app.toml` |
| `https://apps.shopify.com/<handle>` | The **App Store listing**. Where merchants actually install. | Merchants, via every `<AppUpsell />` link on shopifont.app. | `NEXT_PUBLIC_SHOPIFY_APP_LISTING_URL` in the **main shopifont.app** Vercel project |

The shopifont.app marketing site links to the **listing**, never to
the backend. The backend being a separate Vercel *project* is a hard
Shopify/runtime requirement — but it is **not** a separate brand
domain; it's the `app.` subdomain.

> **Neon is recommended** over Vercel Postgres for this app: free
> tier is generous, connection string is stable, and branch-per-env
> is useful later. Any Postgres works — the app only writes tiny
> Session rows.

---

## 2. Create the Shopify Partners app

1. partners.shopify.com → **Apps → Create app → Create app manually**.
2. Name: `Shopifont`. (The listing display name can differ later.)
3. After creation, open **Configuration → Client credentials**. Note:
   - **Client ID** → goes in `.env` as `SHOPIFY_API_KEY`
   - **Client secret** → goes in `.env` as `SHOPIFY_API_SECRET`
4. **Apps → (your app) → Overview → Test on a development store** if
   you don't have a dev store yet → create one. Note its
   `*.myshopify.com` domain.

Don't fill in App URLs in the dashboard yet — `config:link` +
`shopify app deploy` will push them from `shopify.app.toml` in step 7.

---

## 3. Provision Postgres

1. neon.tech → new project → copy the **pooled** connection string.
   It looks like:
   `postgresql://user:pass@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require`
2. Keep it handy for `.env` (`DATABASE_URL`) and the Vercel env vars.

---

## 4. Local environment

```bash
cd shopify-app
cp .env.example .env
```

Fill `.env`:

| Var | Value |
|---|---|
| `SHOPIFY_API_KEY` | Client ID from step 2 |
| `SHOPIFY_API_SECRET` | Client secret from step 2 |
| `SCOPES` | `write_themes` (leave as-is) |
| `SHOPIFY_APP_URL` | `https://app.shopifont.app` (the default in `.env.example`). The Shopify CLI auto-overrides this with a tunnel URL during `npm run dev`, so the value only matters for production. |
| `DATABASE_URL` | Neon connection string from step 3 |
| `SHOPIFY_BILLING_PLAN_NAME` | `Shopifont Pro` (leave as-is) |
| `SHOPIFY_BILLING_PLAN_PRICE_USD` | `4.99` |
| `SHOPIFY_BILLING_TRIAL_DAYS` | `7` |

`.env` is git-ignored (verified in `.gitignore`) — it will not be
committed.

Then:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate:dev   # creates the Session table in Neon
```

Success check: `npx prisma studio` shows an empty `Session` table.

---

## 5. Link the local project to your Partners app

```bash
npm run config:link
```

The CLI prompts for org + app, then **rewrites `shopify.app.toml`**
with your real `client_id` (replacing
`REPLACE_WITH_PARTNERS_CLIENT_ID`).

> ⚠️ After this runs, `shopify.app.toml` contains your real client
> ID. That is **not a secret** (it's public in the app's frontend),
> so committing it is fine and expected — the Shopify CLI workflow
> assumes the linked toml is in version control.

Also set `dev_store_url` in `shopify.app.toml` to your dev store
domain (or let `npm run dev` set it on first run).

---

## 6. Test locally against the dev store

```bash
npm run dev
```

The Shopify CLI opens a tunnel, registers webhooks, and prints an
install URL. Open it, install on the dev store, and verify the full
golden path:

- [ ] OAuth completes; app loads embedded in Admin without an iframe
      error.
- [ ] **Billing screen appears** ($4.99/mo, 7-day trial). Approve it
      (dev stores use test charges — no real money).
- [ ] Main UI lists the dev store's themes; published theme is
      pre-selected.
- [ ] Upload a real `.woff2`, set a font name, pick Headings + Body,
      click **Install on theme**.
- [ ] Success banner lists the asset keys written.
- [ ] In the dev store: **Online Store → Themes → Edit code** —
      confirm `assets/shopifont.css` exists, the font files are in
      `assets/`, and `layout/theme.liquid` has the
      `{% comment %} shopifont:start/end %}` block before `</head>`.
- [ ] Storefront renders the new font (hard-refresh).
- [ ] Re-run install with a different font → the marker block is
      **replaced**, not duplicated (idempotency check).
- [ ] Uninstall the app from Admin → confirm the Session row is gone
      from Neon (`prisma studio`).

If the theme uses an `{% include %}`'d head partial, the success
message will tell the merchant to add the line manually — this is
expected behavior, not a bug (documented in `README.md` Limits).

---

## 7. Deploy the backend to Vercel (own project, `app.shopifont.app`)

> The `shopify-app/` backend is its **own Vercel project** — a
> separate Remix/Postgres/OAuth runtime that **cannot** be folded
> into the static shopifont.app deploy. That is a runtime constraint,
> **not** a separate brand domain: it's served at the
> `app.shopifont.app` subdomain. Do **not** import `shopify-app/`
> into the main shopifont.app Vercel project.

1. Vercel → **Add New → Project → Import** the GitHub repo.
2. **Root Directory: `shopify-app`** (critical — set this in the
   import screen).
3. Framework preset auto-detects Remix (confirmed by `vercel.json`).
   The build command is already pinned to
   `npm run prisma:generate && npm run build` — don't override it.
4. **Custom domain:** in this Vercel project → Settings → Domains,
   add `app.shopifont.app`. Vercel shows a `CNAME` target (e.g.
   `cname.vercel-dns.com`). Add that `CNAME` record for the `app`
   subdomain wherever shopifont.app's DNS lives. Wait for Vercel to
   show the domain as Valid (TLS auto-provisions).
5. Add environment variables (Production **and** Preview):
   - `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`
   - `SHOPIFY_APP_URL=https://app.shopifont.app`
   - `SCOPES=write_themes`
   - `DATABASE_URL` → Neon string
   - `SHOPIFY_BILLING_PLAN_NAME=Shopifont Pro`
   - `SHOPIFY_BILLING_PLAN_PRICE_USD=4.99`
   - `SHOPIFY_BILLING_TRIAL_DAYS=7`
6. Deploy. After the first successful deploy, run the production
   migration once (Vercel runs `prisma generate` on every build but
   **does not** auto-apply migrations):
   ```bash
   # locally, with DATABASE_URL pointed at the PROD Neon db:
   DATABASE_URL="<prod-neon-url>" npm run prisma:migrate:deploy
   ```

Success check: `https://app.shopifont.app` shows the "open from your
Shopify Admin" landing page (not a 500, not a Vercel 404, and the URL
bar stays on `app.shopifont.app` — not a `*.vercel.app` redirect).

---

## 8. Point the Partners app at the deployed URL

Either edit in the Partners dashboard, or (preferred) push from the
linked toml:

```bash
# shopify.app.toml already points application_url + redirect_urls at
# https://app.shopifont.app — if your DNS uses a different subdomain,
# edit those lines first, then:
npm run deploy
```

Confirm `application_url = "https://app.shopifont.app"` and all three
`redirect_urls` use the same host before pushing. `npm run deploy`
writes this config to the Partners app.

Re-test the install flow once against the **production** URL on the
dev store (repeat the step 6 checklist). Webhooks now hit the
deployed `/webhooks` endpoint — confirm an uninstall purges the
Session row in the prod Neon db.

---

## 9. Build the App Store listing

Partners → your app → **Distribution → Shopify App Store →
Create listing**. Required fields and the correct values for this
app:

| Field | Value |
|---|---|
| App name | `Shopifont` (or `Shopifont — Custom Font Installer`) |
| Pricing | **Recurring: $4.99 / month, 7-day free trial** (must match `SHOPIFY_BILLING_*` env vars exactly) |
| Privacy policy URL | `https://shopifont.app/privacy` |
| App URL | `https://app.shopifont.app` (the backend subdomain — Shopify loads this in the iframe) |
| Single-purpose justification | "Auto-installs a merchant-supplied custom font into their Shopify theme via the Theme Asset API." |
| Requested scopes justification | `write_themes`: "The app writes the @font-face stylesheet and a stylesheet_tag into the merchant's theme assets and layout — this requires write access to themes." |
| Data handling | The app stores no end-customer PII. It persists only Shopify Session records (shop domain + access token) for auth. GDPR webhooks are implemented. |

Screenshots/demo: record the step 6 golden path on the dev store.

---

## 10. Pre-submission checklist (Shopify's automated review tests these)

- [ ] Installs and authenticates without errors on a fresh dev store.
- [ ] Billing charge is created on install (the gate in
      `app/routes/app.tsx` enforces this).
- [ ] All three GDPR webhooks return 200 (wired in
      `app/routes/webhooks.$.tsx` + `shopify.app.toml`
      `compliance_topics`). Test with
      `shopify app webhook trigger --topic=customers/redact`.
- [ ] `app/uninstalled` webhook deletes session data.
- [ ] App performs no actions outside its stated single purpose.
- [ ] No console errors in the embedded Admin view.
- [ ] Privacy policy URL resolves.

Then: Partners → app → **Submit for review**.

---

## 11. After approval — flip the upsell live on shopifont.app

The marketing site already has flag-gated `<AppUpsell />` placements
on the homepage, every pSEO generator page, the uninstall guide, and
the three research guides. They render **nothing** until the listing
URL is set. One env var turns them all on — no code change, no
redeploy of logic:

1. Get the public listing URL from the approved app:
   `https://apps.shopify.com/<your-handle>`.
2. In the **main shopifont.app** Vercel project (not this one) →
   Settings → Environment Variables, add:
   ```
   NEXT_PUBLIC_SHOPIFY_APP_LISTING_URL=https://apps.shopify.com/<your-handle>
   ```
3. Redeploy shopifont.app (or trigger a deploy). Every `<AppUpsell />`
   now renders and links to the listing.
4. Spot-check: homepage (card under the generated code), any
   `/shopify-*-custom-font-generator` page (card after the install
   steps), `/uninstall-custom-font-shopify` (card before the reinstall
   box), and a research guide (single soft line in the closing box).

Until this is set, `siteConfig.features.shopifyApp.enabled` is false
and the component returns `null` everywhere — which is why the site
can ship the placements now and light them up the day the listing
goes live.

---

## Known issues / notes (not review blockers)

1. **`npm run lint` fails locally** with an `eslint-config-next`
   resolution error. This is monorepo config bleed — the
   `shopify-app/` eslint resolves up into the parent
   `shopifont.app` node_modules. It does **not** affect the build or
   deployment (Vercel's build command doesn't run lint) and is
   irrelevant to App Store review (which tests runtime behavior, not
   your lint config). Fix later by giving `shopify-app/` a `root:
   true` flat eslint config; not worth doing before submission.

2. **Uninstall cannot remove the theme code.** When a merchant
   uninstalls, Shopify revokes the access token *before* any cleanup
   webhook fires, so the app physically cannot delete the
   `shopifont.css` asset or the `theme.liquid` marker block. This is
   a Shopify platform limitation, not a defect. The parent site's
   `/uninstall-custom-font-shopify` guide documents the manual
   removal. Consider adding an in-app "Uninstall from theme" button
   (pre-uninstall, while the token is still valid) as a future
   enhancement.

3. **Multi-weight filename matching is heuristic.** File at index `i`
   is assigned `weight[floor(i / formats.length)]`. The form's help
   text tells merchants to upload in `weight × format` order. A
   future enhancement is explicit per-file weight/format selection.
   Not a blocker — single-weight (the common case) is exact.

4. **`prisma generate` warned about a newer Prisma release** during
   setup. Cosmetic; the pinned `^5.22.0` works. Upgrade deliberately
   later, not as part of the submission push.
