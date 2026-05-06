"use client";

import { useEffect, useState } from "react";

/**
 * Mobile-only CTA bar that slides in once the user has scrolled past
 * the hero anchor and the tool isn't yet visible. Recovers users who
 * land on long pSEO pages, scroll into the FAQ, and forget the
 * generator is one tap above. No-op when neither anchor exists (e.g.
 * About / Changelog pages).
 */
export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const heroEl = document.getElementById("hero-anchor");
    const toolEl = document.getElementById("tool-heading");
    if (!heroEl || !toolEl) return;

    let heroOut = false;
    let toolIn = false;
    const recompute = () => setVisible(heroOut && !toolIn);

    const heroObs = new IntersectionObserver(
      (entries) => {
        heroOut = !entries[0]?.isIntersecting;
        recompute();
      },
      { threshold: 0 },
    );
    const toolObs = new IntersectionObserver(
      (entries) => {
        toolIn = entries[0]?.isIntersecting ?? false;
        recompute();
      },
      { threshold: 0.05 },
    );
    heroObs.observe(heroEl);
    toolObs.observe(toolEl);

    return () => {
      heroObs.disconnect();
      toolObs.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={
        "lg:hidden fixed left-3 right-3 bottom-3 z-50 transition-all duration-200 " +
        (visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6 pointer-events-none")
      }
    >
      <a
        href="#tool-heading"
        // Drop out of tab order while hidden so the focusable
        // descendant doesn't trip Lighthouse's aria-hidden audit.
        tabIndex={visible ? undefined : -1}
        className="block min-h-[3.25rem] px-5 rounded-full bg-electric text-paper font-semibold text-center leading-[3.25rem] shadow-cta"
      >
        Generate my font code ↓
      </a>
    </div>
  );
}
