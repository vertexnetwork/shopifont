import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

/**
 * Document shell. Polaris styles are imported per-route (in app.tsx)
 * rather than globally so the auth + login surfaces stay slim. App
 * Bridge is loaded via the `<script>` tag the Shopify SDK injects on
 * the response — we don't import it here.
 */
export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
