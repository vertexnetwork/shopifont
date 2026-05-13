"use client";

import { useEffect } from "react";

/**
 * Client component that triggers the browser's print dialog when the
 * page URL carries `?format=pdf`. The welcome email's "Open and save
 * as PDF" button links to `…/sheet?format=pdf` so a single click takes
 * the user from inbox → printable PDF preview.
 *
 * Gated by user gesture: most browsers allow programmatic
 * `window.print()` on first user navigation. Edge and Safari can be
 * stricter; this is best-effort. If the dialog is blocked the user
 * can still hit Cmd/Ctrl+P or use the on-page button.
 */
export function AutoPrint() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("format") !== "pdf") return;
    // Defer one frame so layout (web fonts, etc.) is settled.
    const id = window.requestAnimationFrame(() => {
      window.print();
    });
    return () => window.cancelAnimationFrame(id);
  }, []);
  return null;
}
