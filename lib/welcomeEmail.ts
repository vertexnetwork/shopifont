import { siteConfig } from "./site-config";

/**
 * Render the welcome email sent after a successful (or 409 "already
 * subscribed") audience-add via Resend.
 *
 * Constraints driven by email-client compatibility:
 *   - Inline styles only (Gmail strips <style> blocks)
 *   - No external CSS, no web fonts, no JavaScript
 *   - Single column, max-width 560px (Outlook desktop wraps wider)
 *   - System font stack so the body renders in the client's UI font
 *   - Brand color (electric blue) limited to the primary CTA; everything
 *     else is monochrome so deliverability filters don't flag it as
 *     marketing-y
 */

export type WelcomeEmailInput = {
  /** Where the user was when they signed up — restored as a deep link. */
  returnUrl: string;
  /** Print-format URL of the checklist sheet, ideally with ?format=pdf. */
  checklistUrl: string;
};

export type WelcomeEmail = {
  subject: string;
  html: string;
  text: string;
};

export function renderWelcomeEmail(input: WelcomeEmailInput): WelcomeEmail {
  const accent = siteConfig.theme.colors.accent;
  const onAccent = siteConfig.theme.colors.onAccent;
  const muted = "#666666";
  const text = "#1a1a1a";
  const border = "#e5e5e5";

  const subject = `Your Shopify font-pairing checklist + generator config`;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${text};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;">
          <tr>
            <td style="padding-bottom:16px;border-bottom:1px solid ${border};">
              <p style="margin:0;font-size:12px;color:${muted};letter-spacing:0.12em;text-transform:uppercase;">${escapeHtml(siteConfig.name)}</p>
              <h1 style="margin:8px 0 0;font-size:22px;line-height:1.25;color:${text};">Your font-pairing checklist is ready</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0 0;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:${text};">
                Thanks for signing up. Two links below — the first is the printable six-axis checklist, the second takes you back to the generator with the exact font/weight/style config you had open when you signed up.
              </p>
            </td>
          </tr>
          <tr>
            <td align="left" style="padding:16px 0 24px;">
              <a href="${escapeAttr(input.checklistUrl)}" style="display:inline-block;padding:14px 24px;background:${accent};color:${onAccent};text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">Open the checklist (auto-prints to PDF)</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px;">
              <p style="margin:0;font-size:13px;line-height:1.55;color:${muted};">
                The link above opens the checklist with your browser&rsquo;s print dialog pre-opened. Choose &ldquo;Save as PDF&rdquo; (Chrome, Edge, Safari) or &ldquo;Microsoft Print to PDF&rdquo; (Windows) and you have a clean one-page file to keep with your brand assets.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0;border-top:1px solid ${border};">
              <p style="margin:0 0 12px;font-size:14px;color:${text};"><strong>Your generator config:</strong></p>
              <p style="margin:0 0 12px;font-size:14px;line-height:1.55;word-break:break-all;">
                <a href="${escapeAttr(input.returnUrl)}" style="color:${accent};text-decoration:underline;">${escapeHtml(input.returnUrl)}</a>
              </p>
              <p style="margin:0;font-size:13px;line-height:1.55;color:${muted};">
                Bookmark this URL if you want to come back to the exact font, weight, style, and any advanced options you had configured.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0 0;border-top:1px solid ${border};">
              <p style="margin:0 0 8px;font-size:13px;line-height:1.55;color:${muted};">
                Sent from ${escapeHtml(siteConfig.name)} &mdash; free Shopify custom-font CSS generator at <a href="${escapeAttr(siteConfig.url)}" style="color:${muted};">${escapeHtml(siteConfig.domain)}</a>.
              </p>
              <p style="margin:0;font-size:13px;line-height:1.55;color:${muted};">
                You&rsquo;ll only receive a handful of low-frequency emails from us. Reply with &ldquo;unsubscribe&rdquo; any time and we&rsquo;ll remove you from the list.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Plain-text fallback — many spam filters require multipart messages
  // to ship both an HTML and a text body. Mirrors the structure above.
  const textBody = [
    `Your Shopify font-pairing checklist is ready.`,
    ``,
    `Thanks for signing up. Two links below.`,
    ``,
    `1. The printable six-axis checklist (opens the print dialog so you can save as PDF):`,
    `   ${input.checklistUrl}`,
    ``,
    `2. The generator with your config restored:`,
    `   ${input.returnUrl}`,
    ``,
    `Bookmark the second link if you want to come back to the exact font, weight, style, and advanced options you had configured.`,
    ``,
    `---`,
    `${siteConfig.name} — ${siteConfig.url}`,
    `Reply with "unsubscribe" any time and we'll remove you from the list.`,
  ].join("\n");

  return { subject, html, text: textBody };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}
