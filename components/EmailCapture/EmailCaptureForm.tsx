"use client";

import { useId, useState } from "react";

/**
 * Anonymous email capture. Posts JSON to the /api/subscribe Edge
 * Function which proxies to Resend Audiences. No DB on our side; the
 * audience itself is the contact list.
 *
 * Two render contexts:
 *
 *  - "footer" — sits in the global footer card. Heading + subhead are
 *    rendered by the parent, so the form itself is bare: input +
 *    button + small disclosure line.
 *  - "landing" — same minimum surface, slightly larger type. The
 *    /font-pairing-checklist page provides its own surrounding copy.
 *
 * No internal `<label>` element — both contexts have a heading right
 * above the form that tells the user what they're signing up for.
 * `aria-label` on the input keeps screen readers covered.
 *
 * Layout: input + button on one row (or stacked on the narrowest
 * mobile widths), disclosure / error text on the row below. Avoids
 * the basis-full / flex-wrap dance that broke the previous version.
 */
export function EmailCaptureForm({
  variant = "footer",
  source,
}: {
  variant?: "footer" | "landing";
  /** Optional analytics tag — passed through to /api/subscribe. */
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

  const inputClass =
    "w-full min-h-[var(--spacing-touch)] px-3 rounded-md border border-charcoal-line/40 bg-paper text-charcoal placeholder:text-muted focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/30 " +
    (isCompact ? "text-sm" : "text-base");

  const buttonClass =
    "min-h-[var(--spacing-touch)] px-5 rounded-md bg-electric text-paper font-semibold whitespace-nowrap shadow-cta hover:bg-electric-hover disabled:opacity-50 disabled:cursor-not-allowed " +
    (isCompact ? "text-sm" : "text-base");

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-2"
      aria-describedby={statusId}
    >
      <div className="flex flex-col xs:flex-row sm:flex-row gap-2">
        <input
          id={inputId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="you@store.com"
          aria-label={
            isCompact
              ? "Email for the font-pairing checklist"
              : "Email me the checklist"
          }
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={status === "loading" || email.length === 0}
          className={buttonClass}
        >
          {status === "loading" ? "Sending…" : "Send it"}
        </button>
      </div>
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={"text-xs " + (status === "error" ? "text-error" : "text-muted")}
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
