import { AffiliateSlot } from "./AffiliateSlot";
import { siteConfig } from "@/lib/site-config";

/**
 * Below-the-generator Printify card. Sells the print-on-demand vertical
 * to the same merchant who just generated install code.
 */
export function PrintifyCard() {
  const printify = siteConfig.features.affiliates.find(
    (a) => a.provider === "printify",
  );
  if (!printify) return null;
  return (
    <AffiliateSlot
      affiliate={printify}
      variant="card"
      placement="homepage-printify-card"
      headline="Custom font + custom merch?"
      body={
        <>
          {printify.label} plugs into Shopify in one click. 900+ products,
          no inventory risk, fulfilled and shipped automatically when an
          order lands. Free to start — you only pay when you sell.
        </>
      }
      cta="Try Printify"
    />
  );
}
