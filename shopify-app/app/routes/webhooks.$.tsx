import type { ActionFunctionArgs } from "@remix-run/node";

import prisma from "../db.server";
import { authenticate } from "../shopify.server";

/**
 * Catch-all webhook handler. The Shopify SDK verifies the HMAC
 * signature and identifies the topic; we dispatch on `topic`.
 *
 * Topics handled:
 *  - APP_UNINSTALLED — purge the merchant's session row so a future
 *    re-install starts clean (Shopify caches access tokens until
 *    explicit logout).
 *  - APP_SCOPES_UPDATE — re-up the cached scope string so subsequent
 *    requests don't 403 on the new scope. The SDK doesn't auto-update.
 *  - CUSTOMERS_DATA_REQUEST / CUSTOMERS_REDACT / SHOP_REDACT —
 *    mandatory GDPR compliance topics. This app stores NO customer
 *    PII (the only persisted rows are Shopify Session records keyed
 *    by shop, which contain no end-customer data), so the customer
 *    topics are a logged no-op. SHOP_REDACT is Shopify's guaranteed
 *    post-uninstall cleanup signal (sent ~48h after uninstall) — we
 *    hard-delete every Session row for the shop. All three MUST
 *    return 200 or App Store review fails.
 *
 * Add new topics by extending shopify.app.toml [[webhooks.subscriptions]]
 * AND adding a case here. Without both edits Shopify will retry-then-
 * disable the subscription.
 */
export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop, session, payload } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await prisma.session.deleteMany({ where: { shop } });
      }
      break;
    case "APP_SCOPES_UPDATE": {
      const current = (
        payload as { current?: string[] } | null | undefined
      )?.current;
      if (session && current) {
        await prisma.session.update({
          where: { id: session.id },
          data: { scope: current.toString() },
        });
      }
      break;
    }
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
      // The app holds no end-customer data — nothing to return or
      // erase. Acknowledging with 200 (below) is the compliant
      // response for an app with no customer PII.
      break;
    case "SHOP_REDACT":
      // Shopify's guaranteed cleanup signal after uninstall. Purge
      // every Session row for this shop regardless of session state
      // (the APP_UNINSTALLED handler may have already run, or the
      // token may be revoked — deleteMany is idempotent).
      await prisma.session.deleteMany({ where: { shop } });
      break;
    default:
      // Unrecognized topic — return 200 anyway so Shopify doesn't keep
      // retrying. The SDK's signature check has already passed by this
      // point so the request is authenticated.
      break;
  }

  return new Response();
}
