import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { login } from "../../shopify.server";

/**
 * Root landing route. Visiting `/` directly lands here; if the URL
 * has a `?shop=` query (the case when a merchant clicks "Install" on
 * the App Store listing), redirect into the OAuth flow. Otherwise
 * show a minimal "open from your Shopify Admin" pointer — no other
 * marketing surface lives here, that's the parent shopifont.app
 * site's job.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/auth?${url.searchParams.toString()}`);
  }
  return null;
}

export default function Index() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 540 }}>
      <h1>Shopifont</h1>
      <p>
        This is the Shopifont Shopify App. Open it from inside your Shopify
        Admin (Apps → Shopifont) — the standalone URL is only used by
        Shopify&apos;s OAuth flow.
      </p>
      <p>
        Looking for the free web generator?{" "}
        <a href="https://shopifont.app">shopifont.app</a>
      </p>
      <form method="get" action="/auth/login" style={{ marginTop: "2rem" }}>
        <label htmlFor="shop" style={{ display: "block", marginBottom: "0.5rem" }}>
          Or install the app — enter your shop domain:
        </label>
        <input
          id="shop"
          name="shop"
          type="text"
          placeholder="my-store.myshopify.com"
          required
          style={{
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: 4,
            minWidth: 280,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            marginLeft: "0.5rem",
            background: "#0066ff",
            color: "white",
            border: 0,
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Install
        </button>
      </form>
    </main>
  );
}
