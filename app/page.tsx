import Link from "next/link";
import { ShopifontGenerator } from "@/components/Generator";
import { AdSlot } from "@/components/Layout/AdSlot";
import { HowToSchema } from "@/components/Schema/HowToSchema";
import { SoftwareApplicationSchema } from "@/components/Schema/SoftwareApplicationSchema";
import { THEMES } from "@/content/themes";

export default function HomePage() {
  return (
    <>
      <HowToSchema />
      <SoftwareApplicationSchema />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-10">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <p className="text-xs uppercase tracking-wide text-muted">
              Shopify OS 2.0 · Free, no signup
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
              Free Shopify Custom Font Generator
            </h1>
            <p className="text-base sm:text-lg text-charcoal/80 max-w-2xl">
              Conversion-optimized typography without layout shifts. Paste any
              font name, pick formats, and copy three error-free code blocks
              tailored for Shopify Dawn and every other OS 2.0 theme.
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="What you get">
              <MechanismChip step={1} label="@font-face" />
              <MechanismChip step={2} label="settings_schema.json" />
              <MechanismChip step={3} label="CSS variables" />
            </ul>
            <div className="flex flex-wrap gap-3 text-xs text-muted">
              <TrustItem>No upload — files stay in your browser</TrustItem>
              <TrustItem>Zero CLS by default</TrustItem>
              <TrustItem>Works on Dawn, Sense, Refresh, and 10 more</TrustItem>
            </div>
            <p className="lg:hidden text-sm">
              <a
                href="#tool-heading"
                className="inline-flex items-center gap-1 text-electric font-medium hover:underline"
              >
                Jump to the generator ↓
              </a>
            </p>
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
          className="grid gap-6 sm:grid-cols-3"
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
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {THEMES.map((t) => {
              const isFeatured = t.slug === "dawn";
              return (
                <li key={t.slug}>
                  <Link
                    href={`/shopify-${t.slug}-custom-font-generator`}
                    className={
                      "block px-4 py-3 rounded-md border transition-colors " +
                      (isFeatured
                        ? "border-electric bg-electric/5 hover:bg-electric/10"
                        : "border-charcoal-line/30 hover:border-electric hover:text-electric")
                    }
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{t.name}</span>
                      {isFeatured ? (
                        <span className="text-[10px] uppercase tracking-wide bg-electric text-paper px-1.5 py-0.5 rounded">
                          Most popular
                        </span>
                      ) : null}
                    </span>
                    <span className="block text-xs text-muted">{t.category}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}

function MechanismChip({ step, label }: { step: number; label: string }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric/5 px-3 py-1 text-xs sm:text-sm">
      <span
        aria-hidden
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-electric text-paper font-mono text-[11px] font-semibold"
      >
        {step}
      </span>
      <code className="font-mono">{label}</code>
    </li>
  );
}

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
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
    </span>
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
