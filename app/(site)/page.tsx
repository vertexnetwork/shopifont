import Link from "next/link";
import { KitUpsell } from "@/components/KitUpsell";
import { ShopifontAudit } from "@/components/Audit";
import { ShopifontGenerator } from "@/components/Generator";
import { HeroSpecimen } from "@/components/Hero/Specimen";
import { AdSlot } from "@/components/Layout/AdSlot";
import { LighthouseBadge } from "@/components/Layout/LighthouseBadge";
import { ProofStrip } from "@/components/Layout/ProofStrip";
import { Reveal } from "@/components/Reveal";
import { HowToSchema } from "@/components/Schema/HowToSchema";
import { SoftwareApplicationSchema } from "@/components/Schema/SoftwareApplicationSchema";
import { THEMES } from "@/content/themes";
import { BUILD_DATE_ISO, getBuildDateLabel } from "@/lib/site";

const FEATURED_SLUG = "dawn";

export default function HomePage() {
  const featured = THEMES.find((t) => t.slug === FEATURED_SLUG);
  const others = THEMES.filter((t) => t.slug !== FEATURED_SLUG);

  return (
    <>
      <HowToSchema
        name="How to install a custom font on a Shopify theme"
        description="Generate the @font-face, settings_schema, and CSS variable code for any custom font, then paste each block into your Shopify theme."
        totalTime="PT5M"
        supply={["Custom font file (WOFF2 recommended)", "Shopify theme code editor access"]}
        steps={[
          {
            name: "Enter your font name and select formats",
            text: "Type your font's display name and tick the format checkboxes for the files you have. WOFF2 covers ~97% of modern browsers.",
          },
          {
            name: "Copy the three generated blocks",
            text: "The site outputs three code blocks: the @font-face CSS, a settings_schema.json snippet, and a CSS-variable override. Each has its own copy button.",
          },
          {
            name: "Paste into your Shopify theme",
            text: "Upload the font file to assets/, paste the @font-face into base.css, the JSON into settings_schema.json, and append the CSS variables. Save and refresh.",
          },
        ]}
      />
      <SoftwareApplicationSchema />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-12">
        {/*
         * Hero. Single-sentence value prop, falsifiable proof strip,
         * mini code preview, and a primary above-the-fold CTA so
         * mobile users see the Single Most Important Action without
         * scrolling. The leaderboard ad sits in the hero row on
         * desktop only — Mediavine's standard above-the-fold
         * placement; mobile keeps the column undivided.
         */}
        <section className="relative isolate grid gap-6 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_320px]">
          <div aria-hidden className="hero-radial" />
          <div className="min-w-0 flex flex-col gap-5">
            <SignupChip />
            <h1
              id="hero-anchor"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.02] font-system"
            >
              Does your store look like every other Shopify store?
            </h1>
            <p className="text-base sm:text-lg text-charcoal/80 max-w-2xl">
              It&apos;s usually the fonts — most stores never change the theme default, so they all
              read the same. Take the free 30-second typography audit and see exactly what&apos;s
              making your store look stock, plus the one change that fixes it.
            </p>
            <HeroSpecimen />
            <ProofStrip />
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#audit"
                className="group inline-flex items-center justify-center min-h-[3.25rem] px-6 rounded-md bg-electric text-paper font-semibold text-base shadow-cta hover:bg-electric-hover"
              >
                Take the 30-second audit
                <ArrowDown className="ml-2 w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </a>
              <Link
                href="#tool-heading"
                className="inline-flex items-center justify-center min-h-[3.25rem] px-4 rounded-md border border-charcoal-line/50 text-charcoal hover:border-electric hover:text-electric transition-colors"
              >
                I already know my font
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
              <TrustItem>No upload — files stay in your browser</TrustItem>
              <TrustItem>Works on Dawn, Sense, Refresh, and 10 more</TrustItem>
              <TrustItem>Pure CSS output — no JS in your store</TrustItem>
            </ul>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted">
              <span>
                Updated{" "}
                <time dateTime={BUILD_DATE_ISO} className="text-charcoal/80">
                  {getBuildDateLabel()}
                </time>{" "}
                · Built for Shopify Dawn 14
              </span>
              <span aria-hidden className="text-charcoal-line/60">
                ·
              </span>
              <LighthouseBadge />
            </div>
            <p className="text-[11px] text-muted max-w-xl">
              Verify the &ldquo;no upload&rdquo; claim in DevTools → Network: dropping a font file
              makes zero requests.
            </p>
          </div>
          <AdSlot id="ad-leaderboard" position="leaderboard" className="hidden lg:flex" />
        </section>

        {/*
         * The audit is the new top-of-funnel surface. Search demand is
         * decision/taste ("best shopify fonts," "font pairings") — visitors
         * who haven't chosen a font yet. The generator answers a question
         * almost nobody searches (how to install). So the audit leads: it
         * reveals the personal problem (you read as stock) and routes to the
         * fix (a kit), with the generator kept below as the DIY step.
         */}
        <section id="audit" aria-label="Typography audit" className="scroll-mt-20">
          <ShopifontAudit />
        </section>

        <section aria-labelledby="tool-heading" className="flex flex-col gap-3 scroll-mt-20">
          <div className="flex flex-col gap-1">
            <h2 id="tool-heading" className="text-2xl font-bold tracking-tight">
              Already picked your font? Generate the install code
            </h2>
            <p className="text-sm text-muted max-w-2xl">
              Paste a font name and copy three error-free blocks — the{" "}
              <code className="font-mono text-xs">@font-face</code> CSS, the settings_schema.json
              snippet, and the CSS-variable override — tailored to Shopify Dawn and every other OS
              2.0 theme. The implementation step, free.
            </p>
          </div>
          <ShopifontGenerator />
        </section>

        {/*
         * Typography Kit upsell. Keystone placement: directly under
         * the generated code blocks, the single highest-friction
         * moment — they have working code but still own the font
         * decision and the hand-paste. Sits ABOVE the affiliate
         * because the person who just generated code is at peak
         * "is there a done version of this?" intent. Renders nothing
         * until the Gumroad URL is set (ships dark).
         */}
        <KitUpsell variant="post-generator" />

        {/*
         * No affiliate cards on the homepage. The home page is the top
         * of the PAID funnel (audit → kit); per the network affiliate
         * guide §10, affiliates belong on research / pSEO surfaces only,
         * never the funnel, where a competing card under the kit upsell
         * splits the click and reads as a link farm. Printify lives on
         * the pSEO generator pages + /recommendations instead.
         */}

        {/*
         * Chrome extension promo. Placed adjacent to the affiliate
         * card because both target the same "user just generated code
         * and is at peak engagement" moment, but the extension is the
         * higher-intent ask: it asks for an install, not just a
         * click-out. Routing through /extension (not directly to the
         * Web Store) gives users context, lets the landing page do
         * the conversion work, and accrues SEO equity to the site.
         */}
        {/* Chrome extension promo. Hidden on mobile — Chrome extensions
            don't install on phones, so mobile visitors who tap "Get the
            extension" hit a dead end. Desktop-only keeps the card
            useful for users who CAN install it. */}
        <Reveal>
          <section
            aria-labelledby="ext-card-heading"
            className="hidden lg:block rounded-lg border border-electric/30 bg-gradient-to-br from-electric/[0.06] via-electric/[0.02] to-transparent p-5 sm:p-6 shadow-card"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex flex-col gap-2">
                <p className="inline-flex items-center gap-1.5 self-start rounded-full bg-electric/15 text-electric px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold">
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-electric" />
                  New · Free Chrome extension
                </p>
                <h2 id="ext-card-heading" className="text-xl sm:text-2xl font-bold tracking-tight">
                  Use the generator without leaving your tab
                </h2>
                <p className="text-sm sm:text-base text-charcoal/80 max-w-2xl">
                  The {""}
                  <Link href="/extension" className="text-electric hover:underline">
                    Shopifont Chrome extension
                  </Link>{" "}
                  generates the same three code blocks from a popup — built for the moment
                  you&apos;re already in the Shopify admin and don&apos;t want to tab-switch.
                </p>
              </div>
              <Link
                href="/extension"
                className="group inline-flex items-center justify-center self-start sm:self-center min-h-[2.75rem] px-5 rounded-md bg-electric text-paper font-semibold text-sm shadow-cta hover:bg-electric-hover whitespace-nowrap"
              >
                Get the extension
                <span
                  aria-hidden
                  className="ml-1.5 transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section
            id="how-it-works"
            aria-labelledby="how-heading"
            className="grid gap-6 sm:grid-cols-3 scroll-mt-20"
          >
            <h2 id="how-heading" className="sr-only">
              How it works
            </h2>
            <Step
              n={1}
              title="Enter your font"
              body="Type the display name and tick the formats your foundry sent you. WOFF2 covers ~97% of modern browsers."
            />
            <Step
              n={2}
              title="Copy three blocks"
              body="The site generates @font-face CSS, a settings_schema.json snippet, and CSS variable overrides — each with a copy button."
            />
            <Step
              n={3}
              title="Paste into Shopify"
              body="Upload the file to your theme's Assets folder, paste the @font-face into base.css, the JSON into settings_schema.json. Save and refresh."
            />
          </section>
        </Reveal>

        <AdSlot id="ad-incontent" position="in-content" />

        <Reveal>
          <section
            id="themes"
            aria-labelledby="themes-heading"
            className="flex flex-col gap-4 scroll-mt-20"
          >
            <h2 id="themes-heading" className="text-2xl font-bold tracking-tight">
              Generators for every free Shopify theme
            </h2>
            <p className="text-sm text-muted max-w-2xl">
              One generator, thirteen tailored landing pages. Each links the theme-specific
              selectors, default fonts, and Liquid injection point you actually need.
            </p>

            {featured ? (
              <Link
                href={`/shopify-${featured.slug}-custom-font-generator`}
                className="group block rounded-lg border border-electric/60 bg-gradient-to-br from-electric/[0.08] via-electric/[0.04] to-transparent p-5 sm:p-6 shadow-featured"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span
                      aria-hidden
                      className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-electric text-paper font-mono text-lg badge-glow"
                    >
                      Aa
                    </span>
                    <div>
                      <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-soft text-amber-deep px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber" />
                        Most popular · ~70% of new Shopify stores
                      </p>
                      <p className="mt-1 text-lg sm:text-xl font-semibold tracking-tight">
                        {featured.name} Custom Font Generator
                      </p>
                      <p className="text-xs text-muted">{featured.category}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center self-start sm:self-center min-h-[2.5rem] px-4 rounded-md bg-electric text-paper font-medium text-sm group-hover:bg-electric-hover transition-colors">
                    Open generator
                    <span
                      aria-hidden
                      className="ml-1.5 transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ) : null}

            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {others.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/shopify-${t.slug}-custom-font-generator`}
                    className="block px-4 py-3 rounded-md border border-charcoal-line/30 hover:border-electric hover:text-electric transition-colors"
                  >
                    <span className="font-medium block">{t.name} font generator</span>
                    <span className="block text-xs text-muted">{t.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      </div>
    </>
  );
}

function ArrowDown({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3v10M4 9l4 4 4-4" />
    </svg>
  );
}

function SignupChip() {
  return (
    <p className="inline-flex items-center gap-2 self-start rounded-full bg-paper-dim px-3 py-1 text-xs">
      <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-electric" />
      <span className="font-medium text-charcoal">Free, no signup</span>
      <span aria-hidden className="text-charcoal-line/60">
        ·
      </span>
      <span className="text-muted">Shopify OS 2.0</span>
    </p>
  );
}

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="w-3.5 h-3.5 text-electric shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 8.5l3.5 3.5L13 5" />
      </svg>
      {children}
    </li>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-charcoal-line/30 p-5 shadow-card">
      <span className="font-mono text-xs text-electric">Step 0{n}</span>
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted">{body}</p>
    </div>
  );
}
