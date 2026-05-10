import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";

/**
 * Parameterized OG image. Per-page routes can call
 * `/api/og?title=<title>&subtitle=<subtitle>` and embed the resulting
 * URL in their `metadata.openGraph.images` array, getting a state-
 * encoded preview without a separate PNG per page.
 *
 * Spec §3 + §6: this is the network-wide pattern for dynamic OG.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const title = (url.searchParams.get("title") ?? siteConfig.tagline).slice(0, 120);
  const subtitle = (
    url.searchParams.get("subtitle") ?? siteConfig.description
  ).slice(0, 240);

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
          padding: 72,
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
            fontSize: title.length > 60 ? 72 : 88,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
            display: "flex",
            color: onBg,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: muted,
            lineHeight: 1.3,
            maxWidth: 1000,
            display: "flex",
          }}
        >
          {subtitle}
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
          {siteConfig.name} · Free, no signup
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
