import { PassThrough } from "node:stream";
import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";

import { addDocumentResponseHeaders } from "./shopify.server";

export const streamTimeout = 5_000;

/**
 * Server entry. Streams the Remix render and lets shopify.server.ts
 * inject the headers Shopify Admin needs (CSP frame-ancestors that
 * allows the merchant's myshopify.com origin, App Bridge bridges,
 * etc.) BEFORE the response leaves the server. Without this hook the
 * embedded App refuses to render inside the Admin iframe.
 */
export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _loadContext: AppLoadContext,
) {
  addDocumentResponseHeaders(request, responseHeaders);
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";

  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          // eslint-disable-next-line no-console
          console.error(error);
          responseStatusCode = 500;
        },
      },
    );

    setTimeout(abort, streamTimeout + 1000);
  });
}
