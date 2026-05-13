import { siteConfig } from "@/lib/site-config";
import { AutoPrint } from "./AutoPrint";

export const dynamic = "force-static";

/**
 * The six-axis font-pairing checklist sheet. Designed to print cleanly
 * to A4 / Letter at default browser margins. Reachable both on the
 * web (visitors who clicked the email "open in browser" link) and via
 * the email's "open and save as PDF" link which appends `?format=pdf`
 * so the print dialog opens automatically on load.
 *
 * Content mirrors the six axes the marketing landing at
 * /font-pairing-checklist promises (brand fit / heading×body contrast /
 * x-height harmony / weight availability / performance budget /
 * licensing for ecommerce). Each axis carries:
 *   1. A short "What to check" question
 *   2. The "Why it matters" rationale (one sentence)
 *   3. A "Quick test" the merchant can run in under 60 seconds
 *   4. A printable checkbox
 */

type Axis = {
  index: number;
  title: string;
  question: string;
  why: string;
  quickTest: string;
};

const AXES: ReadonlyArray<Axis> = [
  {
    index: 1,
    title: "Brand fit",
    question:
      "Does the typeface category match the voice the storefront speaks in?",
    why:
      "Geometric sans (Inter, Mona Sans) reads modern + neutral. Humanist sans (Karla, Lato) reads friendly + warm. Display serif (Playfair, DM Serif) reads premium + traditional. Pick the category before picking the font.",
    quickTest:
      'Write your three best-selling product names in the candidate font. If the names feel like the product, you have brand fit. If they feel like someone else\'s product, keep looking.',
  },
  {
    index: 2,
    title: "Heading × body contrast",
    question:
      "Is there enough visual difference between the heading and body fonts to create hierarchy — but not so much that they look like they came from different sites?",
    why:
      "Pairings fail at both ends. Two near-identical fonts produce mush; two wildly different fonts produce dissonance. The sweet spot is one obvious axis of contrast (weight, category, or width) while everything else stays compatible.",
    quickTest:
      "Set a 32-point heading in the candidate heading font and 16-point body underneath in the body font. Squint until the text blurs. You should still see a clear hierarchy between heading and body. If both blurs look identical, contrast is too low.",
  },
  {
    index: 3,
    title: "X-height harmony",
    question:
      "Do the heading and body fonts share roughly the same x-height ratio so they don't visually fight at the same size?",
    why:
      "Fonts with mismatched x-heights make a storefront look amateur even when each typeface alone is great. The body font with a tall x-height paired with a heading font with a short one (or vice versa) reads as a typographic accident.",
    quickTest:
      'Set the heading and body fonts at the same point size, side by side, with the lowercase word "modern" in each. If one set of letters is noticeably taller than the other at the same size, the x-heights don\'t match — try a different pairing.',
  },
  {
    index: 4,
    title: "Weight availability",
    question:
      "Does the font ship every weight you plan to use, in both regular and italic?",
    why:
      "Body copy usually needs Regular (400) + Bold (700) + Italic. Headings often need 600 or 700. If a candidate font only ships Regular + Light, you'll fake the bold via the browser — and faux-bold rendering is the single biggest tell that a brand is on a budget.",
    quickTest:
      "Open the foundry's listing. Confirm every weight you need exists as its own file. Bonus: confirm italic is a TRUE italic (drawn by the designer), not an oblique slant the browser computes.",
  },
  {
    index: 5,
    title: "Performance budget",
    question:
      "Will the total font payload stay under 200 KB WOFF2 across all faces a visitor's first paint needs?",
    why:
      "Every font file pushes Largest Contentful Paint later. Three weights × WOFF2-only × ~30 KB each is the safe ceiling for a Shopify storefront that wants to stay in the Lighthouse green. Subset (`unicode-range`) and `font-display: swap` are your two best tools.",
    quickTest:
      "Add the WOFF2 file sizes for every face your hero + product card needs. If the total is over 200 KB, drop a weight (do you really need 300 AND 400?), or switch to a variable font, or accept that you're trading LCP for design.",
  },
  {
    index: 6,
    title: "Licensing for ecommerce",
    question:
      "Does the web license cover commercial use on a public Shopify storefront, including the ad surfaces you run?",
    why:
      "Web fonts often have separate licenses for self-hosting, ad creative, packaging, and merchandise. \"Free for personal use\" almost never covers a paid storefront. A misread license is the most expensive kind of typography mistake.",
    quickTest:
      "Confirm three things on the license page: (a) commercial use is permitted, (b) the license covers self-hosting via @font-face on your domain, (c) the monthly pageview cap (if any) exceeds your actual traffic. Screenshot the license page and save it with your brand assets.",
  },
];

