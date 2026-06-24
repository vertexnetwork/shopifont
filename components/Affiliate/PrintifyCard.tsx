import { AffiliateSlot } from "./AffiliateSlot";
import { siteConfig } from "@/lib/site-config";

/**
 * Below-the-generator Printify card. Sells the print-on-demand vertical
 * to the same merchant who just generated install code. Used on the pSEO
 * generator pages (below the kit upsell, so it stays secondary to the
 * owned product) and on /recommendations. `placement` distinguishes the
 * surfaces in click telemetry.
 */
export function PrintifyCard({ placement = "printify-card" }: { placement?: string }) {
  const printify = siteConfig.features.affiliates.find((a) => a.provider === "printify");
  if (!printify) return null;
  return (
    <AffiliateSlot
      affiliate={printify}
      variant="card"
      placement={placement}
      headline="Custom font + custom merch?"
      body={
        <>
          {printify.label} plugs into Shopify in one click. 900+ products, no inventory risk,
          fulfilled and shipped automatically when an order lands. Free to start — you only pay when
          you sell.
        </>
      }
      cta="Try Printify"
    />
  );
}
