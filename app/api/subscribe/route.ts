/**
 * POST /api/subscribe — adds an email to the Resend audience that
 * powers the font-pairing-checklist lead magnet.
 *
 * Edge runtime: sub-50ms cold start, well within Vercel's free-tier
 * Edge invocation budget. No database — Resend stores the contacts.
 *
 * The route is the ONLY non-static surface on the site. Every other
 * route is pre-rendered at build time via App Router defaults.
 *
 * Validation is intentionally narrow: we only check that the input
 * looks like an email and that the env vars are configured. Resend
 * itself owns deliverability, dedup beyond a basic 409 short-circuit,
 * and abuse handling. If Resend ever 5xxs we surface 502 so the form
 * shows an honest "try again later" instead of pretending success.
 */

export const runtime = "edge";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

  const email =
    typeof body === "object" && body && "email" in body
      ? String((body as { email: unknown }).email ?? "").trim()
      : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return jsonError(400, "invalid_email");
  }

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

  // Resend returns 409 for duplicates. We treat that as success so a
  // returning visitor gets the same "thanks" UX as a new subscriber.
  if (!upstream.ok && upstream.status !== 409) {
    return jsonError(502, "upstream_error");
  }

  return Response.json({ ok: true });
}

function jsonError(status: number, code: string): Response {
  return Response.json({ ok: false, error: code }, { status });
}
