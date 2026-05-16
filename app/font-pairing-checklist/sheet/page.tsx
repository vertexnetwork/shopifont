import { siteConfig } from "@/lib/site-config";
import { AutoPrint } from "./AutoPrint";

export const dynamic = "force-static";

/**
 * Printable font-pairing lead magnet. Two pages, Letter portrait,
 * 0.6in margins:
 *   - Page 1: the six-axis working checklist (process tool).
 *   - Page 2: a standalone reference card — proven pairings, a safe
 *     single-font default, and the three rules that kill most pairings
 *     (desk reference). Page 2 is what makes this worth an email; a
 *     bare checklist isn't.
 *
 * Design rules (every change must respect):
 *   - Two-page target, hard page break before the reference card. Each
 *     page must fit on its own sheet at the pt scale set in PrintCss —
 *     no axis or pairing may split across a page boundary.
 *   - Page 2's content stays in lock-step with the public
 *     /shopify-font-pairings guide. The lead magnet and the site must
 *     never recommend contradictory pairings.
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

type Pairing = {
  heading: string;
  body: string;
  use: string;
};

/**
 * Proven starting pairings. Kept in lock-step with the public
 * /shopify-font-pairings guide so the lead magnet and the site never
 * contradict each other. These are the five we'd reach for unprompted;
 * each is free, SIL OFL / Apache 2.0, self-hostable as WOFF2.
 */
const PAIRINGS: ReadonlyArray<Pairing> = [
  {
    heading: "Fraunces",
    body: "Inter",
    use: "Premium / fashion / food — modern serif headline, neutral body.",
  },
  {
    heading: "Playfair Display",
    body: "Lato",
    use: "Classic luxury — beauty, jewelry, upmarket apparel.",
  },
  {
    heading: "Montserrat",
    body: "Open Sans",
    use: "Friendly DTC — skincare, supplements, lifestyle.",
  },
  {
    heading: "Outfit",
    body: "Public Sans",
    use: "Tech-leaning — electronics, smart home, accessories.",
  },
  {
    heading: "Poppins",
    body: "Poppins",
    use: "Single family, smallest budget — hardest to get wrong.",
  },
];

const HARD_RULES: ReadonlyArray<string> = [
  "Never pair two display faces — they fight for attention instead of building hierarchy.",
  "Never pair two fonts from the same category (two geometric sans look identical — doubled file weight, zero gain).",
  "Keep total WOFF2 above the fold under 200 KB and always ship font-display: swap.",
];

export default function ChecklistSheetPage() {
  return (
    <>
      <AutoPrint />
      <PrintCss />
      <div className="checklist-sheet bg-white text-black min-h-screen">
        <main className="mx-auto max-w-[760px] px-8 py-10 print:max-w-none print:w-full print:p-0 print:m-0">
          <Header />
          <WriteInFields />
          <ol className="axes mt-5 flex flex-col list-none p-0">
            {AXES.map((axis) => (
              <AxisRow key={axis.index} axis={axis} />
            ))}
          </ol>
          <Footer />
          <ReferenceCard />
        </main>
      </div>
    </>
  );
}

/**
 * Page 2 — a standalone reference card. Turns the deliverable from a
 * blank checklist into something a designer keeps on the desk: the
 * five pairings that pass all six axes out of the box, a safe
 * single-font default, and the three rules that kill most pairings.
 */
