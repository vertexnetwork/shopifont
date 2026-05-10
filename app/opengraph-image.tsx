import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default Open Graph image for the homepage and any route that doesn't
 * export its own. Brand-mark composition rendered via next/og so the
 * colors stay in sync with `siteConfig.theme.colors` without a
 * separate PNG export.
 */
export default function OpenGraphImage() {
  const bg = siteConfig.theme.colors.bg;
  const accent = siteConfig.theme.colors.accent;
  const onBg = siteConfig.theme.colors.onBg;
  const muted = siteConfig.theme.colors.muted;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px",
          background: bg,
          color: onBg,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: muted,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: -0.2,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: onBg,
              color: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "ui-monospace, Menlo, monospace",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            S
          </div>
          {siteConfig.domain}
        </div>

        <div
          style={{
            marginTop: 60,
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
            display: "flex",
            color: onBg,
          }}
        >
          {siteConfig.tagline}
        </div>

        <div
          style={{
            marginTop: 32,
            fontSize: 32,
            color: muted,
            lineHeight: 1.3,
            maxWidth: 980,
            display: "flex",
          }}
        >
          {siteConfig.description}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            color: accent,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: accent,
              display: "flex",
            }}
          />
          Free · No signup · Pure CSS
        </div>
      </div>
    ),
    { ...size },
  );
}
