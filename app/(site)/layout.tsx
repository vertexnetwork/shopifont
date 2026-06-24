import Script from "next/script";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { StickyMobileCta } from "@/components/Layout/StickyMobileCta";
import { FounderBanner } from "@/components/Kit/FounderBanner";
import { SiteSchema } from "@/components/Schema/SiteSchema";
import { ConsentProvider } from "@/components/Consent/ConsentProvider";
import { CookieConsent } from "@/components/Consent/CookieConsent";
import { Clarity } from "@/components/Analytics/Clarity";
import { siteConfig } from "@/lib/site-config";

/**
 * Site chrome layout. Wraps every visitor-facing page (homepage, pSEO,
 * /about, /privacy, /terms, /contact, /changelog, /network, etc.).
 * Deliberately NOT applied to /embed.
 *
 * Consent gating: spec §9 requires Clarity to load only after the user
 * accepts the cookie banner. The Clarity component subscribes to
 * `useConsent()` and short-circuits render until the value is
 * "granted".
 */

// Canonical name with legacy fallback so the Vercel env-var rename can
// land without a flashed-deploy race.
const adNetwork = (process.env.NEXT_PUBLIC_AD_PROVIDER ?? process.env.NEXT_PUBLIC_AD_NETWORK)
  ?.trim()
  .toLowerCase();
const mediavineSiteId = process.env.NEXT_PUBLIC_MEDIAVINE_SITE_ID?.trim();
const adsenseClientId = (
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID
)?.trim();
const useMediavine = adNetwork === "mediavine" && Boolean(mediavineSiteId);
const useAdsense = adNetwork === "adsense" && Boolean(adsenseClientId);
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
const clarityProjectIdSafe =
  clarityProjectId && /^[a-z0-9]+$/i.test(clarityProjectId) ? clarityProjectId : null;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      {/* SiteSchema is async — it reads public/network.json to populate
          Organization.sameAs from the hub registry. */}
      {await SiteSchema()}

      {useMediavine ? (
        <Script id="mediavine-grow" strategy="lazyOnload">
          {`!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id",${JSON.stringify(mediavineSiteId)});var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();`}
        </Script>
      ) : null}

      {useAdsense ? (
        <Script
          id="adsbygoogle-bootstrap"
          strategy="lazyOnload"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
        />
      ) : null}

      {plausibleDomain ? (
        <Script
          id="plausible"
          strategy="lazyOnload"
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.outbound-links.js"
        />
      ) : null}

      {/* Consent-gated. Clarity short-circuits to null until the user
          accepts via <CookieConsent>. */}
      <Clarity projectId={clarityProjectIdSafe} />

      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {/* Cold-start scarcity strip. Self-hides unless the founder offer is
          live (env configured + spots remain), so it ships dark. */}
      <FounderBanner />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <StickyMobileCta />
      {siteConfig.features.consent.required ? <CookieConsent /> : null}
    </ConsentProvider>
  );
}