export default function ChecklistSheetPage() {
  return (
    <>
      <AutoPrint />
      <div className="checklist-sheet bg-white text-black min-h-screen">
        <PrintCss />
        <main className="mx-auto max-w-[760px] px-8 py-10 print:px-0 print:py-0">
          <Header />
          <Intro />
          <ol className="mt-8 flex flex-col gap-6 list-none p-0">
            {AXES.map((axis) => (
              <AxisRow key={axis.index} axis={axis} />
            ))}
          </ol>
          <Footer />
        </main>
      </div>
    </>
  );
}

function Header() {
  return (
    <header className="border-b-2 border-black pb-4 flex items-baseline justify-between gap-4 flex-wrap">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-600">
          {siteConfig.name}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight leading-tight">
          The Shopify Font-Pairing Checklist
        </h1>
        <p className="mt-1 text-sm text-neutral-700">
          Six axes for confirming a font combo before you ship it.
        </p>
      </div>
      <p className="text-[11px] text-neutral-600 font-mono">
        {siteConfig.domain}
      </p>
    </header>
  );
}

function Intro() {
  return (
    <section className="mt-6 text-sm leading-relaxed text-neutral-800">
      <p>
        <strong>How to use this:</strong> work through the six axes
        below in order with your two candidate fonts (heading + body)
        in front of you. Check the box once you&apos;re satisfied the
        pairing passes that axis. A pairing that passes all six is
        ready for production. A pairing that fails one or two is
        salvageable with a different weight or a small size adjustment.
        A pairing that fails three or more — try a different pairing.
      </p>
    </section>
  );
}

function AxisRow({ axis }: { axis: Axis }) {
  return (
    <li className="grid grid-cols-[2rem_1fr] gap-x-4 gap-y-1 break-inside-avoid">
      <Checkbox />
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-bold tracking-tight">
          <span className="font-mono text-neutral-500 mr-2">
            {String(axis.index).padStart(2, "0")}
          </span>
          {axis.title}
        </h2>
        <p className="text-sm leading-relaxed">
          <strong className="font-semibold">What to check.</strong>{" "}
          {axis.question}
        </p>
        <p className="text-sm leading-relaxed text-neutral-700">
          <strong className="font-semibold text-black">Why it matters.</strong>{" "}
          {axis.why}
        </p>
        <p className="text-sm leading-relaxed">
          <strong className="font-semibold">Quick test.</strong>{" "}
          {axis.quickTest}
        </p>
      </div>
    </li>
  );
}

function Checkbox() {
  return (
    <span
      aria-hidden
      className="inline-block w-6 h-6 border-2 border-black rounded-[3px] mt-1"
    />
  );
}

function Footer() {
  return (
    <footer className="mt-10 pt-6 border-t border-neutral-300 flex flex-col gap-3 text-sm text-neutral-700">
      <div className="grid grid-cols-2 gap-4 text-[12px]">
        <p>
          <strong className="block uppercase tracking-wide text-[10px] text-neutral-500">
            Store
          </strong>
          <span className="inline-block min-w-[12rem] border-b border-neutral-400 pb-[2px]">
            &nbsp;
          </span>
        </p>
        <p>
          <strong className="block uppercase tracking-wide text-[10px] text-neutral-500">
            Date reviewed
          </strong>
          <span className="inline-block min-w-[12rem] border-b border-neutral-400 pb-[2px]">
            &nbsp;
          </span>
        </p>
      </div>
      <p className="text-[12px] text-neutral-600 leading-relaxed">
        Generated by{" "}
        <strong className="text-black">{siteConfig.name}</strong> —{" "}
        the free generator that turns a font name into the three
        copy-paste code blocks you need to install a custom font on a
        Shopify OS 2.0 theme. Visit{" "}
        <span className="font-mono">{siteConfig.domain}</span>.
      </p>
    </footer>
  );
}

/**
 * Print stylesheet inlined into the page so we don't have to thread a
 * separate CSS file through the build. Sets A4-ish page size, removes
 * the page padding for print (the on-screen padding belongs on screen
 * only), and ensures the checkboxes + box backgrounds print at full
 * opacity even when "background graphics" is off in the print dialog.
 *
 * Rendered as a server `<style>` tag so it ships in the initial HTML.
 */
function PrintCss() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
@page { size: auto; margin: 14mm; }
@media print {
  html, body { background: #ffffff !important; }
  .checklist-sheet { padding: 0 !important; }
  .checklist-sheet h1 { font-size: 22pt; }
  .checklist-sheet h2 { font-size: 13pt; }
  .checklist-sheet, .checklist-sheet * { color: #000 !important; }
  .checklist-sheet a { text-decoration: underline; }
  /* Don't break an axis row across pages mid-sentence. */
  .checklist-sheet li { break-inside: avoid; }
}
`,
      }}
    />
  );
}
