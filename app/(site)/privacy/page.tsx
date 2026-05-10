import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { siteConfig, getBuildDateLabel } from "@/lib/site-config";

export const dynamic = "force-static";

const TITLE = `Privacy Policy`;
const DESCRIPTION = `How ${siteConfig.name} handles your data — analytics, ads, email capture, and the no-upload guarantee.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: `${TITLE} | ${siteConfig.name}`,
    description: DESCRIPTION,
    url: "/privacy",
    type: "article",
  },
};

export default function PrivacyPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Privacy", href: "/privacy" },
  ];
  const adProvider = siteConfig.features.ads.provider;
  const adProviderLabel =
    adProvider === "mediavine"
      ? "Mediavine"
      : adProvider === "adsense"
        ? "Google AdSense"
        : adProvider === "carbon"
          ? "Carbon"
          : "no third-party ad network";

  return (
    <>
      <BreadcrumbSchema id="privacy-breadcrumb-schema" crumbs={crumbs} />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-8">
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

        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide text-muted">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            {TITLE}
          </h1>
          <p className="text-sm text-muted">
            Last updated {getBuildDateLabel()}.
          </p>
        </header>

        <Section title="What we collect">
          <p>
            {siteConfig.name} runs entirely in your browser. The font
            generator does string interpolation client-side; the optional
            font-file preview reads the file via the FontFace API on a blob
            URL. <strong>No font file you load ever leaves your machine.</strong>{" "}
            There is no upload endpoint and no server-side storage of
            generator inputs.
          </p>
          <p>
            What we do collect is limited to the analytics, advertising, and
            email-capture surfaces below — each of which is opt-in or
            disclosed up front, and each of which is enabled only when the
            corresponding configuration is set on the deployed site.
          </p>
        </Section>

        <Section title="Analytics providers">
          <p>
            Two analytics surfaces may be active on this site:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li>
              <strong>Vercel Analytics + Speed Insights</strong>. Aggregate,
              cookie-free first-party metrics provided by our hosting
              platform (Vercel). Used for page-view counts and Core Web
              Vitals (LCP, INP, CLS). No individual user is identified.
            </li>
            <li>
              <strong>Plausible</strong>. Cookie-free, GDPR-compliant
              first-party analytics. Captures referrer, country, and
              page-level outbound link clicks. No personal data, no
              cross-site profile.
            </li>
            <li>
              <strong>Microsoft Clarity</strong>. Heatmaps and session
              recordings used to find UX dead-ends in the generator. Sets
              first-party cookies; sensitive form fields are masked by
              default. Loaded only after you accept the cookie banner —
              decline and Clarity never injects.
            </li>
          </ul>
        </Section>

        <Section title="Advertising">
          <p>
            This site is funded by display advertising. Currently active:{" "}
            <strong>{adProviderLabel}</strong>.
          </p>
          {adProvider !== "none" ? (
            <p>
              Ad networks may set their own cookies and use device identifiers
              to serve and measure advertising. They follow their own privacy
              and consent flows in regulated jurisdictions (GDPR, CCPA,
              ePrivacy). Where the law requires consent for personalized ads,
              the ad network presents that flow before personalized ads load.
            </p>
          ) : (
            <p>
              No third-party ad scripts run on the site at the moment.
            </p>
          )}
        </Section>

        <Section title="Affiliate links">
          <p>
            We work with the following affiliate partners. Clicking an
            affiliate link sets the partner&apos;s tracking cookie on their
            domain (not ours) so they can attribute a sale back to us:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2">
            {siteConfig.features.affiliates.map((a) => (
              <li key={a.url}>
                <strong>{a.label}</strong> — link uses{" "}
                <code className="font-mono text-xs">
                  rel=&quot;{a.rel ?? "sponsored noopener"}&quot;
                </code>{" "}
                per Google webmaster guidance and FTC disclosure rules.
              </li>
            ))}
          </ul>
          <p>
            We never see your purchase details — we only see whether a click
            from this site converted, in aggregate, in the partner&apos;s
            dashboard.
          </p>
        </Section>

        {siteConfig.features.email.enabled ? (
          <Section title="Email capture">
            <p>
              The footer signup form sends one email — the{" "}
              {siteConfig.features.email.leadMagnetName.replace(/-/g, " ")} —
              and adds your address to a Resend audience used for occasional
              update emails. We never sell or share the address. You can
              unsubscribe from any email; doing so removes you from the
              audience entirely. We store nothing else.
            </p>
          </Section>
        ) : null}

        <Section title="The /embed surface">
          <p>
            When {siteConfig.name} is embedded in a partner&apos;s page via{" "}
            <code className="font-mono text-sm">/embed</code>, only Plausible
            is loaded inside the iframe — Mediavine, AdSense, and Clarity are
            <em>not</em> mounted on the embed surface so the partner&apos;s
            site never inherits our ad/heatmap stack. The host page&apos;s own
            analytics are not affected.
          </p>
        </Section>

        <Section title="Your choices">
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li>
              <strong>Cookies.</strong> The cookie banner controls whether
              Clarity loads. Decline and we don&apos;t set or read its
              cookies.
            </li>
            <li>
              <strong>Do Not Track.</strong> Plausible and Vercel Analytics do
              not track individuals to begin with, so a DNT header is
              effectively redundant — but we honor it anyway.
            </li>
            <li>
              <strong>Email.</strong> Use the unsubscribe link in any email
              you receive from us, or write to{" "}
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="text-electric hover:underline"
              >
                {siteConfig.supportEmail}
              </a>{" "}
              and we&apos;ll remove you immediately.
            </li>
          </ul>
        </Section>

        <Section title="Contact">
          <p>
            Privacy questions, data-access requests, or anything that looks
            wrong on this page:{" "}
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="text-electric hover:underline"
            >
              {siteConfig.supportEmail}
            </a>
            . You&apos;ll get a real reply.
          </p>
          <p className="text-sm text-muted">
            {siteConfig.trademarkDisclaimer}
          </p>
        </Section>
      </article>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
      <div className="text-charcoal/80 leading-relaxed flex flex-col gap-3">
        {children}
      </div>
    </section>
  );
}
