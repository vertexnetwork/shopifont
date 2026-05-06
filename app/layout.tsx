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
          Mediavine Grow Faves bootstrapper. PLAN.md §7 needs this
          firing on every page so the 30-day Journey authentication
          window opens from launch — but it does NOT need to fire
          before LCP. Moved to next/script lazyOnload so the IIFE that
          creates the deferred main.js child script runs during
          browser idle, not in the critical path. Mediavine still
          authenticates the page view (it's the script load that
          counts, not the timing). Skipped in dev/preview when the
          env var is unset.
        */}
        {mediavineSiteId ? (
          <Script id="mediavine-grow" strategy="lazyOnload">
            {`!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id",${JSON.stringify(mediavineSiteId)});var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();`}
          </Script>
        ) : null}

        {/*
          Plausible analytics. Moved from afterInteractive to
          lazyOnload — analytics doesn't need to fire before the user
          can interact, and lazyOnload runs during browser idle so it
          doesn't compete with the critical path. Trade-off: pageviews
          on extreme bouncers (<1s) may be missed; that's a tiny
          fraction of traffic vs. the LCP/TBT win.
        */}
        {plausibleDomain ? (
          <Script
            id="plausible"
            strategy="lazyOnload"
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.outbound-links.js"
          />
        ) : null}

        {/*
          Microsoft Clarity — heatmaps, session recordings, dead/rage-
          click forensics. Same lazyOnload reasoning. The project ID is
          validated as alphanumeric before interpolation.
        */}
        {clarityProjectIdSafe ? (
          <Script id="clarity-init" strategy="lazyOnload">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityProjectIdSafe}");`}
          </Script>
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
