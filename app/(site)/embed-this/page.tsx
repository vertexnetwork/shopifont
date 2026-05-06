import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { SoftwareApplicationSchema } from "@/components/Schema/SoftwareApplicationSchema";
import { FaqSchema } from "@/components/Schema/FaqSchema";
import { EmbedSnippet } from "@/components/EmbedThis/EmbedSnippet";
import { SITE_NAME, getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

const TITLE = `Embed ${SITE_NAME} on your site`;
const DESCRIPTION = `Drop a single iframe tag and ${SITE_NAME}'s Shopify custom font generator runs inside your tutorial, blog post, or theme review. Free, no signup, no API key.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/embed-this" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/embed-this",
    type: "website",
  },
};

const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "Does the embed cost anything?",
    a: `No. ${SITE_NAME} is free to use and free to embed. The iframe is the same generator you'd see at the homepage — share-config and Mediavine ads are suppressed inside the embed so the partner site stays clean.`,
  },
  {
    q: "What does the embed weigh?",
    a: "About 140 KB of JS on first load (the same shared chunks the homepage uses, served from Vercel's edge). The page is fully static, prerendered at build time, and lazy-loaded by the parent iframe so it only fetches when the user scrolls to it.",
  },
  {
    q: "Will it work on a Shopify blog post?",
    a: "Yes. Shopify's blog editor supports iframes via the rich text editor's HTML mode. WordPress, Webflow, Notion, Ghost, and Substack all permit iframes too. The embed has no auth, no cookies, and no tracking that talks back to the host page.",
  },
  {
    q: "How do I size the embed?",
    a: "Set the iframe to 100% width with a fixed height (we recommend 900px on desktop). The generator stacks vertically below ~960px so the whole UI fits on mobile screens without scrolling inside the iframe.",
  },
  {
    q: "Can I get analytics on how many people use the embed?",
    a: `Plausible loads inside the embed and counts pageviews — drop us a line at hello@shopifont.app with your domain and we'll share which sites are sending the most traffic. The "Open full version" link in the embed header carries a utm_source=embed parameter so we can attribute clickthroughs from the embed back to the partner site.`,
  },
  {
    q: "Is there a script-tag widget instead of an iframe?",
    a: `Not yet. The iframe is faster to ship and zero-risk for CSS collisions on the host page. If iframe embeds get traction, a script-tag widget that mounts inside a Shadow DOM is on the roadmap. Email hello@shopifont.app if you'd be a partner for that.`,
  },
];

export default function EmbedThisPage() {
  const baseUrl = getSiteUrl();
  const embedUrl = `${baseUrl}/embed`;
  const snippet = `<iframe
  src="${embedUrl}"
  width="100%"
  height="900"
  frameborder="0"
  loading="lazy"
  title="Shopify Custom Font Generator by Shopifont"
  style="border:1px solid #e5e5e5; border-radius:8px;"
></iframe>`;

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Embed", href: "/embed-this" },
  ];

  return (
    <>
      <SoftwareApplicationSchema
        name={`${SITE_NAME} — Embed`}
        description={DESCRIPTION}
        url="/embed-this"
      />
      <FaqSchema id="embed-this-faq" faqs={FAQS} />
      <BreadcrumbSchema id="embed-this-breadcrumb" crumbs={crumbs} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-10">
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
            For tutorial authors, theme reviewers, agency blogs
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            Embed {SITE_NAME} on your site
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80">
            {DESCRIPTION}
          </p>
        </header>

        <section
          aria-labelledby="snippet-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="snippet-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            Copy-paste snippet
          </h2>
          <p className="text-charcoal/85 leading-relaxed">
            Paste this where you want the generator to appear. The default
            900px height fits the full UI without inner scrolling on most
            desktop and tablet widths; the embed stacks vertically below
            ~960px for mobile.
          </p>
          <EmbedSnippet snippet={snippet} />
        </section>

        <section
          aria-labelledby="preview-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="preview-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            Live preview
          </h2>
          <p className="text-charcoal/85 leading-relaxed">
            This is exactly what your visitors will see — the same
            interactive generator, with our nav and ad slots removed.
          </p>
          <div className="rounded-lg border border-charcoal-line/30 overflow-hidden shadow-card">
            <iframe
              src="/embed"
              width="100%"
              height={900}
              loading="lazy"
              title="Shopifont embed live preview"
              className="block w-full"
              style={{ border: 0 }}
            />
          </div>
        </section>

        <section
          aria-labelledby="why-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="why-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            Why partners embed it
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            <FeatureCard
              title="Zero CSS collision"
              body="The embed is a same-origin iframe, fully isolated. Nothing leaks into your stylesheet."
            />
            <FeatureCard
              title="No tracking on host page"
              body="Mediavine, Clarity, and our session-recording stack stay on the homepage. Only privacy-safe Plausible loads inside the embed."
            />
            <FeatureCard
              title="Always up to date"
              body="When we ship a new theme or fix a generator bug, your embed gets it on the next visitor refresh — no version pinning to maintain."
            />
            <FeatureCard
              title="Free attribution backlink"
              body="The header links back to shopifont.app with a utm_source=embed tag, so visitors who like the tool can find us — and we can credit your traffic."
            />
          </ul>
        </section>

        <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
          <h2
            id="faq-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            Frequently asked questions
          </h2>
          <ul className="flex flex-col gap-3">
            {FAQS.map((f) => (
              <li
                key={f.q}
                className="rounded-lg border border-charcoal-line/30 p-4"
              >
                <h3 className="text-base font-semibold tracking-tight">
                  {f.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/85">
                  {f.a}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-sm text-muted">
          Question we didn&apos;t answer?{" "}
          <a
            href="mailto:hello@shopifont.app"
            className="text-electric hover:underline"
          >
            hello@shopifont.app
          </a>{" "}
          — we read everything.
        </p>
      </div>
    </>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-lg border border-charcoal-line/30 p-4 flex flex-col gap-1.5">
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-charcoal/80">{body}</p>
    </li>
  );
}