function ReferenceCard() {
  return (
    <section className="reference-card mt-0">
      <header className="ref-header pb-3 border-b border-black">
        <h2 className="text-2xl font-bold tracking-tight leading-tight">
          Proven Starting Pairings
        </h2>
        <p className="mt-1 text-sm">
          Five combinations that pass all six axes out of the box. Start
          here, then run the checklist to confirm fit for your brand.
        </p>
      </header>

      <ol className="ref-pairings mt-4 flex flex-col list-none p-0">
        {PAIRINGS.map((p) => (
          <li
            key={`${p.heading}-${p.body}`}
            className="ref-pair grid grid-cols-[1fr] gap-0.5 py-2.5 border-b border-black/15 break-inside-avoid"
          >
            <p className="text-[13px] font-bold leading-snug">
              {p.heading}{" "}
              <span className="font-normal">+</span> {p.body}
            </p>
            <p className="text-[11.5px] leading-snug">{p.use}</p>
          </li>
        ))}
      </ol>

      <div className="ref-default mt-4 break-inside-avoid">
        <h3 className="text-[13px] font-bold leading-snug">
          Can&apos;t decide? Use one face for everything.
        </h3>
        <p className="text-[11.5px] leading-snug mt-1">
          <strong>Inter</strong>, Bold for headings and Regular for body.
          ~70&nbsp;KB total in WOFF2 — the lightest safe choice. Neutral by
          design: if your brand needs type to carry personality, pair it
          with a display face from the list above.
        </p>
      </div>

      <div className="ref-rules mt-4 break-inside-avoid">
        <h3 className="text-[13px] font-bold leading-snug pb-1 border-b border-black/40">
          Three rules that kill most pairings
        </h3>
        <ul className="mt-2 flex flex-col gap-1.5 list-none p-0">
          {HARD_RULES.map((rule, i) => (
            <li
              key={i}
              className="text-[11.5px] leading-snug grid grid-cols-[1.1rem_1fr] gap-x-2"
            >
              <span className="font-mono font-bold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="ref-footer mt-5 pt-3 border-t border-black/40 text-[10px] flex items-baseline justify-between gap-3 flex-wrap">
        <p>
          Full 10-pairing guide, file budgets, and the pairings to avoid:{" "}
          <strong>{siteConfig.domain}/shopify-font-pairings</strong>
        </p>
        <p className="font-mono">
          {siteConfig.name} · {siteConfig.domain}
        </p>
      </footer>
    </section>
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
/* Explicit page size: \`size: auto\` lets some browsers pick a custom
   tiny default, which is what produced the 80px-wide pages users were
   reporting in print preview. \`letter portrait\` is a deterministic
   choice for US printers; A4 users still get a sensible result because
   the @page size is a printer-side preference and most engines respect
   the user's tray when this rule is non-strict. */
@page {
  size: letter portrait;
  margin: 0.6in;
}

@media print {
  /* Full reset of the page chrome. */
  html, body {
    background: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    min-width: 0 !important;
  }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* Force the sheet container + main to fill the printable area.
     Tailwind's max-w-[760px] and px-8 on <main> are overridden here
     so the sheet doesn't render at a clipped 60-100px-wide width. */
  .checklist-sheet {
    background: #ffffff !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: 0 !important;
    width: 100% !important;
  }
  .checklist-sheet main {
    max-width: none !important;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Pure black text everywhere. Tailwind grays (text-black/70,
     border-black/15) print as illegible fuzz on cheap inkjets. */
  .checklist-sheet,
  .checklist-sheet * {
    color: #000 !important;
  }

  /* Pt-sized typography so the print output doesn't reflow based on
     the user's browser default font size. */
  .checklist-sheet h1 {
    font-size: 18pt !important;
    line-height: 1.15 !important;
    margin: 0 !important;
  }
  .checklist-sheet .header p {
    font-size: 9.5pt !important;
    line-height: 1.35 !important;
  }
  .checklist-sheet .write-in {
    font-size: 9pt !important;
  }
  .checklist-sheet .axis h2 {
    font-size: 11pt !important;
    line-height: 1.2 !important;
  }
  .checklist-sheet .axis p {
    font-size: 9.5pt !important;
    line-height: 1.35 !important;
  }
  .checklist-sheet .footer {
    font-size: 8.5pt !important;
  }

  /* Page-break controls. break-inside is the modern name;
     page-break-inside is the legacy spec — set both for older
     print engines that haven't adopted the new shorthand. */
  .checklist-sheet .axis,
  .checklist-sheet .header,
  .checklist-sheet .write-in,
  .checklist-sheet .ref-header,
  .checklist-sheet .ref-pair,
  .checklist-sheet .ref-default,
  .checklist-sheet .ref-rules,
  .checklist-sheet .ref-footer {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  /* The reference card is page 2. Force a hard break so the checklist
     never bleeds a single pairing onto a second page and the card
     always starts clean at the top of its own sheet. */
  .checklist-sheet .reference-card {
    break-before: page !important;
    page-break-before: always !important;
  }

  /* Reference-card typography mirrors page 1's pt scale so both sheets
     read as one professional document, not two. */
  .checklist-sheet .reference-card h2 {
    font-size: 18pt !important;
    line-height: 1.15 !important;
    margin: 0 !important;
  }
  .checklist-sheet .ref-header p {
    font-size: 9.5pt !important;
    line-height: 1.35 !important;
  }
  .checklist-sheet .reference-card h3 {
    font-size: 11pt !important;
    line-height: 1.2 !important;
  }
  .checklist-sheet .reference-card p,
  .checklist-sheet .reference-card li,
  .checklist-sheet .reference-card span {
    font-size: 9.5pt !important;
    line-height: 1.35 !important;
  }
  .checklist-sheet .ref-footer,
  .checklist-sheet .ref-footer p {
    font-size: 8.5pt !important;
  }
  .checklist-sheet .ref-header {
    border-bottom: 1pt solid #000 !important;
  }
  .checklist-sheet .ref-pair {
    border-bottom: 0.5pt solid #999 !important;
  }
  .checklist-sheet .ref-rules h3 {
    border-bottom: 0.5pt solid #555 !important;
  }
  .checklist-sheet .ref-footer {
    border-top: 0.5pt solid #555 !important;
  }

  /* Borders + checkbox stroke should still render at full ink. */
  .checklist-sheet .header {
    border-bottom: 1pt solid #000 !important;
  }
  .checklist-sheet .axis {
    border-bottom: 0.5pt solid #999 !important;
  }
  .checklist-sheet .footer {
    border-top: 0.5pt solid #555 !important;
  }
  .checklist-sheet .checkbox {
    border: 1pt solid #000 !important;
    background: #fff !important;
  }

  /* Suppress any print stylesheet's default URL-after-link adornment.
     We don't render external links on the sheet but defense-in-depth. */
  .checklist-sheet a[href]::after { content: none !important; }
}
`,
      }}
    />
  );
}
