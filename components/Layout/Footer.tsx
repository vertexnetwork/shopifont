import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

const FOOTER_LINKS = [
  { href: "/shopify-dawn-custom-font-generator", label: "Dawn generator" },
  { href: "/shopify-sense-custom-font-generator", label: "Sense generator" },
  { href: "/shopify-refresh-custom-font-generator", label: "Refresh generator" },
  { href: "/shopify-crave-custom-font-generator", label: "Crave generator" },
  { href: "/shopify-origin-custom-font-generator", label: "Origin generator" },
  { href: "/dawn-theme-typography-css-variables", label: "Dawn CSS variables" },
  { href: "/add-custom-font-dawn-liquid", label: "Dawn Liquid" },
  { href: "/fix-shopify-font-layout-shift-dawn", label: "Fix Dawn CLS" },
  { href: "/about", label: "About" },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-charcoal-line/30 bg-paper-dim">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm">
            <p className="font-semibold">{SITE_NAME}</p>
            <p className="text-muted">
              Free Shopify custom-font CSS generator. No signup, no upload, zero CLS.
            </p>
          </div>
          <p className="text-xs text-muted">
            Not affiliated with Shopify Inc. &quot;Shopify&quot; and &quot;Dawn&quot; are
            trademarks of Shopify Inc.
          </p>
        </div>
        <nav aria-label="Footer" className="text-sm">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-electric">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {SITE_NAME}.
        </p>
      </div>
    </footer>
  );
}
