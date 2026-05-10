import { AffiliateSlot } from "./AffiliateSlot";
import { siteConfig } from "@/lib/site-config";

/**
 * Below-the-generator Creative Fabrica card. Same conversion shell as
 * `<AffiliateSlot variant="card" />`; copy is product-specific (font
 * marketplace pitch) so it lives here as a thin wrapper.
 */
export function CreativeFabricaCard() {
  const cf = siteConfig.features.affiliates.find(
    (a) => a.provider === "creative-fabrica",
  );
  if (!cf) return null;
  return (
    <AffiliateSlot
      affiliate={cf}
      variant="card"
      placement="homepage-cf-card"
      headline="Don't have a font yet?"
      body={
        <>
          {cf.label} has 30,000+ web fonts with commercial licenses included
          — ready to drop into the{" "}
          <code className="font-mono text-sm">@font-face</code> block this
          site generates. Most are under $20, and the all-access subscription
          unlocks the full library.
        </>
      }
      cta="Browse Creative Fabrica"
    />
  );
}
