"use client";

import { useEffect, useState } from "react";

/**
 * Shape returned by /api/founding-offer. The server owns the truth (live
 * sales_count vs the cap); the client just reflects it.
 */
export type FoundingOffer = {
  active: boolean;
  remaining: number;
  code: string;
  discountUsd: number;
  discountPct: number;
};

// One fetch per page load, shared across every CTA + the banner. Memoizing
// the promise (not just the result) means N simultaneously-mounting
// consumers coalesce into a single request instead of a thundering herd.
let offerPromise: Promise<FoundingOffer | null> | null = null;

function loadFoundingOffer(): Promise<FoundingOffer | null> {
  if (!offerPromise) {
    offerPromise = fetch("/api/founding-offer")
      .then((r) => (r.ok ? (r.json() as Promise<FoundingOffer>) : null))
      .catch(() => null);
  }
  return offerPromise;
}

/** Returns the live founder offer, or null until it resolves / on error. */
export function useFoundingOffer(): FoundingOffer | null {
  const [offer, setOffer] = useState<FoundingOffer | null>(null);
  useEffect(() => {
    let alive = true;
    loadFoundingOffer().then((o) => {
      if (alive) setOffer(o);
    });
    return () => {
      alive = false;
    };
  }, []);
  return offer;
}
