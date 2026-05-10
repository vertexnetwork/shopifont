import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteConfig } from "@/lib/site-config";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  // App Router auto-emits <link rel="icon"> from app/icon.svg, but the
  // manual entries below stay so non-Next-aware crawlers still find a
  // favicon at the legacy /favicon.svg path during the migration.
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon-180.png", sizes: "180x180" }],
  },
  // Search-engine site verification — env-driven so tokens never land
  // in the repo. Only emitted when the corresponding env var is set.
  verification: {
    ...(siteConfig.verification.google
      ? { google: siteConfig.verification.google }
      : {}),
    ...(siteConfig.verification.bing
      ? { other: { "msvalidate.01": siteConfig.verification.bing } }
      : {}),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: siteConfig.theme.colors.onBg,
};

/**
 * Root layout. Deliberately minimal so /embed (loaded inside partner
 * iframes) and the (site) chrome can diverge cleanly. Mediavine,
 * Plausible, Clarity, Header, Footer, and the StickyMobileCta all
 * live in app/(site)/layout.tsx — they apply to every visitor-facing
 * page but NOT to /embed.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-paper text-charcoal">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
