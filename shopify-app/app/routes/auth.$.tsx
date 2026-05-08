import type { LoaderFunctionArgs } from "@remix-run/node";

import { authenticate } from "../shopify.server";

/**
 * Catch-all OAuth handler. The Shopify Remix SDK owns this — we just
 * forward the request. Path covers `/auth`, `/auth/callback`,
 * `/auth/session-token`, etc. (anything under `/auth/*`).
 *
 * Do not add any logic here that runs before `authenticate.admin` —
 * the SDK's redirect handling depends on being the first thing in
 * the request lifecycle on this path.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return null;
}
