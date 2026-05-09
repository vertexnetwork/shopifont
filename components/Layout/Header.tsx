"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Brand/Logo";
import { SITE_NAME } from "@/lib/site";

/**
 * Site-wide header. Desktop: brand on left, inline nav on right.
 * Mobile (< sm, ~640px): brand + hamburger trigger; tapping opens a
 * drop-down nav drawer beneath the header bar. Inline nav previously
 * pushed the page width past 360px because five touch-target items
 * couldn't fit in the available row — fixed here by hiding the
 * desktop nav and rendering a single icon button instead.
 *
 * Client component because the menu open/close state is local UI
 * state. Wrapping in `"use client"` is the smallest viable change —
 * the rest of (site)/layout.tsx stays a server component, so this
 * doesn't drag the entire chrome into the client bundle.
 */

const NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/#themes", label: "Themes" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/embed-this", label: "Embed" },
  { href: "/extension", label: "Extension" },
  { href: "/about", label: "About" },
];

const NAV_LINK_CLASS =
  "min-h-[var(--spacing-touch)] inline-flex items-center px-2 hover:text-electric";

export function Header() {
  const [open, setOpen] = useState(false);

  // Close the drawer if the viewport grows past the sm breakpoint
  // (e.g., the user rotates a tablet from portrait to landscape).
  // Without this the drawer stays mounted but invisible behind the
  // desktop nav, leaving a stale `aria-expanded="true"` state.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 640px)");
    const handler = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Close on Escape so keyboard users get the same behavior as a
  // dialog. Body scroll-lock isn't needed because the drawer pushes
  // page content rather than overlaying it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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

        {/* Desktop nav. Hidden below sm; the drawer below replaces it. */}
        <nav aria-label="Primary" className="hidden sm:block text-sm">
          <ul className="flex items-center gap-1 sm:gap-2">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={NAV_LINK_CLASS}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile hamburger trigger. Hidden at sm+. */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="primary-mobile-nav"
          onClick={() => setOpen((prev) => !prev)}
          className="sm:hidden inline-flex items-center justify-center min-h-[var(--spacing-touch)] min-w-[var(--spacing-touch)] rounded-md text-charcoal hover:bg-paper-dim hover:text-electric focus:outline-none focus:ring-2 focus:ring-electric/30"
        >
          {open ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {/* Mobile drawer. Renders inline below the header bar so it
          pushes page content rather than overlaying it — keeps the
          interaction model simple (no body scroll-lock, no focus
          trap). aria-hidden is driven by the boolean so SR users
          don't tab into the closed list. */}
      <nav
        id="primary-mobile-nav"
        aria-label="Primary mobile"
        aria-hidden={!open}
        className={
          "sm:hidden border-t border-charcoal-line/20 bg-paper overflow-hidden " +
          (open ? "block" : "hidden")
        }
      >
        <ul className="flex flex-col px-4 py-2">
          {NAV_LINKS.map((l) => (
            <li key={l.href} className="border-b border-charcoal-line/10 last:border-b-0">
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center min-h-[var(--spacing-touch)] py-2 text-sm text-charcoal hover:text-electric"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function HamburgerIcon() {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 6h14M4 11h14M4 16h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M5 5l12 12M17 5L5 17" />
    </svg>
  );
}
