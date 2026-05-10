/**
 * CSP composer. Returns a `Content-Security-Policy` header string built
 * from the set of providers the deploy actually has switched on.
 *
 * Spec §11: avoids shipping every spoke with the union allowlist.
 * Mediavine + AdSense + Plausible + Clarity each carry their own
 * domains; flagging only the active providers keeps the policy as
 * tight as possible without manual edits.
 */

export type CspProviders = {
  vercelAnalytics?: boolean;
  adsense?: boolean;
  mediavine?: boolean;
  carbon?: boolean;
  clarity?: boolean;
  plausible?: boolean;
  /** Allow `frame-ancestors *` (the /embed iframe surface). */
  embeddable?: boolean;
};

type Sources = {
  scriptSrc: Set<string>;
  styleSrc: Set<string>;
  imgSrc: Set<string>;
  fontSrc: Set<string>;
  connectSrc: Set<string>;
  frameSrc: Set<string>;
  frameAncestors: Set<string>;
};

function emptySources(): Sources {
  return {
    // 'self' + 'unsafe-inline' for scripts is unfortunate but Next.js
    // injects inline bootstrap scripts into the document; switching to
    // strict-dynamic with nonces is a separate, larger change.
    scriptSrc: new Set([
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://va.vercel-scripts.com",
    ]),
    styleSrc: new Set(["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"]),
    imgSrc: new Set(["'self'", "data:", "blob:"]),
    fontSrc: new Set(["'self'", "https://fonts.gstatic.com", "data:"]),
    connectSrc: new Set([
      "'self'",
      "https://api.resend.com",
      "https://va.vercel-scripts.com",
      "https://vitals.vercel-insights.com",
    ]),
    frameSrc: new Set(["'self'"]),
    frameAncestors: new Set(["'none'"]),
  };
}

function add(set: Set<string>, ...values: string[]): void {
  for (const v of values) set.add(v);
}

export function buildCSP(providers: CspProviders): string {
  const s = emptySources();

  if (providers.adsense) {
    add(
      s.scriptSrc,
      "https://pagead2.googlesyndication.com",
      "https://googleads.g.doubleclick.net",
      "https://www.googletagservices.com",
    );
    add(
      s.imgSrc,
      "https://*.googlesyndication.com",
      "https://*.g.doubleclick.net",
      "https://*.google.com",
    );
    add(
      s.frameSrc,
      "https://googleads.g.doubleclick.net",
      "https://*.safeframe.googlesyndication.com",
    );
    add(
      s.connectSrc,
      "https://pagead2.googlesyndication.com",
      "https://googleads.g.doubleclick.net",
    );
  }

  if (providers.mediavine) {
    add(s.scriptSrc, "https://faves.grow.me", "https://scripts.mediavine.com");
    add(s.imgSrc, "https://*.mediavine.com", "https://faves.grow.me");
    add(s.connectSrc, "https://faves.grow.me", "https://scripts.mediavine.com");
    add(s.frameSrc, "https://*.mediavine.com");
  }

  if (providers.carbon) {
    add(s.scriptSrc, "https://cdn.carbonads.com", "https://srv.carbonads.net");
    add(s.imgSrc, "https://*.carbonads.com", "https://*.carbonads.net");
  }

  if (providers.clarity) {
    add(s.scriptSrc, "https://www.clarity.ms");
    add(s.connectSrc, "https://*.clarity.ms");
    add(s.imgSrc, "https://*.clarity.ms");
  }

  if (providers.plausible) {
    add(s.scriptSrc, "https://plausible.io");
    add(s.connectSrc, "https://plausible.io");
  }

  if (providers.embeddable) {
    s.frameAncestors.clear();
    s.frameAncestors.add("*");
  }

  const directives: Array<[string, Set<string>]> = [
    ["default-src", new Set(["'self'"])],
    ["script-src", s.scriptSrc],
    ["style-src", s.styleSrc],
    ["img-src", s.imgSrc],
    ["font-src", s.fontSrc],
    ["connect-src", s.connectSrc],
    ["frame-src", s.frameSrc],
    ["frame-ancestors", s.frameAncestors],
    ["base-uri", new Set(["'self'"])],
    ["form-action", new Set(["'self'"])],
    ["object-src", new Set(["'none'"])],
  ];

  return directives
    .map(([name, values]) => `${name} ${[...values].join(" ")}`)
    .join("; ");
}

/**
 * Helper for `next.config.ts` and `vercel.json` that reads the same
 * env vars the (site) layout uses to switch providers.
 */
export function buildCSPFromEnv(opts: { embeddable?: boolean } = {}): string {
  const provider = (
    process.env.NEXT_PUBLIC_AD_PROVIDER ?? process.env.NEXT_PUBLIC_AD_NETWORK
  )
    ?.trim()
    .toLowerCase();
  return buildCSP({
    adsense: provider === "adsense",
    mediavine: provider === "mediavine",
    carbon: provider === "carbon",
    clarity: Boolean(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim()),
    plausible: Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim()),
    vercelAnalytics: true,
    embeddable: opts.embeddable,
  });
}
