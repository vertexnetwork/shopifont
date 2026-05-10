import { AffiliateSlot } from "./AffiliateSlot";
import { siteConfig } from "@/lib/site-config";

/**
 * One-line Creative Fabrica mention for dense surfaces (pSEO use-case
 * sections, FAQ adjacencies). Less prominent than the card variant.
 */
export function CreativeFabricaInline({
  prefix = "Don't have a font yet?",
}: {
  prefix?: string;
}) {
  const cf = siteConfig.features.affiliates.find(
    (a) => a.provider === "creative-fabrica",
  );
  if (!cf) return null;
  return (
    <AffiliateSlot
      affiliate={cf}
      variant="inline"
      placement="pseo-cf-inline"
      headline={prefix}
      body={
        <>
          has 30,000+ web fonts with commercial licenses included — drop one
          into the{" "}
          <code className="font-mono text-xs">@font-face</code> block above
          and you&apos;re live.
        </>
      }
    />
  );
}
