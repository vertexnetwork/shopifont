"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { siteConfig } from "@/lib/site-config";

/**
 * Minimal localStorage-backed consent store. Spec §9 requires Clarity
 * to load only after the user accepts the cookie banner; this provider
 * is the single source of truth for that state.
 *
 * Storage key: `${siteConfig.shortName}-consent-v1`. Bumping the suffix
 * is how we re-prompt users when the consent surface materially
 * changes (e.g., adding a new analytics provider).
 */

export type ConsentValue = "granted" | "denied" | "unknown";

type ConsentContextShape = {
  value: ConsentValue;
  grant: () => void;
  deny: () => void;
  reset: () => void;
};

const STORAGE_KEY = `${siteConfig.shortName}-consent-v1`;

const ConsentContext = createContext<ConsentContextShape>({
  value: "unknown",
  grant: () => {},
  deny: () => {},
  reset: () => {},
});

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<ConsentValue>("unknown");

  // Read persisted state on mount. Avoids SSR/CSR hydration mismatch
  // by leaving the initial render at "unknown" and then catching up
  // once the client mounts.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "granted" || raw === "denied") setValue(raw);
    } catch {
      /* localStorage may be blocked (Safari ITP, third-party iframe) */
    }
  }, []);

  const persist = useCallback((next: ConsentValue) => {
    setValue(next);
    try {
      if (next === "unknown") {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const ctx = useMemo<ConsentContextShape>(
    () => ({
      value,
      grant: () => persist("granted"),
      deny: () => persist("denied"),
      reset: () => persist("unknown"),
    }),
    [value, persist],
  );

  return (
    <ConsentContext.Provider value={ctx}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextShape {
  return useContext(ConsentContext);
}
