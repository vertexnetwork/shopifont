import type { Metadata } from "next";
import Link from "next/link";
import { ArticleSchema } from "@/components/Schema/ArticleSchema";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { EmailCaptureForm } from "@/components/EmailCapture/EmailCaptureForm";
import { SITE_NAME } from "@/lib/site";
import { EVERGREEN_ENTRIES } from "@/content/evergreen";

export const dynamic = "force-static";

const ENTRY = EVERGREEN_ENTRIES.find((e) => e.slug === "font-pairing-checklist")!;

const META_DESCRIPTION =
  "Free six-axis font-pairing checklist for Shopify storefronts — brand fit, contrast, x-height, weight availability, performance budget, licensing. Opens as a printable PDF the moment you submit your email.";

export const metadata: Metadata = {
  title: `${ENTRY.title} | ${SITE_NAME}`,
  description: META_DESCRIPTION,
  alternates: { canonical: `/${ENTRY.slug}` },
  openGraph: {
    title: ENTRY.title,
    description: META_DESCRIPTION,
    url: `/${ENTRY.slug}`,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: ENTRY.title,
    description: META_DESCRIPTION,
  },
};

const CHECKLIST_AXES: ReadonlyArray<{ heading: string; body: string }> = [
  {
    heading: "Brand fit",
    body: "Geometric sans, humanist sans, or display serif — which voice does your storefront actually speak in? The checklist walks through how each category reads to ecommerce visitors.",
  },
  {
    heading: "Heading × body contrast",
    body: "Pairings fail when the two fonts are too similar OR too different. The checklist gives the contrast tests we use to spot both failure modes in 30 seconds.",
  },
  {
    heading: "X-height harmony",
    body: "Two fonts with mismatched x-heights make a storefront look amateur even when the typefaces themselves are great. A simple measurement check that fixes 90% of bad pairings.",
  },
  {
    heading: "Weight availability",
    body: "If you need 400 + 700 for body and a 600 weight for the heading, your candidate has to ship all three. Most foundries don't say this clearly on the listing page — the checklist gives the validation steps.",
  },
  {
    heading: "Performance budget",
    body: "File sizes per weight and format, FOIT/CLS impact, and the rule of thumb for how many faces a Shopify storefront can carry before it starts losing Lighthouse points.",
  },
  {
    heading: "Licensing for ecommerce",
    body: "Web fonts often have separate licenses for commercial use, ads, and merchandise. The checklist's last item is the four-question test we use to confirm a font is safe to ship on a Shopify store.",
  },
];

export default function FontPairingChecklistPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Font pairing checklist", href: `/${ENTRY.slug}` },
  ];

  return (
    <>
      <ArticleSchema
        id="font-pairing-checklist-article-schema"
        title={ENTRY.title}
        description={META_DESCRIPTION}
        path={`/${ENTRY.slug}`}
      />
      <BreadcrumbSchema
        id="font-pairing-checklist-breadcrumb-schema"
        crumbs={crumbs}
      />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <ol className="flex flex-wrap gap-1">
            {crumbs.map((c, idx) => (
              <li key={c.href} className="flex items-center gap-1">
                {idx > 0 ? <span aria-hidden>›</span> : null}
                {idx === crumbs.length - 1 ? (
                  <span aria-current="page" className="text-charcoal">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.href} className="hover:text-electric">
                    {c.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-wide text-muted">
            Free PDF · No account required
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            The Shopify font-pairing checklist
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80">
            Two pages: the six-axis checklist we run every Shopify font
            pairing through before it goes on a storefront, plus a
            reference card of five proven pairings, a safe single-font
            default, and the three rules that kill most pairings. Opens
            in your browser the moment you submit your email — save it
            straight to PDF from the print dialog. We&apos;ll only email
            you when we ship a major update; no follow-up sequence, no
            account.
          </p>
        </header>

        <section
          aria-labelledby="signup-heading"
          className="flex flex-col gap-4 rounded-lg border border-electric/30 bg-gradient-to-br from-electric/[0.06] via-electric/[0.02] to-transparent p-5 sm:p-6 shadow-card"
        >
          <h2
            id="signup-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight"
          >
            Get the checklist
          </h2>
          <EmailCaptureForm variant="landing" source="font-pairing-checklist" />
        </section>

        <section
          aria-labelledby="contents-heading"
          className="flex flex-col gap-4"
        >
          <h2
            id="contents-heading"
            className="text-2xl font-bold tracking-tight"
          >
            What&apos;s in the checklist
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {CHECKLIST_AXES.map((axis) => (
              <li
                key={axis.heading}
                className="flex flex-col gap-1.5 rounded-lg border border-charcoal-line/30 p-4 shadow-card"
              >
                <h3 className="font-semibold tracking-tight">{axis.heading}</h3>
                <p className="text-sm text-charcoal/80 leading-relaxed">
                  {axis.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="next-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="next-heading"
            className="text-2xl font-bold tracking-tight"
          >
            Once you&apos;ve picked a pairing
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Drop the font names into the{" "}
            <Link href="/" className="text-electric hover:underline">
              {SITE_NAME} generator
            </Link>{" "}
            and it builds the three code blocks Shopify expects — the{" "}
            <code className="font-mono text-sm">@font-face</code> CSS, the{" "}
            <code className="font-mono text-sm">settings_schema.json</code>{" "}
            snippet, and the CSS variable overrides — in a couple of seconds.
            From checklist to a live custom font on Dawn, Sense, Refresh, or
            any of the other 10 free OS 2.0 themes in roughly five minutes.
          </p>
        </section>
      </article>
    </>
  );
}
