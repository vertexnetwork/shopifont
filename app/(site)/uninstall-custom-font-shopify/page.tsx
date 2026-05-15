import type { Metadata } from "next";
import Link from "next/link";
import { AppUpsell } from "@/components/AppUpsell";
import { ArticleSchema } from "@/components/Schema/ArticleSchema";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import { SITE_NAME } from "@/lib/site";
import { EVERGREEN_ENTRIES } from "@/content/evergreen";

export const dynamic = "force-static";

const ENTRY = EVERGREEN_ENTRIES.find(
  (e) => e.slug === "uninstall-custom-font-shopify",
)!;

const META_DESCRIPTION =
  "Step-by-step guide to removing a custom font from your Shopify Dawn theme. Cleanly reverses the @font-face block, CSS variable overrides, and settings_schema.json entry without touching anything else.";

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

export default function UninstallPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Uninstall guide", href: `/${ENTRY.slug}` },
  ];

  return (
    <>
      <ArticleSchema
        id="uninstall-article-schema"
        title={ENTRY.title}
        description={META_DESCRIPTION}
        path={`/${ENTRY.slug}`}
      />
      <BreadcrumbSchema id="uninstall-breadcrumb-schema" crumbs={crumbs} />

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
          <p className="text-xs uppercase tracking-wide text-muted">Guide</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
            How to uninstall a custom font from a Shopify theme
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80">
            If you installed a custom font using {SITE_NAME} (or any of the
            same patterns) and want to revert your store to its default
            typography, this guide walks through the four files you need to
            touch and the two you can safely leave alone. Works for Dawn and
            every other free Shopify OS 2.0 theme.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            What you actually need to remove
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            A custom font installed via the {SITE_NAME} pattern produces
            three artifacts in your theme code, plus the font files
            themselves in the assets folder. Removing all four leaves your
            theme in exactly the state it was in before you started.
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2 text-charcoal/80 leading-relaxed">
            <li>
              The <code className="font-mono text-sm">@font-face</code> block
              you pasted into <code className="font-mono text-sm">assets/base.css</code>{" "}
              (or another stylesheet).
            </li>
            <li>
              The CSS variable override block that retargets{" "}
              <code className="font-mono text-sm">--font-heading-family</code>{" "}
              and <code className="font-mono text-sm">--font-body-family</code>.
            </li>
            <li>
              The settings entry in{" "}
              <code className="font-mono text-sm">config/settings_schema.json</code>{" "}
              that gave the Theme Editor a font picker and apply-to selector.
            </li>
            <li>
              The font files (woff2 / woff / ttf) in your theme&apos;s{" "}
              <code className="font-mono text-sm">assets/</code> folder.
              Optional — leaving them in place doesn&apos;t affect anything
              once nothing references them.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Step 1 — Toggle &ldquo;Disabled&rdquo; in the Theme Editor first (recommended)
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            If the install used the{" "}
            <code className="font-mono text-sm">apply_to</code> select that
            ships with our generator, the fastest reversible step is to set
            it to <strong>Disabled</strong> in the Theme Editor. The custom
            font won&apos;t apply, but the code stays in place — useful for
            testing whether the font is actually what&apos;s causing a
            display issue before you commit to removing files.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            Open <strong>Online Store → Themes → Customize → Theme settings →
            Typography</strong> (the section name matches whatever you used
            in <code className="font-mono text-sm">settings_schema.json</code>),
            change the apply-to setting to <strong>Disabled</strong>, and
            save. Refresh the storefront — the default theme typography
            should be back.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            If that fixes whatever you were trying to fix, you can stop
            here. If you want a full removal, continue.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Step 2 — Remove the CSS variable overrides
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            In the theme code editor, open{" "}
            <code className="font-mono text-sm">assets/base.css</code> (or
            whichever stylesheet you pasted into) and delete the override
            block. It looks roughly like this:
          </p>
          <pre className="text-xs sm:text-sm bg-paper-dim rounded-md p-4 overflow-x-auto font-mono">
{`:root {
  --font-heading-family: "My Brand Sans", sans-serif;
  --font-heading-style: normal;
  --font-heading-weight: 400;
  --font-body-family: "My Brand Sans", sans-serif;
  --font-body-style: normal;
  --font-body-weight: 400;
}`}
          </pre>
          <p className="text-charcoal/80 leading-relaxed">
            Delete the entire <code className="font-mono text-sm">:root</code>{" "}
            block. Save. The theme falls back to its default values for
            those variables — Dawn ships with{" "}
            <code className="font-mono text-sm">--font-heading-family</code>{" "}
            already declared in <code className="font-mono text-sm">base.css</code>,
            so the original headings/body will return automatically.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Step 3 — Remove the @font-face block
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            In the same stylesheet, find and delete the{" "}
            <code className="font-mono text-sm">@font-face</code> declaration
            you pasted in. It looks like:
          </p>
          <pre className="text-xs sm:text-sm bg-paper-dim rounded-md p-4 overflow-x-auto font-mono">
{`@font-face {
  font-family: "My Brand Sans";
  src: url({{ 'my-brand-sans.woff2' | asset_url }}) format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}`}
          </pre>
          <p className="text-charcoal/80 leading-relaxed">
            Delete the whole block including the closing{" "}
            <code className="font-mono text-sm">{"}"}</code>. Save. If you
            installed multiple weights or styles you may have several
            <code className="font-mono text-sm"> @font-face</code> blocks
            — remove every one that references your custom font name.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Step 4 — Remove the settings_schema.json entry
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Open <code className="font-mono text-sm">config/settings_schema.json</code>{" "}
            in the code editor. Find the section block that holds your
            custom font settings — it has a{" "}
            <code className="font-mono text-sm">name</code> field that
            includes the font name you used (e.g.,{" "}
            <code className="font-mono text-sm">&quot;My Brand Sans (custom font)&quot;</code>).
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            Delete the entire object — from the opening{" "}
            <code className="font-mono text-sm">{"{"}</code> to the closing{" "}
            <code className="font-mono text-sm">{"}"}</code>, including the
            trailing comma if it&apos;s not the last entry in the array.
            Save. Shopify will revalidate the JSON on save and reject the
            file if you left a syntax error, so the editor itself catches
            most mistakes here.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            <strong>Important:</strong> the section may persist in the
            Theme Editor sidebar for a few seconds after save while
            Shopify caches catch up. If you still see it after a minute,
            close and reopen the customizer.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Step 5 — Delete the font files (optional)
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Open the <code className="font-mono text-sm">assets/</code>{" "}
            folder in the code editor. Find the font files you uploaded —
            they share the slugified base name from the install (e.g.,{" "}
            <code className="font-mono text-sm">my-brand-sans.woff2</code>,
            <code className="font-mono text-sm"> my-brand-sans.woff</code>).
            Click each one, then click <strong>Delete file</strong> at the
            top of the editor.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            This step is optional. Once nothing references the files via{" "}
            <code className="font-mono text-sm">asset_url</code>, they
            don&apos;t affect performance — they just sit unreferenced in
            the bundle. Removing them keeps your theme tidy and shrinks the
            theme zip if you ever export it.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Verify the storefront
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            Open your storefront in a fresh tab (or hard-refresh with{" "}
            <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border border-charcoal-line/40">
              Ctrl+Shift+R
            </kbd>{" "}
            /{" "}
            <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border border-charcoal-line/40">
              Cmd+Shift+R
            </kbd>{" "}
            to bypass any cached CSS). Headings and body text should render
            in the theme&apos;s default fonts. In DevTools → Network, filter
            for <code className="font-mono text-sm">.woff2</code> — your
            custom font file should no longer appear in the request list.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            If the custom font is still showing, the most common cause is a
            stylesheet you forgot about — check{" "}
            <code className="font-mono text-sm">assets/theme.css.liquid</code>,
            <code className="font-mono text-sm"> assets/component-*.css</code>,
            and any custom CSS pasted into the Theme Editor&apos;s{" "}
            <strong>Theme settings → Custom CSS</strong> field.
          </p>
        </section>

        {/*
         * Paid-app upsell. Peak regret/pain moment on the whole site —
         * the merchant has just hand-reversed theme-file edits. "There
         * has to be a better way" is exactly what they're thinking, so
         * the upsell lands here, after the manual steps and before the
         * (free) reinstall pointer. Ships dark until the listing URL
         * is set.
         */}
        <AppUpsell variant="uninstall" />

        <section className="flex flex-col gap-3 rounded-lg border border-charcoal-line/30 bg-paper-dim p-5">
          <h2 className="text-xl font-bold tracking-tight">
            Reinstall later if you change your mind
          </h2>
          <p className="text-charcoal/80 leading-relaxed">
            If you remove the font and decide later you want it back, the{" "}
            <Link href="/" className="text-electric hover:underline">
              {SITE_NAME} generator
            </Link>{" "}
            produces the three blocks fresh in seconds — same font name,
            same formats, paste them back in. There&apos;s nothing
            stateful between installs, so an uninstall is a clean slate.
          </p>
        </section>
      </article>
    </>
  );
}
