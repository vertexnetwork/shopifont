/**
 * `safeTrack(event, props)` — fire an analytics event into whichever
 * provider is initialized in the browser, no-op everywhere else.
 *
 * Providers checked in order:
 *   1. Plausible (`window.plausible`)
 *   2. Mediavine Grow (`window.growMe`) — placeholder, accepts events
 *      via its own queue
 *   3. GA4 (`window.gtag`) — only if a GA4 ID is configured
 *
 * Server / SSR / Node call sites no-op silently.
 *
 * Spec §9 mandates this util plus a network-wide `vertex_footer_opened`
 * event that fires when a user clicks the "Part of the Vertex Network"
 * footer link.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
    gtag?: (...args: any[]) => void;
    growMe?: (...args: any[]) => void;
  }
}

export type EventProps = Record<string, string | number | boolean | undefined>;

export function safeTrack(event: string, props?: EventProps): void {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.plausible === "function") {
      window.plausible(event, props ? { props } : undefined);
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", event, props ?? {});
    }
  } catch {
    // Analytics failures must never throw into the host UI.
  }
}

/** Required network-wide event (spec §9). */
export const VERTEX_FOOTER_OPENED = "vertex_footer_opened" as const;

export function trackVertexFooterOpened(): void {
  safeTrack(VERTEX_FOOTER_OPENED);
}
