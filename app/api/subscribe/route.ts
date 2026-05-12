/**
 * POST /api/subscribe — adds an email to the Resend audience that
 * powers the font-pairing-checklist lead magnet, then sends a welcome
 * email containing (a) the printable checklist URL with ?format=pdf so
 * the user lands directly on the print dialog and (b) a deep link back
 * to the generator with the user's config restored.
 *
 * Edge runtime: sub-50ms cold start, well within Vercel's free-tier
 * Edge invocation budget. No database — Resend stores the contacts
 * (audience) AND the send history (transactional emails).
 *
 * Per-spoke isolation: each spoke deploys with its own
 * NEXT_PUBLIC_SITE_URL + NEXT_PUBLIC_SITE_DOMAIN + RESEND_AUDIENCE_ID
 * + RESEND_FROM_EMAIL. The Resend account is shared across the
 * network; the audience and the from-domain are spoke-specific so
 * deliverability scores don't bleed across sites.
 *
 * Failure model: validate inputs and fail fast. Audience-add failures
 * propagate as 502. Welcome-email failures are LOGGED but do NOT fail
 * the request — the contact is captured, that's the load-bearing part;
 * we can resend the welcome later if Resend hiccups.
 */

import { siteConfig } from "@/lib/site-config";
import { renderWelcomeEmail } from "@/lib/welcomeEmail";

export const runtime = "edge";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_RETURN_URL = 2048;

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    return jsonError(503, "subscribe_disabled");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json");
  }

  const { email, returnUrl } = parseBody(body);
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return jsonError(400, "invalid_email");
  }

  // 1. Add to audience. Treat 409 (already subscribed) as success so a
  //    returning visitor still gets the welcome email re-sent.
  const upstream = await fetch(
    `https://api.resend.com/audiences/${audienceId}/contacts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    },
  );

  if (!upstream.ok && upstream.status !== 409) {
    return jsonError(502, "upstream_error");
  }

  // 2. Fire the welcome email. Best-effort — a failure here doesn't
  //    invalidate the contact-add. We log to the Edge logs so a
  //    backlog of failed sends is debuggable from the Vercel dashboard.
  const safeReturnUrl = sanitizeReturnUrl(returnUrl);
  const checklistUrl = `${siteConfig.url}/font-pairing-checklist/sheet?format=pdf&utm_source=email&utm_medium=welcome&utm_campaign=font-pairing-checklist`;
  const email_ = renderWelcomeEmail({
    returnUrl: safeReturnUrl,
    checklistUrl,
  });
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    `${siteConfig.name} <hello@${siteConfig.domain}>`;

  const sendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [email],
      reply_to: siteConfig.supportEmail,
      subject: email_.subject,
      html: email_.html,
      text: email_.text,
      headers: {
        // Helps the receiving MTA classify and lets users one-click
        // unsubscribe in clients that surface the header.
        "List-Unsubscribe": `<mailto:${siteConfig.supportEmail}?subject=unsubscribe>`,
      },
      tags: [
        { name: "kind", value: "welcome" },
        { name: "magnet", value: "font-pairing-checklist" },
      ],
    }),
  });

  if (!sendRes.ok) {
    const detail = await safeText(sendRes);
    console.warn(
      `[subscribe] welcome email failed (${sendRes.status}): ${detail.slice(0, 200)}`,
    );
  }

  return Response.json({ ok: true });
}

function parseBody(body: unknown): { email: string; returnUrl: string } {
  if (typeof body !== "object" || body === null) {
    return { email: "", returnUrl: "" };
  }
  const obj = body as Record<string, unknown>;
  const email =
    typeof obj.email === "string" ? obj.email.trim() : "";
  const returnUrl =
    typeof obj.returnUrl === "string"
      ? obj.returnUrl.slice(0, MAX_RETURN_URL)
      : "";
  return { email, returnUrl };
}

/**
 * Force the returnUrl back to our origin. Prevents an attacker who can
 * call the endpoint from putting an arbitrary URL into a real user's
 * welcome email body. Strategy: parse the supplied URL; if its origin
 * matches `siteConfig.url`, keep the path + search + hash. Otherwise
 * fall back to the site root.
 */
function sanitizeReturnUrl(raw: string): string {
  const fallback = `${siteConfig.url}/`;
  if (!raw) return fallback;
  try {
    const url = new URL(raw);
    const allowedOrigin = new URL(siteConfig.url).origin;
    if (url.origin !== allowedOrigin) return fallback;
    return `${allowedOrigin}${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

function jsonError(status: number, code: string): Response {
  return Response.json({ ok: false, error: code }, { status });
}
