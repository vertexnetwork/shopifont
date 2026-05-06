import Link from "next/link";
import { ShopifontGenerator } from "@/components/Generator";
import { AdSlot } from "@/components/Layout/AdSlot";
import { ProofStrip } from "@/components/Layout/ProofStrip";
import { HowToSchema } from "@/components/Schema/HowToSchema";
import { SoftwareApplicationSchema } from "@/components/Schema/SoftwareApplicationSchema";
import { THEMES } from "@/content/themes";

const FEATURED_SLUG = "dawn";

export default function HomePage() {
  const featured = THEMES.find((t) => t.slug === FEATURED_SLUG);
  const others = THEMES.filter((t) => t.slug !== FEATURED_SLUG);

  return (
    <>
      <HowToSchema />
      <SoftwareApplicationSchema />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-12">
        {/*
         * Hero. Single-sentence value prop, falsifiable proof strip,
         * and a primary above-the-fold CTA so mobile users see the
         * Single Most Important Action without scrolling. The
         * leaderboard ad sits in the hero row on desktop only — this
         * is Mediavine's standard above-the-fold placement; mobile
         * keeps the hero column undivided so the CTA stays primary.
         */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-5">
            <SignupChip />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.05]">
              Free Shopify Custom Font Generator
            </h1>
            <p className="text-base sm:text-lg text-charcoal/80 max-w-2xl">
              Paste a font name. Copy three error-free code blocks tailored
              to Shopify Dawn and every other OS 2.0 theme.
            </p>
            <ProofStrip />
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#tool-heading"
                className="inline-flex items-center justify-center min-h-[var(--spacing-touch)] px-5 rounded-md bg-electric text-paper font-medium hover:bg-electric-hover transition-colors"
              >
                Generate my font code
                <ArrowDown className="ml-2 w-4 h-4" />
              </a>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center min-h-[var(--spacing-touch)] px-4 rounded-md border border-charcoal-line/50 text-charcoal hover:border-electric hover:text-electric transition-colors"
              >
                How it works
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
              <NoUploadDetail />
              <TrustItem>Works on Dawn, Sense, Refresh, and 10 more</TrustItem>
              <TrustItem>Pure CSS output — no JS in your store</TrustItem>
            </ul>
          </div>
          <AdSlot id="ad-leaderboard" position="leaderboard" className="hidden lg:flex" />
        </section>

        <section aria-labelledby="tool-heading" className="flex flex-col gap-4">
          <h2 id="tool-heading" className="sr-only">
            Generator
          </h2>
          <ShopifontGenerator />
        </section>

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

        <AdSlot id="ad-incontent" position="in-content" />

        <section
          id="themes"
          aria-labelledby="themes-heading"
          className="flex flex-col gap-4 scroll-mt-20"
        >
          <h2 id="themes-heading" className="text-2xl font-semibold tracking-tight">
            Generators for every free Shopify theme
          </h2>
          <p className="text-sm text-muted max-w-2xl">
            One generator, thirteen tailored landing pages. Each links the
            theme-specific selectors, default fonts, and Liquid injection
            point you actually need.
          </p>

          {featured ? (
            <Link
              href={`/shopify-${featured.slug}-custom-font-generator`}
              className="group block rounded-lg border border-electric bg-electric/5 hover:bg-electric/10 transition-colors p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-electric text-paper font-mono text-base">
                    Aa
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-electric font-semibold">
                      Most popular · ~70% of new Shopify stores
                    </p>
                    <p className="text-lg font-semibold tracking-tight">
                      {featured.name} Custom Font Generator
                    </p>
                    <p className="text-xs text-muted">{featured.category}</p>
                  </div>
                </div>
                <span className="inline-flex items-center text-electric font-medium text-sm group-hover:translate-x-0.5 transition-transform">
                  Open generator →
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
                  <span className="font-medium block">
                    {t.name} font generator
                  </span>
                  <span className="block text-xs text-muted">{t.category}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
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
      <span aria-hidden className="text-charcoal-line/60">·</span>
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

function NoUploadDetail() {
  return (
    <li>
      <details className="group inline-flex items-baseline gap-1.5">
        <summary className="inline-flex items-center gap-1.5 cursor-pointer list-none">
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
          <span className="underline decoration-dotted underline-offset-2 group-open:no-underline">
            No upload — files stay in your browser
          </span>
        </summary>
        <span className="ml-1 text-muted">
          Preview uses the FontFace API on a blob URL; there is no upload
          endpoint. Verify in DevTools → Network on file drop.
        </span>
      </details>
    </li>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-charcoal-line/30 p-5">
      <span className="font-mono text-xs text-electric">Step 0{n}</span>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted">{body}</p>
    </div>
  );
}
