import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  BillingInterval,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";

import prisma from "./db.server";

/**
 * Single Billing tier definition. Referenced by the subscription gate
 * in routes/app.tsx and registered in the `shopifyApp({ billing })`
 * config below so `billing.require` / `billing.request` resolve to
 * this plan instead of `never`. Pricing is env-driven so a future
 * tier swap is one config change without code edits.
 */
export const BILLING_PLAN = {
  name: process.env.SHOPIFY_BILLING_PLAN_NAME || "Shopifont Pro",
  amount: Number(process.env.SHOPIFY_BILLING_PLAN_PRICE_USD || "4.99"),
  currencyCode: "USD",
  interval: BillingInterval.Every30Days,
  trialDays: Number(process.env.SHOPIFY_BILLING_TRIAL_DAYS || "7"),
} as const;

/**
 * Shopify App initialization. The `shopifyApp` factory wires up:
 *
 *  - OAuth flow (handled by routes/auth.$.tsx)
 *  - Embedded App Bridge auth tokens
 *  - Admin GraphQL/REST clients per request (returned by `authenticate.admin`)
 *  - Webhook signature verification (used by routes/webhooks.$.tsx)
 *  - Billing helpers (subscription gate in routes/app.tsx)
 *
 * Session storage is Prisma → Postgres. Each install creates a row in
 * the Session table; uninstall webhooks clean it up.
 *
 * `restResources` is intentionally NOT imported — the Theme Asset API
 * we need is most cleanly hit via the Admin REST client returned by
 * `authenticate.admin(request).admin.rest`. Importing the full REST
 * resource catalog adds ~400KB of dead code to every cold start.
 */
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(",") ?? ["write_themes"],
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  // shopify-app-remix v3 defaults to line-item billing, so the plan
  // is expressed as a `lineItems` array rather than the flat
  // amount/interval shape the classic template used.
  billing: {
    [BILLING_PLAN.name]: {
      trialDays: BILLING_PLAN.trialDays,
      lineItems: [
        {
          amount: BILLING_PLAN.amount,
          currencyCode: BILLING_PLAN.currencyCode,
          interval: BILLING_PLAN.interval,
        },
      ],
    },
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: false,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
