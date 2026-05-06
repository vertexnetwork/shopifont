import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { StickyMobileCta } from "@/components/Layout/StickyMobileCta";
import { SiteSchema } from "@/components/Schema/SiteSchema";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/site";

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
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: [
    "shopify custom font",
    "shopify font generator",
    "shopify @font-face",
    "shopify dawn font",
    "shopify font css",
    "settings_schema.json font",
    "shopify font picker",
    "os 2.0 typography",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: getSiteUrl(),
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    creator: "@shopifont",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1a1a1a",
};

const mediavineSiteId = process.env.NEXT_PUBLIC_MEDIAVINE_SITE_ID?.trim();
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
const clarityProjectIdSafe =
  clarityProjectId && /^[a-z0-9]+$/i.test(clarityProjectId)
    ? clarityProjectId
    : null;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <head>
        {/*
          Mediavine Grow Faves bootstrapper. Loads on every page so the
          30-day Journey authentication window starts from launch
          (PLAN.md §7). Inlined in <head> as a plain <script> — Mediavine's
          documented snippet uses an IIFE that creates a deferred child
          script (https://faves.grow.me/main.js) carrying the site ID as
          a data attribute. Skipped in dev / preview when the env var is
          unset to avoid 404s.
        */}
        {mediavineSiteId ? (
          <script
            data-grow-initializer=""
            dangerouslySetInnerHTML={{
              __html:
                "!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement(\"script\");(e.type=\"text/javascript\"),(e.src=\"https://faves.grow.me/main.js\"),(e.defer=!0),e.setAttribute(\"data-grow-faves-site-id\"," +
                JSON.stringify(mediavineSiteId) +
                ");var t=document.getElementsByTagName(\"script\")[0];t.parentNode.insertBefore(e,t);})();",
            }}
          />
        ) : null}

        {/*
          Plausible analytics with country dimension so we can monitor
          Tier-1 traffic share for future Raptive eligibility (PLAN.md §7).
        */}
        {plausibleDomain ? (
          <Script
            id="plausible"
            strategy="afterInteractive"
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.outbound-links.js"
            defer
          />
        ) : null}

        {/*
          Microsoft Clarity — heatmaps, session recordings, dead/rage-click
          forensics. The project ID is validated as alphanumeric before
          interpolation so this stays safe even though we render via
          dangerouslySetInnerHTML. Skipped when unset (dev/preview).
        */}
        {clarityProjectIdSafe ? (
          <script
            id="clarity-init"
            dangerouslySetInnerHTML={{
              __html:
                "(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src=\"https://www.clarity.ms/tag/\"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,\"clarity\",\"script\",\"" +
                clarityProjectIdSafe +
                "\");",
            }}
          />
        ) : null}

        <SiteSchema />
      </head>
      <body className="min-h-screen flex flex-col bg-paper text-charcoal">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <StickyMobileCta />
      </body>
    </html>
  );
}
