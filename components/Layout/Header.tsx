import Link from "next/link";
import { Logo } from "@/components/Brand/Logo";
import { SITE_NAME } from "@/lib/site";

const NAV_LINK_CLASS =
  "min-h-[var(--spacing-touch)] inline-flex items-center px-2 hover:text-electric";

export function Header() {
  return (
    <header className="border-b border-charcoal-line/30 bg-paper">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label={`${SITE_NAME} home`}
          className="inline-flex items-center gap-2 text-charcoal font-semibold tracking-tight min-h-[var(--spacing-touch)]"
        >
          <Logo className="w-7 h-7 text-charcoal" />
          <span className="text-base sm:text-lg">{SITE_NAME}</span>
        </Link>
        <nav aria-label="Primary" className="text-sm">
          <ul className="flex items-center gap-1 sm:gap-2">
            <li>
              <Link href="/#themes" className={NAV_LINK_CLASS}>
                Themes
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className={NAV_LINK_CLASS}>
                How it works
              </Link>
            </li>
            <li>
              <Link href="/embed-this" className={NAV_LINK_CLASS}>
                Embed
              </Link>
            </li>
            <li>
              <Link href="/extension" className={NAV_LINK_CLASS}>
                Extension
              </Link>
            </li>
            <li>
              <Link href="/about" className={NAV_LINK_CLASS}>
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
