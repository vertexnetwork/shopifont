import type { ActionFunctionArgs } from "@remix-run/node";

import prisma from "../db.server";
import { authenticate } from "../shopify.server";

/**
 * Catch-all webhook handler. The Shopify SDK verifies the HMAC
 * signature and identifies the topic; we dispatch on `topic`.
 *
 * Topics handled in PR-2:
 *  - APP_UNINSTALLED — purge the merchant's session row so a future
 *    re-install starts clean (Shopify caches access tokens until
 *    explicit logout).
 *  - APP_SCOPES_UPDATE — re-up the cached scope string so subsequent
 *    requests don't 403 on the new scope. The SDK doesn't auto-update.
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
    default:
      // Unrecognized topic — return 200 anyway so Shopify doesn't keep
      // retrying. The SDK's signature check has already passed by this
      // point so the request is authenticated.
      break;
  }

  return new Response();
}
