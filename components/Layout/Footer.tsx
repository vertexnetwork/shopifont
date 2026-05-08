import Link from "next/link";
import { Logo } from "@/components/Brand/Logo";
import { NETWORK_BRAND, SITE_NAME } from "@/lib/site";

type FooterLink = { href: string; label: string };

const COLUMNS: ReadonlyArray<{
  heading: string;
  links: ReadonlyArray<FooterLink>;
}> = [
  {
    heading: "Generators",
    links: [
      { href: "/shopify-dawn-custom-font-generator", label: "Dawn" },
      { href: "/shopify-sense-custom-font-generator", label: "Sense" },
      { href: "/shopify-refresh-custom-font-generator", label: "Refresh" },
      { href: "/shopify-crave-custom-font-generator", label: "Crave" },
      { href: "/shopify-origin-custom-font-generator", label: "Origin" },
    ],
  },
  {
    heading: "Guides",
    links: [
      { href: "/dawn-theme-typography-css-variables", label: "Dawn CSS variables" },
      { href: "/add-custom-font-dawn-liquid", label: "Dawn Liquid" },
      { href: "/fix-shopify-font-layout-shift-dawn", label: "Fix Dawn CLS" },
    ],
  },
  {
    heading: "Site",
    links: [
      { href: "/about", label: "About" },
      { href: "/changelog", label: "Changelog" },
      { href: "/embed-this", label: "Embed on your site" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-charcoal-line/30 bg-paper-dim">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col gap-8">
        <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,auto))] sm:items-start">
          <div className="flex flex-col gap-3 max-w-xs">
            <Link
              href="/"
              aria-label={`${SITE_NAME} home`}
              className="inline-flex items-center gap-2 text-charcoal font-semibold tracking-tight"
            >
              <Logo className="w-6 h-6 text-charcoal" />
              <span className="text-base">{SITE_NAME}</span>
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              Free Shopify custom-font CSS generator. No signup, no upload, zero CLS.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav
              key={col.heading}
              aria-label={col.heading}
              className="flex flex-col gap-2 sm:min-w-[10rem]"
            >
              <h2 className="text-xs uppercase tracking-wide text-muted font-semibold">
                {col.heading}
              </h2>
              <ul className="flex flex-col gap-1.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex items-center min-h-[2rem] hover:text-electric"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-charcoal-line/20">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {SITE_NAME}
            <span aria-hidden className="mx-1.5 text-charcoal-line/60">·</span>
            <Link href="/network" className="hover:text-electric">
              Part of the {NETWORK_BRAND}
            </Link>
          </p>
          <p className="text-xs text-muted">
            Not affiliated with Shopify Inc. &quot;Shopify&quot; and &quot;Dawn&quot; are
            trademarks of Shopify Inc.
          </p>
        </div>
        <p className="text-[11px] text-muted/80 leading-relaxed">
          Creative Fabrica links pay us a commission at no cost to you.
          Mediavine display ads keep the rest of the lights on. Full
          disclosure on the{" "}
          <Link href="/about" className="underline hover:text-electric">
            About page
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
