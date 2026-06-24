import { AffiliateSlot } from "./AffiliateSlot";
import { siteConfig } from "@/lib/site-config";

/**
 * One-line Printify mention for the 13 generator-intent pSEO pages — our
 * one affiliate, kept secondary to the kit (it sits below the KitUpsell).
 * These generator pages are the highest-commercial-intent surface, where a
 * merchant most likely sells physical products.
 */
export function PrintifyInline({ prefix = "Selling physical products too?" }: { prefix?: string }) {
  const printify = siteConfig.features.affiliates.find((a) => a.provider === "printify");
  if (!printify) return null;
  return (
    <AffiliateSlot
      affiliate={printify}
      variant="inline"
      placement="pseo-printify-inline"
      headline={prefix}
      body={
        <>
          plugs into Shopify in one click — 900+ products, no inventory risk, fulfilled and shipped
          automatically when an order lands.
        </>
      }
    />
  );
}
