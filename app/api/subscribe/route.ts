/**
 * POST /api/subscribe — captures an email into a Resend audience and
 * returns the lead-magnet deliverable URLs so the form can show them
 * inline. Optionally also fires a welcome email when the spoke has a
 * verified Resend sender configured (RESEND_FROM_EMAIL set).
 *
 * Two-mode design works around Resend's free-tier 1-verified-domain
 * limit: every spoke can capture into its own audience (no domain
 * needed), and only the spoke(s) with a verified sender opt into the
 * /emails transactional send. Spokes without a sender still deliver
 * the checklist URL — the success screen renders the same links the
 * email would have contained.
 *
 * Per-spoke isolation:
 *   - RESEND_AUDIENCE_ID is per-spoke (each spoke writes into its own
 *     audience inside a shared Resend account).
 *   - RESEND_FROM_EMAIL is per-spoke. Unset → no welcome email; set →
 *     send via /emails using that From address.
 *
 * Edge runtime: sub-50ms cold start. No DB — Resend stores contacts;
 * we don't persist anything server-side beyond what Resend already
 * keeps.
 *
 * Failure model:
 *   - Audience-add failure → 502, the form shows an error.
 *   - Welcome-email failure → logged, the form still gets ok:true
 *     because the deliverable URL is what actually matters.
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

  const { email, returnUrl: rawReturnUrl } = parseBody(body);
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return jsonError(400, "invalid_email");
  }

  // 1. Add to audience. Treat 409 (already subscribed) as success so
  //    returning visitors still get the deliverable URLs back.
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

  // 2. Resolve deliverable URLs. Always returned in the response so the
  //    success screen can render them inline — this is the actual
  //    delivery channel for spokes without a verified Resend sender.
  const safeReturnUrl = sanitizeReturnUrl(rawReturnUrl);
  const checklistUrl = `${siteConfig.url}/font-pairing-checklist/sheet?format=pdf&utm_source=lead-magnet&utm_medium=form&utm_campaign=font-pairing-checklist`;

  // 3. Optionally fire the welcome email. Only when the spoke has a
  //    verified Resend sender configured. Failure is logged but
  //    doesn't change the response status — the user already has the
  //    URLs in the form response.
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  let emailSent = false;
  if (fromEmail) {
    const rendered = renderWelcomeEmail({
      returnUrl: safeReturnUrl,
      checklistUrl,
    });
    try {
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
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
          headers: {
            "List-Unsubscribe": `<mailto:${siteConfig.supportEmail}?subject=unsubscribe>`,
          },
          tags: [
            { name: "kind", value: "welcome" },
            { name: "magnet", value: "font-pairing-checklist" },
          ],
        }),
      });
      if (sendRes.ok) {
        emailSent = true;
      } else {
        const detail = await safeText(sendRes);
        console.warn(
          `[subscribe] welcome email failed (${sendRes.status}): ${detail.slice(0, 200)}`,
        );
      }
    } catch (err) {
      console.warn(`[subscribe] welcome email threw: ${String(err)}`);
    }
  }

  return Response.json({
    ok: true,
    checklistUrl,
    returnUrl: safeReturnUrl,
    emailSent,
  });
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
 * welcome email body OR into the API response (which the form then
 * renders as a clickable link).
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
