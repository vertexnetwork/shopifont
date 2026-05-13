import { siteConfig } from "@/lib/site-config";
import { AutoPrint } from "./AutoPrint";

export const dynamic = "force-static";

/**
 * Printable six-axis font-pairing checklist. Designed for one-page A4
 * / Letter output at default browser print margins.
 *
 * Design rules (every change must respect):
 *   - Single-page target. Total body copy is ≤250 words so the sheet
 *     fits comfortably at 10pt body / 18pt h1 with 14mm margins.
 *   - Pure black text on white. Small grays (≤11pt) print as illegible
 *     fuzz on cheap inkjets; the sheet has to be readable from any
 *     printer.
 *   - Each axis = checkbox + 1-line "Check" sentence + 1-line "Test"
 *     sentence. Anything longer belongs on the marketing landing at
 *     /font-pairing-checklist, not on the working checklist.
 *   - Write-in fields at the top (Store / Date / Heading candidate /
 *     Body candidate) so a designer can use the same sheet across
 *     multiple font reviews without printing fresh copies.
 */

type Axis = {
  index: number;
  title: string;
  check: string;
  test: string;
};

const AXES: ReadonlyArray<Axis> = [
  {
    index: 1,
    title: "Brand fit",
    check:
      "Typeface category (geometric / humanist / display) matches the voice your storefront speaks in.",
    test:
      "Set your three best-selling product names in the candidate. If the names feel like the product, brand fit passes.",
  },
  {
    index: 2,
    title: "Heading × body contrast",
    check:
      "Enough visual difference for clear hierarchy, not so much the two fonts look like they came from different sites.",
    test:
      "Render 32pt heading over 16pt body, squint until both blur. Heading should still read as larger / heavier / distinct.",
  },
  {
    index: 3,
    title: "X-height harmony",
    check:
      "Heading and body fonts share a similar x-height ratio at the same point size.",
    test:
      "Render the lowercase word “modern” in each font at the same size, side by side. Neither should be noticeably taller.",
  },
  {
    index: 4,
    title: "Weight availability",
    check:
      "Every weight you ship has its own file. Italics are drawn by the designer, not synthesized by the browser.",
    test:
      "Open the foundry’s spec sheet. Confirm Regular, Bold, and Italic exist as distinct files (and Bold-Italic if you need it).",
  },
  {
    index: 5,
    title: "Performance budget",
    check:
      "Total WOFF2 payload across every face used above the fold stays under ~200 KB.",
    test:
      "Sum the WOFF2 file sizes for the faces your hero + product card actually render. Over 200 KB → drop a weight or switch to a variable font.",
  },
  {
    index: 6,
    title: "Licensing for ecommerce",
    check:
      "Web license covers commercial use on a public Shopify storefront, including any ad surfaces.",
    test:
      "Confirm three things on the license page: commercial use permitted, self-hosting via @font-face on your domain, pageview cap exceeds your traffic. Screenshot the page.",
  },
];

export default function ChecklistSheetPage() {
  return (
    <>
      <AutoPrint />
      <PrintCss />
      <div className="checklist-sheet bg-white text-black min-h-screen">
        <main className="mx-auto max-w-[760px] px-8 py-10 print:px-0 print:py-0">
          <Header />
          <WriteInFields />
          <ol className="axes mt-5 flex flex-col list-none p-0">
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
    <header className="header flex items-baseline justify-between gap-4 flex-wrap pb-3 border-b border-black">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
          The Shopify Font-Pairing Checklist
        </h1>
        <p className="mt-1 text-sm">
          Six axes for confirming a font combo before you ship it. Check
          each box once the pair passes that axis.
        </p>
      </div>
      <p className="text-[11px] font-mono">{siteConfig.domain}</p>
    </header>
  );
}

function WriteInFields() {
  return (
    <section
      aria-label="Sheet metadata"
      className="write-in grid grid-cols-2 gap-x-6 gap-y-3 mt-5 text-[11px]"
    >
      <Field label="Store" />
      <Field label="Date" />
      <Field label="Heading font candidate" />
      <Field label="Body font candidate" />
    </section>
  );
}

function Field({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="uppercase tracking-wide font-semibold">{label}</span>
      <span className="block h-[1.25rem] border-b border-black" />
    </div>
  );
}

function AxisRow({ axis }: { axis: Axis }) {
  return (
    <li className="axis grid grid-cols-[1.5rem_1fr] gap-x-3 py-2.5 border-b border-black/15 break-inside-avoid last:border-b-0">
      <Checkbox />
      <div className="flex flex-col gap-1">
        <h2 className="text-[13px] font-bold leading-snug">
          <span className="font-mono mr-2 text-black/70">
            {String(axis.index).padStart(2, "0")}
          </span>
          {axis.title}
        </h2>
        <p className="text-[11.5px] leading-snug">
          <strong className="font-semibold">Check.</strong> {axis.check}
        </p>
        <p className="text-[11.5px] leading-snug">
          <strong className="font-semibold">Test.</strong> {axis.test}
        </p>
      </div>
    </li>
  );
}

function Checkbox() {
  return (
    <span
      aria-hidden
      className="checkbox inline-block w-[1.1rem] h-[1.1rem] border-[1.5px] border-black rounded-[3px] mt-[2px]"
    />
  );
}

function Footer() {
  return (
    <footer className="footer mt-4 pt-3 border-t border-black/40 text-[10px] flex items-baseline justify-between gap-3 flex-wrap">
      <p>
        A pairing that passes all six is ready for production. Three or
        more fails → try a different pairing.
      </p>
      <p className="font-mono">
        Generated by <strong>{siteConfig.name}</strong> · {siteConfig.domain}
      </p>
    </footer>
  );
}

/**
 * Print stylesheet. Inlined as a server `<style>` so it ships in the
 * initial HTML and applies before the first frame is rastered to PDF.
 *
 * Goals:
 *   - A4 / Letter portrait, 14mm margins.
 *   - Pure black text everywhere; no Tailwind `text-black/15` grays
 *     leak through. Borders and the checkbox keep their strokes.
 *   - Compact pt-sized typography so the whole sheet fits on one page
 *     regardless of the user's browser zoom or default font.
 *   - `break-inside: avoid` on every axis row so no axis splits across
 *     a page boundary.
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
  .checklist-sheet, .checklist-sheet p, .checklist-sheet li, .checklist-sheet span, .checklist-sheet strong, .checklist-sheet h1, .checklist-sheet h2 { color: #000 !important; }
  .checklist-sheet .header { border-bottom-color: #000 !important; }
  .checklist-sheet .axis { border-bottom-color: rgba(0,0,0,0.15) !important; }
  .checklist-sheet .footer { border-top-color: rgba(0,0,0,0.4) !important; }
  .checklist-sheet .checkbox { border-color: #000 !important; }
  .checklist-sheet h1 { font-size: 18pt; line-height: 1.15; }
  .checklist-sheet .header p { font-size: 9.5pt; line-height: 1.35; }
  .checklist-sheet .write-in { font-size: 9pt; }
  .checklist-sheet .axis h2 { font-size: 11pt; }
  .checklist-sheet .axis p { font-size: 9.5pt; line-height: 1.35; }
  .checklist-sheet .footer { font-size: 8.5pt; }
  .checklist-sheet .axis { break-inside: avoid; }
  .checklist-sheet a[href]::after { content: none !important; }
}
`,
      }}
    />
  );
}
