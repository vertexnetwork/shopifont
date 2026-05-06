import Script from "next/script";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { StickyMobileCta } from "@/components/Layout/StickyMobileCta";
import { SiteSchema } from "@/components/Schema/SiteSchema";

/**
 * Site chrome layout. Wraps every visitor-facing page (homepage,
 * pSEO, /about, /changelog, /embed-this) with Header, Footer, the
 * mobile sticky CTA, the SiteSchema, and the three monetization /
 * analytics scripts.
 *
 * Deliberately NOT applied to /embed — that route is loaded inside
 * partner iframes and shouldn't show our nav, run our ad scripts, or
 * record session video on the host page. Keeping these scripts here
 * (instead of in the root layout) is what makes the iframe embed
 * lightweight and partner-friendly.
 *
 * Plausible is the one exception: it stays here only. /embed mounts
 * its own minimal Plausible tag so we still see "embed loaded"
 * pageviews without leaking our other scripts onto partner sites.
 */

const mediavineSiteId = process.env.NEXT_PUBLIC_MEDIAVINE_SITE_ID?.trim();
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
const clarityProjectIdSafe =
  clarityProjectId && /^[a-z0-9]+$/i.test(clarityProjectId)
    ? clarityProjectId
    : null;

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteSchema />

      {/*
        Mediavine Grow Faves bootstrapper. PLAN.md §7 needs this
        firing on every site page so the 30-day Journey authentication
        window opens from launch. Skipped on /embed by virtue of
        living in this (site) layout, not the root layout.
      */}
      {mediavineSiteId ? (
        <Script id="mediavine-grow" strategy="lazyOnload">
          {`!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id",${JSON.stringify(mediavineSiteId)});var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();`}
        </Script>
      ) : null}

      {plausibleDomain ? (
        <Script
          id="plausible"
          strategy="lazyOnload"
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.outbound-links.js"
        />
      ) : null}

      {clarityProjectIdSafe ? (
        <Script id="clarity-init" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityProjectIdSafe}");`}
        </Script>
      ) : null}

      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <StickyMobileCta />
    </>
  );
}
