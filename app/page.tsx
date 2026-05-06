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
              tailored for Shopify Dawn and every other OS 2.0 theme:
              {" "}
              <code className="font-mono text-sm">@font-face</code>,
              {" "}
              <code className="font-mono text-sm">settings_schema.json</code>,
              and CSS variable overrides.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-muted">
              <span>● No upload — files stay in your browser</span>
              <span>● Zero CLS by default</span>
              <span>● Works on Dawn, Sense, Refresh, and 10 more themes</span>
            </div>
          </div>
          <AdSlot id="ad-leaderboard" position="leaderboard" className="hidden lg:flex" />
        </section>

        <section aria-labelledby="tool-heading" className="flex flex-col gap-4">
          <h2 id="tool-heading" className="sr-only">
            Generator
          </h2>
          <ShopifontGenerator />
        </section>

        <AdSlot id="ad-incontent" position="in-content" />

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
            body="Type the display name and tick the formats you have on disk. WOFF2 covers ~97% of modern browsers."
          />
          <Step
            n={2}
            title="Copy three blocks"
            body="The site generates @font-face CSS, a settings_schema.json snippet, and CSS variable overrides — each with a copy button."
          />
          <Step
            n={3}
            title="Paste into Shopify"
            body="Upload the file to assets/, paste the @font-face into base.css, the JSON into settings_schema.json. Save and refresh."
          />
        </section>

        <section aria-labelledby="themes-heading" className="flex flex-col gap-4">
          <h2 id="themes-heading" className="text-2xl font-semibold tracking-tight">
            Generators for every free Shopify theme
          </h2>
          <p className="text-sm text-muted max-w-2xl">
            One generator, thirteen tailored landing pages. Each links the
            theme-specific selectors, default fonts, and Liquid injection
            point you actually need.
          </p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/shopify-${t.slug}-custom-font-generator`}
                  className="block px-4 py-3 rounded-md border border-charcoal-line/30 hover:border-electric hover:text-electric"
                >
                  <span className="font-medium">{t.name}</span>
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

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-charcoal-line/30 p-5">
      <span className="font-mono text-xs text-electric">Step 0{n}</span>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted">{body}</p>
    </div>
  );
}
