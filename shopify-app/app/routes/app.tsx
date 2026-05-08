import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate, BILLING_PLAN } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

/**
 * Parent layout for every authenticated `/app/*` route. Three jobs:
 *
 *  1. `authenticate.admin(request)` proves the request carries a
 *     valid Shopify session token. The SDK throws redirects if not.
 *  2. Billing gate. We require an active subscription to the single
 *     PR-2 tier ($4.99/mo, 7-day trial). The SDK's `billing.require`
 *     auto-redirects the merchant to a confirmation URL when there's
 *     no active subscription. After they accept, Shopify redirects
 *     back to /app and this loader passes the gate.
 *  3. Surface the App Bridge `apiKey` to the client so embedded
 *     features (NavMenu, Toast, Modal) authenticate against Shopify.
 *
 * The `unstable_newEmbeddedAuthStrategy` flag in shopify.server.ts
 * lets this route render even on the very first install — without
 * it, embedded auth requires an extra hop through `/auth/exit-iframe`.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { billing } = await authenticate.admin(request);

  await billing.require({
    plans: [BILLING_PLAN.name],
    isTest: process.env.NODE_ENV !== "production",
    onFailure: async () =>
      billing.request({
        plan: BILLING_PLAN.name,
        isTest: process.env.NODE_ENV !== "production",
        // returnUrl is omitted — the SDK defaults to the current
        // embedded-app URL, which is exactly where we want the
        // merchant to land post-confirmation.
      }),
  });

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
  };
}

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Install fonts
        </Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify Remix expects this exact pattern for error / headers
// boundary handling on embedded routes — `boundary.error` returns the
// AuthErrorBoundary that resolves session-expired states without a
// hard refresh, and `boundary.headers` forwards the response headers
// the SDK injects.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
