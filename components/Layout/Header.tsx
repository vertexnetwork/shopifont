import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function Header() {
  return (
    <header className="border-b border-charcoal-line/30 bg-paper">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-charcoal font-semibold tracking-tight"
        >
          <span aria-hidden className="inline-block w-7 h-7 rounded-md bg-charcoal text-paper flex items-center justify-center font-mono text-sm">
            S
          </span>
          <span className="text-base sm:text-lg">{SITE_NAME}</span>
        </Link>
        <nav aria-label="Primary" className="text-sm">
          <ul className="flex items-center gap-4">
            <li>
              <Link
                href="/shopify-dawn-custom-font-generator"
                className="hover:text-electric"
              >
                Themes
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="hover:text-electric">
                How it works
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
