/**
 * Server-side email validation for /api/subscribe. Three layers, ordered
 * cheapest → most expensive:
 *
 *   1. Syntax regex.
 *   2. Disposable-domain blocklist. Small static list of the most-used
 *      throwaway services; not exhaustive but catches the lazy ~80% of
 *      junk signups.
 *   3. MX-record check via Cloudflare DNS-over-HTTPS. Confirms the
 *      domain can actually receive mail. ~100-200ms added latency;
 *      fails OPEN (returns valid) on network error so a DoH outage
 *      doesn't block real users.
 *
 * Runs on Edge — `fetch` to DoH is the only network primitive needed,
 * no DNS resolver library. No API key required.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Disposable / temporary email providers. Curated from common public
 * blocklists; intentionally a short list (the top ~40) rather than
 * a 10k-domain dump. The long tail is low-volume and adding it bloats
 * the Edge bundle for marginal blocking gain.
 */
const DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set([
  "0-mail.com",
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "33mail.com",
  "anonymbox.com",
  "byom.de",
  "discard.email",
  "discardmail.com",
  "dispostable.com",
  "emailondeck.com",
  "fakeinbox.com",
  "getairmail.com",
  "gettempmail.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "harakirimail.com",
  "incognitomail.com",
  "inboxalias.com",
  "inboxbear.com",
  "jetable.org",
  "mail-temporaire.fr",
  "mailcatch.com",
  "maildrop.cc",
  "mailinator.com",
  "mailinator.net",
  "mailinator.org",
  "mailinator2.com",
  "mintemail.com",
  "mohmal.com",
  "moakt.com",
  "nada.email",
  "sharklasers.com",
  "spam4.me",
  "spambox.us",
  "tempmail.org",
  "tempmail.com",
  "temp-mail.io",
  "temp-mail.org",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
]);

export type ValidationResult =
  | { ok: true }
  | { ok: false; code: "invalid_email" | "disposable_email" | "undeliverable" };

export async function validateEmail(
  email: string,
): Promise<ValidationResult> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed) || trimmed.length > 254) {
    return { ok: false, code: "invalid_email" };
  }

  const atIdx = trimmed.lastIndexOf("@");
  const domain = trimmed.slice(atIdx + 1);
  if (!domain || domain.length < 3) {
    return { ok: false, code: "invalid_email" };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, code: "disposable_email" };
  }

  const reachable = await domainHasMx(domain);
  if (!reachable) {
    return { ok: false, code: "undeliverable" };
  }

  return { ok: true };
}

/**
 * Query Cloudflare DoH for the domain's MX record. Returns true if at
 * least one MX answer exists, OR if the lookup itself fails (we fail
 * OPEN — a DNS outage on our side shouldn't block legitimate users).
 *
 * Hard 2-second timeout via AbortSignal so a slow DoH response doesn't
 * stall the form submission past a reasonable UX bound.
 */
async function domainHasMx(domain: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(
      `https://1.1.1.1/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      {
        headers: { Accept: "application/dns-json" },
        signal: controller.signal,
      },
    );
    clearTimeout(timeout);
    if (!res.ok) return true;
    const data = (await res.json()) as {
      Status?: number;
      Answer?: Array<{ type?: number; data?: string }>;
    };
    // DNS status 0 = NOERROR. 3 = NXDOMAIN (domain doesn't exist).
    if (data.Status === 3) return false;
    if (typeof data.Status === "number" && data.Status !== 0) return true;
    if (!Array.isArray(data.Answer) || data.Answer.length === 0) {
      // Some valid mail domains use A records as MX-fallback (RFC 5321
      // §5.1). Re-query for an A record before declaring undeliverable.
      return domainHasA(domain);
    }
    return true;
  } catch {
    return true;
  }
}

async function domainHasA(domain: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(
      `https://1.1.1.1/dns-query?name=${encodeURIComponent(domain)}&type=A`,
      {
        headers: { Accept: "application/dns-json" },
        signal: controller.signal,
      },
    );
    clearTimeout(timeout);
    if (!res.ok) return true;
    const data = (await res.json()) as {
      Status?: number;
      Answer?: Array<unknown>;
    };
    if (data.Status === 3) return false;
    return Array.isArray(data.Answer) && data.Answer.length > 0;
  } catch {
    return true;
  }
}
