"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/Brand/Wordmark";
import { siteConfig } from "@/lib/site-config";

/**
 * Site-wide header. Desktop: brand on left, inline nav on right.
 * Mobile (< sm, ~640px): brand + hamburger trigger; tapping opens a
 * drop-down nav drawer beneath the header bar. Nav items source from
 * `siteConfig.nav.primary`.
 */
const NAV_LINK_CLASS =
  "min-h-[var(--spacing-touch)] inline-flex items-center px-2 hover:text-electric";

export function Header() {
  const [open, setOpen] = useState(false);
  const navLinks = siteConfig.nav.primary;

  // Close the drawer if the viewport grows past the sm breakpoint.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 640px)");
    const handler = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Close on Escape.
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
          aria-label={`${siteConfig.name} home`}
          className="inline-flex items-center min-h-[var(--spacing-touch)]"
        >
          <Wordmark />
        </Link>

        {/* Desktop nav. Hidden below sm; the drawer below replaces it. */}
        <nav aria-label="Primary" className="hidden sm:block text-sm">
          <ul className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={NAV_LINK_CLASS}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile hamburger trigger. */}
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
          {navLinks
            // Chrome extensions don't install on mobile, so drop the
            // /extension entry from the mobile drawer — saves the user
            // a dead-end tap. Desktop nav still shows it.
            .filter((l) => l.href !== "/extension")
            .map((l) => (
              <li
                key={l.href}
                className="border-b border-charcoal-line/10 last:border-b-0"
              >
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
