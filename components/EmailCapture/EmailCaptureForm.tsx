"use client";

import { useId, useState } from "react";

/**
 * Anonymous email capture. Posts JSON to the /api/subscribe Edge
 * Function which proxies to Resend Audiences. No DB on our side; the
 * audience itself is the contact list.
 *
 * Three render contexts:
 *
 *  - "footer" — compact horizontal layout under the per-page Footer
 *  - "landing" — vertical, larger inputs, used on the lead-magnet page
 *
 * Both share submission logic. Status is announced via aria-live so
 * screen readers hear the success/error transition without a focus
 * jump.
 */
export function EmailCaptureForm({
  variant = "footer",
  source,
}: {
  variant?: "footer" | "landing";
  /** Optional analytics tag — currently surfaced in the success copy. */
  source?: string;
}) {
  const inputId = useId();
  const statusId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const isCompact = variant === "footer";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrorCode(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (res.ok) {
        setStatus("ok");
        setEmail("");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus("error");
      setErrorCode(data.error ?? "unknown");
    } catch {
      setStatus("error");
      setErrorCode("network");
    }
  }

  if (status === "ok") {
    return (
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={
          isCompact
            ? "text-sm text-charcoal"
            : "text-base text-charcoal leading-relaxed"
        }
      >
        Check your inbox in 1–2 minutes for the font-pairing checklist. If it
        doesn&apos;t arrive, peek at your spam folder once.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={
        isCompact
          ? "flex flex-col sm:flex-row gap-2 items-stretch sm:items-end"
          : "flex flex-col gap-3"
      }
    >
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <label
          htmlFor={inputId}
          className={
            isCompact
              ? "text-xs uppercase tracking-wide text-muted font-semibold"
              : "text-sm font-semibold text-charcoal"
          }
        >
          {isCompact
            ? "Get the font-pairing checklist"
            : "Email me the checklist"}
        </label>
        <input
          id={inputId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="you@store.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby={status === "error" ? statusId : undefined}
          className={
            "min-h-[var(--spacing-touch)] px-3 rounded-md border border-charcoal-line/40 bg-paper text-charcoal placeholder:text-muted focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/30 " +
            (isCompact ? "text-sm" : "text-base")
          }
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading" || email.length === 0}
        className={
          "min-h-[var(--spacing-touch)] px-5 rounded-md bg-electric text-paper font-semibold shadow-cta hover:bg-electric-hover disabled:opacity-50 disabled:cursor-not-allowed " +
          (isCompact ? "text-sm" : "text-base")
        }
      >
        {status === "loading" ? "Sending…" : "Send it"}
      </button>
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={
          "text-xs " +
          (status === "error" ? "text-error" : "text-muted") +
          (isCompact ? " sm:basis-full" : "")
        }
      >
        {status === "error"
          ? errorMessage(errorCode)
          : "One email. No spam. Unsubscribe anytime."}
      </p>
    </form>
  );
}

function errorMessage(code: string | null): string {
  switch (code) {
    case "invalid_email":
      return "That email address doesn’t look right — give it another go.";
    case "subscribe_disabled":
      return "Sign-ups are paused right now. Try again in a minute.";
    case "upstream_error":
      return "Our email provider hiccuped. Try again in a minute.";
    case "network":
      return "Network error — check your connection and retry.";
    default:
      return "Something went wrong. Try again in a minute.";
  }
}
