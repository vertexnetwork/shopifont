import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon (180×180). Rendered via next/og so the brand mark
 * stays in sync with `siteConfig.brand.markColor` without needing a
 * separate PNG export step.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: siteConfig.brand.markBgColor,
          color: siteConfig.brand.markColor,
          fontFamily:
            "ui-monospace, Menlo, monospace",
          fontWeight: 700,
          fontSize: 124,
          letterSpacing: "-0.04em",
          borderRadius: 36,
        }}
      >
        S
      </div>
    ),
    { ...size },
  );
}
