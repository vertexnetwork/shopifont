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
| Vercel | vercel.com | Hosts the app as its own project (separate from shopifont.app) |
| A development store | Created inside Partners | Test install + billing without real charges |

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
| `SHOPIFY_APP_URL` | Leave the placeholder for now; the CLI rewrites it in dev |
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

## 7. Deploy to Vercel (separate project)

> **Do NOT** add `shopify-app/` to the main `shopifont.app` Vercel
> project. It is a separate Remix app with its own domain.

1. Vercel → **Add New → Project → Import** the GitHub repo.
2. **Root Directory: `shopify-app`** (critical — set this in the
   import screen).
3. Framework preset auto-detects Remix (confirmed by `vercel.json`).
   The build command is already pinned to
   `npm run prisma:generate && npm run build` — don't override it.
4. Add environment variables (Production **and** Preview):
   - `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`
   - `SHOPIFY_APP_URL` → the Vercel production URL (e.g.
     `https://shopifont-app.vercel.app`, or a custom domain)
   - `SCOPES=write_themes`
   - `DATABASE_URL` → Neon string
   - `SHOPIFY_BILLING_PLAN_NAME=Shopifont Pro`
   - `SHOPIFY_BILLING_PLAN_PRICE_USD=4.99`
   - `SHOPIFY_BILLING_TRIAL_DAYS=7`
5. Deploy. After the first successful deploy, run the production
   migration once (Vercel runs `prisma generate` on every build but
   **does not** auto-apply migrations):
   ```bash
   # locally, with DATABASE_URL pointed at the PROD Neon db:
   DATABASE_URL="<prod-neon-url>" npm run prisma:migrate:deploy
   ```

Success check: visiting the Vercel URL directly shows the
"open from your Shopify Admin" landing page (not a 500).

---

## 8. Point the Partners app at the deployed URL

Either edit in the Partners dashboard, or (preferred) push from the
linked toml:

```bash
# set application_url + redirect_urls in shopify.app.toml to the
# Vercel URL, then:
npm run deploy
```

`shopify.app.toml` already has the correct relative paths; just
swap `https://shopifont-app.vercel.app` for your real production
URL in `application_url` and the three `redirect_urls` if the
domain differs.

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
| App URL | the Vercel production URL |
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
