/**
 * Server-only configuration for the paid Typography Kit. NONE of these
 * carry the NEXT_PUBLIC_ prefix, so Next never inlines them into the
 * client bundle — this module must only ever be imported from route
 * handlers / server components (e.g. lib/gumroad-stats.ts via
 * app/api/founding-offer).
 *
 * Set these in Vercel project env (NOT .env.example, which is committed):
 *   GUMROAD_PRODUCT_ID    — the kit product's unique id (Gumroad →
 *                           the product → ... → "Product ID", or read it
 *                           off the API). Drives the live sales_count
 *                           lookup that powers the founder "X left"
 *                           counter.
 *   GUMROAD_ACCESS_TOKEN  — personal OAuth access token (Gumroad →
 *                           Settings → Advanced → Applications →
 *                           "Generate access token"). Read-only use here.
 *                           Server-only — never exposed to the client.
 */

export const serverConfig = {
  gumroadProductId: process.env.GUMROAD_PRODUCT_ID ?? "",
  gumroadAccessToken: process.env.GUMROAD_ACCESS_TOKEN ?? "",
} as const;

/**
 * True only when the founder offer can actually read its live count.
 * When false, getFoundingOffer() fails closed to inactive (full price),
 * so the offer simply stays dark until both env vars are set — safe to
 * ship ahead of creating the Gumroad coupon.
 */
export function isFounderConfigured(): boolean {
  return serverConfig.gumroadProductId.length > 0 && serverConfig.gumroadAccessToken.length > 0;
}
