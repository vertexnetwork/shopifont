import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { login } from "../../shopify.server";

/**
 * Standalone login page. Used by:
 *  - The shop-domain entry form on /
 *  - Direct visits to /auth/login (e.g., bookmark)
 *
 * Once authenticated, Shopify redirects the merchant back to /app
 * (handled by the SDK based on `appUrl` + `authPathPrefix`).
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const errors = loginErrorMessage(await login(request));
  return { errors, polarisTranslations: null };
}

export async function action({ request }: ActionFunctionArgs) {
  const errors = loginErrorMessage(await login(request));
  return { errors };
}

export default function Auth() {
  const { errors } = useLoaderData<typeof loader>();
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 540 }}>
      <h1>Shopifont</h1>
      <Form method="post">
        <label htmlFor="shop" style={{ display: "block", marginBottom: "0.5rem" }}>
          Shop domain
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
          Log in
        </button>
        {errors?.shop ? (
          <p style={{ color: "#d92d20", marginTop: "0.5rem" }}>{errors.shop}</p>
        ) : null}
      </Form>
    </main>
  );
}

function loginErrorMessage(loginErrors: { shop?: string } | undefined) {
  if (loginErrors?.shop) {
    return { shop: "Please enter a valid shop domain (e.g. my-store.myshopify.com)" };
  }
  return null;
}
