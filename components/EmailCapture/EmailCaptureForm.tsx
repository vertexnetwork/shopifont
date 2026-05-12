"use client";

import { useId, useState } from "react";

/**
 * Anonymous email capture. Posts JSON to the /api/subscribe Edge
 * Function which proxies to Resend Audiences and (when the spoke has
 * a verified sender configured) sends a welcome email.
 *
 * Delivery contract:
 *   - The deliverable (checklist URL + return URL) is returned in the
 *     API response body and rendered inline in the success state. The
 *     user always gets the link in-browser regardless of whether the
 *     welcome email actually went out — this is the load-bearing
 *     delivery channel and works across spokes that don't have a
 *     verified Resend domain.
 *   - If the welcome email also fired, we tack on a confirmation note
 *     ("Also sent to your inbox") so the user knows to check email
 *     later.
 *
 * Two render contexts:
 *   - "footer" — sits in the global footer card.
 *   - "landing" — the /font-pairing-checklist page provides surrounding
 *     copy.
 */

type SuccessPayload = {
  checklistUrl: string;
  returnUrl: string;
  emailSent: boolean;
};

export function EmailCaptureForm({
  variant = "footer",
  source,
}: {
  variant?: "footer" | "landing";
  source?: string;
}) {
  const inputId = useId();
  const statusId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessPayload | null>(null);

  const isCompact = variant === "footer";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrorCode(null);
    // Capture the current URL so the welcome email can deep-link the
    // user back to wherever they were — preserving any encoded
    // generator config in the search string. Server-side sanitization
    // strips off-origin URLs before they reach the response body.
    const returnUrl =
      typeof window !== "undefined" ? window.location.href : "";
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, returnUrl }),
      });
      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as Partial<
          SuccessPayload & { ok: boolean }
        >;
        setSuccess({
          checklistUrl: data.checklistUrl ?? "",
          returnUrl: data.returnUrl ?? "",
          emailSent: Boolean(data.emailSent),
        });
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

  if (status === "ok" && success) {
    return <SuccessPanel success={success} isCompact={isCompact} />;
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

/**
 * Post-capture success panel. Always renders the checklist link
 * in-browser so the user has the deliverable immediately — this is
 * the load-bearing delivery channel that works across every spoke
 * regardless of whether the welcome email actually went out.
 *
 * The "Email this to me" button uses a `mailto:` link pre-filled with
 * the deliverable URLs. The user's mail client opens; they send to
 * themselves. Zero server-side sending required, so it works on
 * spokes without a verified Resend domain.
 */
function SuccessPanel({
  success,
  isCompact,
}: {
  success: SuccessPayload;
  isCompact: boolean;
}) {
  const mailtoBody = encodeURIComponent(
    [
      "Your Shopify font-pairing checklist is ready.",
      "",
      "1. Printable checklist (opens the print dialog so you can save as PDF):",
      `   ${success.checklistUrl}`,
      "",
      "2. Generator with your config restored:",
      `   ${success.returnUrl}`,
      "",
      "— Sent from Shopifont",
    ].join("\n"),
  );
  const mailtoSubject = encodeURIComponent(
    "Your Shopify font-pairing checklist",
  );
  const mailtoHref = `mailto:?subject=${mailtoSubject}&body=${mailtoBody}`;

  const textSize = isCompact ? "text-sm" : "text-base";

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        "flex flex-col gap-3 rounded-md border border-electric/30 bg-electric/[0.04] p-4 " +
        textSize
      }
    >
      <p className="text-charcoal">
        <strong className="font-semibold">You&apos;re in.</strong> The
        checklist is ready below.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href={success.checklistUrl}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center justify-center min-h-[var(--spacing-touch)] px-4 rounded-md bg-electric text-paper font-semibold shadow-cta hover:bg-electric-hover whitespace-nowrap"
        >
          Open checklist (PDF)
        </a>
        <a
          href={mailtoHref}
          className="inline-flex items-center justify-center min-h-[var(--spacing-touch)] px-4 rounded-md border border-charcoal-line/40 text-charcoal hover:border-electric hover:text-electric"
        >
          Email this to me
        </a>
      </div>
      <p className="text-xs text-muted">
        {success.emailSent
          ? "Also sent to your inbox — check spam if it doesn't arrive in 1–2 minutes."
          : "Tip: bookmark the checklist URL or use ‘Email this to me’ to save a copy."}
      </p>
    </div>
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
