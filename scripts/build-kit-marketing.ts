/**
 * Builds the Gumroad launch assets for the Shopify Typography Kits into
 * `kits/dist/marketing/` — the product images (cover, thumbnail,
 * previews) plus the listing copy and the post-purchase content page.
 *
 * METHODOLOGY, NOT A COPY. The pipeline mirrors the etsymargin.tools
 * playbook (SVG strings rasterized with sharp; copy generated from the
 * product's single source of truth; lead with the pain, not the
 * feature list). But every token, every word, and every layout here is
 * Shopifont's own — electric-blue/charcoal, typography language, the
 * "stock vs on-brand" story. Nothing is lifted from the sibling.
 *
 * Source of truth: content/kits.ts + content/themes.ts + the brand
 * tokens in lib/site-config.ts. Regenerable + deterministic — re-run
 * after any product/brand change and the whole kit re-renders in
 * lock-step, so the listing can never quietly drift from the product:
 *   npx tsx scripts/build-kit-marketing.ts
 *
 * Output lands in the gitignored kits/dist/ staging area (binary +
 * regenerable). Upload the PNGs to the Gumroad listing, paste
 * GUMROAD-LISTING.md into the Description field and
 * GUMROAD-CONTENT-PAGE.md into the post-purchase Content field.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { KITS, type Kit } from "../content/kits";
import { THEMES } from "../content/themes";
import { siteConfig } from "../lib/site-config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const OUT = resolve(projectRoot, "kits", "dist", "marketing");

const PRICE_LABEL = siteConfig.features.kit.priceLabel; // "$19 · one-time · instant download"
const PRICE = "$19";

/**
 * Brand tokens. The core palette is pulled from the site's single
 * source of truth so the imagery can never drift from the live site;
 * the few extra shades are marketing-only tints, flagged as such.
 */
const C = {
  paper: siteConfig.theme.colors.bg, // #ffffff
  ink: siteConfig.theme.colors.onBg, // #1a1a1a
  electric: siteConfig.theme.colors.accent, // #0066ff
  muted: siteConfig.theme.colors.muted, // #5a5a5a
  onAccent: siteConfig.theme.colors.onAccent, // #ffffff
  // marketing-only tints (not site tokens):
  electricDeep: "#0047b3", // pressed/electric shade for the dark panel
  paperDim: "#f4f6fb", // faint electric-tinted surface
  line: "#e6e8ee", // soft hairline
  stock: "#9aa0a6", // the dull grey that represents "stock / generic"
} as const;

const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', 'Iowan Old Style', serif";

// --- SVG primitives -------------------------------------------------

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type TextOpts = {
  size?: number;
  weight?: number;
  fill?: string;
  family?: string;
  anchor?: "start" | "middle" | "end";
  spacing?: number;
  opacity?: number;
};

function text(x: number, y: number, body: string, o: TextOpts = {}): string {
  const {
    size = 24,
    weight = 400,
    fill = C.ink,
    family = SANS,
    anchor = "start",
    spacing,
    opacity = 1,
  } = o;
  const ls = spacing !== undefined ? ` letter-spacing="${spacing}"` : "";
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" opacity="${opacity}"${ls}>${esc(
    body,
  )}</text>`;
}

function rect(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  rx = 0,
  opts: { stroke?: string; strokeWidth?: number } = {},
): string {
  const stroke = opts.stroke
    ? ` stroke="${opts.stroke}" stroke-width="${opts.strokeWidth ?? 1}"`
    : "";
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${stroke} />`;
}

function svg(width: number, height: number, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}

/** Greedy word-wrap into at most `maxLines` lines of ~`maxChars` each. */
function wrap(s: string, maxChars: number, maxLines = 99): string[] {
  const words = s.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

/** The Shopifont mark: a rounded "Aa" tile in electric blue. */
function mark(x: number, y: number, size: number): string {
  return [
    rect(x, y, size, size, C.electric, size * 0.22),
    text(x + size / 2, y + size * 0.68, "Aa", {
      size: size * 0.5,
      weight: 700,
      fill: C.onAccent,
      anchor: "middle",
      family: SERIF,
    }),
  ].join("");
}

function wordmark(x: number, y: number, tile = 44): string {
  return [
    mark(x, y, tile),
    text(x + tile + 14, y + tile * 0.68, siteConfig.name, {
      size: tile * 0.62,
      weight: 700,
      fill: C.ink,
    }),
  ].join("");
}

async function writePng(file: string, svgStr: string): Promise<void> {
  const full = resolve(OUT, file);
  mkdirSync(dirname(full), { recursive: true });
  await sharp(Buffer.from(svgStr)).png().toFile(full);
}

// --- Images ---------------------------------------------------------

/** 1280×720 — Gumroad storefront cover. Pain-first, price in the rail. */
function coverSvg(): string {
  const W = 1280;
  const H = 720;
  const railW = 380;
  const padX = 72;
  const bodyW = W - railW;

  const headline = ["Your store looks", "like every other", "Shopify store."];
  const parts: string[] = [];

  parts.push(rect(0, 0, W, H, C.paper));
  // left body
  parts.push(wordmark(padX, 64, 46));
  parts.push(
    text(padX, 196, "DONE-FOR-YOU SHOPIFY TYPOGRAPHY", {
      size: 17,
      weight: 700,
      fill: C.electric,
      spacing: 2.4,
    }),
  );
  headline.forEach((line, i) => {
    parts.push(
      text(padX, 268 + i * 78, line, {
        size: 70,
        weight: 800,
        fill: C.ink,
        family: SERIF,
      }),
    );
  });
  parts.push(
    text(padX, 268 + 3 * 78 + 18, "It's the fonts. Fix it in five minutes.", {
      size: 30,
      weight: 600,
      fill: C.electric,
    }),
  );
  // foot trust line
  parts.push(
    text(padX, H - 56, "6 curated kits · all 13 free themes · no app, pure CSS", {
      size: 19,
      weight: 500,
      fill: C.muted,
    }),
  );
  parts.push(
    text(padX, H - 28, siteConfig.domain, {
      size: 18,
      weight: 700,
      fill: C.ink,
    }),
  );

  // right rail — dark electric panel with price + what's inside
  const rx = bodyW;
  parts.push(rect(rx, 0, railW, H, C.electricDeep));
  parts.push(
    text(rx + 40, 96, "THE BUNDLE", {
      size: 15,
      weight: 700,
      fill: "#a9c6ff",
      spacing: 2.4,
    }),
  );
  parts.push(
    text(rx + 40, 188, PRICE, {
      size: 104,
      weight: 800,
      fill: C.onAccent,
      family: SERIF,
    }),
  );
  parts.push(
    text(rx + 40, 222, "one-time · instant download", {
      size: 17,
      weight: 500,
      fill: "#cfe0ff",
    }),
  );
  const bullets = [
    "6 proven font pairings",
    "Install code, all 13 themes",
    "Visual specimen per kit",
    "Licensing cleared (OFL)",
    "Clean uninstall sheet",
    "7-day refund, no questions",
  ];
  bullets.forEach((b, i) => {
    const y = 300 + i * 56;
    parts.push(
      text(rx + 40, y, "✓", { size: 22, weight: 800, fill: "#7fd0a0" }),
    );
    parts.push(
      text(rx + 70, y, b, { size: 21, weight: 500, fill: C.onAccent }),
    );
  });

  return svg(W, H, parts.join(""));
}

/**
 * 600×600 — grid/social thumbnail. Leads with the OUTCOME, not the
 * product name — "stop looking stock" is the hook; "Typography Kits" is
 * the value-add deliverable, demoted to the footer line.
 */
function thumbnailSvg(): string {
  const S = 600;
  const pad = 52;
  const parts: string[] = [rect(0, 0, S, S, C.ink)];
  parts.push(mark(pad, pad, 60));
  ["STOP", "LOOKING"].forEach((line, i) => {
    parts.push(
      text(pad, 252 + i * 76, line, {
        size: 68,
        weight: 800,
        fill: C.onAccent,
        family: SANS,
      }),
    );
  });
  parts.push(
    text(pad, 252 + 2 * 76 + 12, "STOCK.", {
      size: 112,
      weight: 800,
      fill: C.electric,
      family: SERIF,
    }),
  );
  parts.push(
    text(pad, S - 86, "Done-for-you Shopify typography", {
      size: 24,
      weight: 600,
      fill: "#cfe0ff",
    }),
  );
  parts.push(
    text(pad, S - 52, `Typography Kits · ${PRICE} · all 13 themes`, {
      size: 19,
      weight: 500,
      fill: "#8fb4ff",
    }),
  );
  return svg(S, S, parts.join(""));
}

/** 1280×800 — the core story: stock vs. on-brand, side by side. */
function previewContrastSvg(): string {
  const W = 1280;
  const H = 800;
  const pad = 64;
  const colGap = 40;
  const colW = (W - pad * 2 - colGap) / 2;
  const parts: string[] = [rect(0, 0, W, H, C.paper)];

  parts.push(
    text(pad, 86, "THE SAME PRODUCT PAGE — TWO TYPEFACES", {
      size: 19,
      weight: 700,
      fill: C.electric,
      spacing: 2,
    }),
  );

  const card = (
    x: number,
    label: string,
    labelColor: string,
    headingFamily: string,
    fill: string,
    note: string,
  ): string => {
    const top = 120;
    const cardH = 520;
    const b: string[] = [];
    b.push(rect(x, top, colW, cardH, C.paper, 16, { stroke: C.line, strokeWidth: 2 }));
    b.push(
      rect(x, top, colW, 52, label === "STOCK" ? C.paperDim : C.electric, 16),
    );
    b.push(rect(x, top + 26, colW, 26, label === "STOCK" ? C.paperDim : C.electric));
    b.push(
      text(x + 24, top + 34, label, {
        size: 16,
        weight: 800,
        fill: labelColor,
        spacing: 2,
      }),
    );
    // mock storefront
    const ix = x + 36;
    b.push(
      text(ix, top + 120, "NEW IN", {
        size: 13,
        weight: 700,
        fill: C.muted,
        spacing: 2,
        family: headingFamily,
      }),
    );
    b.push(
      text(ix, top + 168, "The Signature Coat", {
        size: 38,
        weight: 700,
        fill,
        family: headingFamily,
      }),
    );
    b.push(
      text(ix, top + 212, "Wool-cashmere, made in small batches.", {
        size: 17,
        weight: 400,
        fill: C.muted,
        family: SANS,
      }),
    );
    b.push(
      text(ix, top + 268, "$248.00", {
        size: 26,
        weight: 700,
        fill,
        family: headingFamily,
      }),
    );
    b.push(rect(ix, top + 296, 168, 46, label === "STOCK" ? C.stock : C.electric, 8));
    b.push(
      text(ix + 84, top + 325, "Add to cart", {
        size: 16,
        weight: 600,
        fill: C.onAccent,
        anchor: "middle",
      }),
    );
    // note
    wrap(note, 44, 3).forEach((l, i) =>
      b.push(
        text(ix, top + 392 + i * 26, l, {
          size: 16,
          weight: 500,
          fill: label === "STOCK" ? C.muted : C.ink,
        }),
      ),
    );
    return b.join("");
  };

  parts.push(
    card(
      pad,
      "STOCK",
      C.muted,
      SANS,
      C.stock,
      "Theme default (Assistant). Reads competent — and identical to thousands of other stores.",
    ),
  );
  parts.push(
    card(
      pad + colW + colGap,
      "WITH A KIT",
      C.onAccent,
      SERIF,
      C.ink,
      "Premium Editorial (Fraunces + Inter). Same page, same code budget — now it reads like a brand.",
    ),
  );

  parts.push(
    text(W / 2, H - 36, "A five-minute, CSS-only change. Fully reversible.", {
      size: 22,
      weight: 600,
      fill: C.ink,
      anchor: "middle",
    }),
  );
  return svg(W, H, parts.join(""));
}

/** 1280×800 — the six kits, each a named pairing for a store type. */
function previewKitsSvg(): string {
  const W = 1280;
  const H = 800;
  const pad = 64;
  const parts: string[] = [rect(0, 0, W, H, C.paper)];
  parts.push(
    text(pad, 84, "WHAT YOU GET · 6 KITS, ONE MATCHED TO YOUR STORE", {
      size: 19,
      weight: 700,
      fill: C.electric,
      spacing: 2,
    }),
  );

  const cols = 2;
  const gap = 28;
  const cardW = (W - pad * 2 - gap) / cols;
  const cardH = 188;
  const startY = 120;
  KITS.forEach((kit: Kit, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = pad + col * (cardW + gap);
    const y = startY + row * (cardH + gap);
    const pairing = kit.singleFamily
      ? kit.heading.family
      : `${kit.heading.family} + ${kit.body.family}`;
    parts.push(rect(x, y, cardW, cardH, C.paper, 14, { stroke: C.line, strokeWidth: 2 }));
    parts.push(rect(x, y, 6, cardH, C.electric, 0));
    parts.push(
      text(x + 32, y + 50, kit.name, {
        size: 28,
        weight: 700,
        fill: C.ink,
        family: SERIF,
      }),
    );
    parts.push(
      text(x + 32, y + 84, pairing, {
        size: 18,
        weight: 700,
        fill: C.electric,
        family: SANS,
      }),
    );
    wrap(kit.vertical, 52, 2).forEach((l, j) =>
      parts.push(
        text(x + 32, y + 120 + j * 26, l, {
          size: 16,
          weight: 400,
          fill: C.muted,
        }),
      ),
    );
  });

  return svg(W, H, parts.join(""));
}

/** 1280×800 — what's inside / how fast it is. */
function previewInsideSvg(): string {
  const W = 1280;
  const H = 800;
  const pad = 64;
  const parts: string[] = [rect(0, 0, W, H, C.paper)];
  parts.push(
    text(pad, 84, "WHAT'S IN EVERY KIT", {
      size: 19,
      weight: 700,
      fill: C.electric,
      spacing: 2,
    }),
  );

  const stats: Array<[string, string, string]> = [
    ["13", "themes", "Pre-built install code for every free OS 2.0 theme"],
    ["2", "blocks", "Paste two CSS blocks — that's the whole install"],
    ["5", "minutes", "Decided, installed, and previewed before you ship"],
  ];
  const gap = 28;
  const cardW = (W - pad * 2 - gap * 2) / 3;
  const top = 120;
  stats.forEach(([n, unit, body], i) => {
    const x = pad + i * (cardW + gap);
    parts.push(rect(x, top, cardW, 250, C.paperDim, 16));
    parts.push(rect(x, top, cardW, 5, C.electric, 0));
    parts.push(
      text(x + 32, top + 116, n, {
        size: 90,
        weight: 800,
        fill: C.ink,
        family: SERIF,
      }),
    );
    parts.push(
      text(x + 32, top + 150, unit, { size: 22, weight: 600, fill: C.electric }),
    );
    wrap(body, 26, 3).forEach((l, j) =>
      parts.push(
        text(x + 32, top + 192 + j * 24, l, {
          size: 16,
          weight: 400,
          fill: C.muted,
        }),
      ),
    );
  });

  // the contents checklist
  const items = [
    "A proven heading + body pairing for your store type",
    "Copy-paste install code for all 13 free themes",
    "A visual specimen you open in any browser",
    "Licensing cleared — SIL Open Font License, commercial-ready",
    "Font-download sheet with the exact filenames",
    "A clean three-step uninstall sheet",
  ];
  const ly = top + 300;
  parts.push(
    text(pad, ly, "In the box", { size: 24, weight: 700, fill: C.ink }),
  );
  items.forEach((it, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = pad + col * ((W - pad * 2) / 2);
    const y = ly + 44 + row * 46;
    parts.push(text(x, y, "✓", { size: 22, weight: 800, fill: C.electric }));
    parts.push(text(x + 32, y, it, { size: 19, weight: 500, fill: C.ink }));
  });

  parts.push(
    text(W / 2, H - 34, `${PRICE} · one-time · 7-day refund, no questions asked`, {
      size: 21,
      weight: 600,
      fill: C.muted,
      anchor: "middle",
    }),
  );
  return svg(W, H, parts.join(""));
}

// --- Copy -----------------------------------------------------------

function verticalList(): string {
  return KITS.map(
    (k) =>
      `- **${k.name}** (${
        k.singleFamily
          ? k.heading.family
          : `${k.heading.family} + ${k.body.family}`
      }) — ${k.vertical}.`,
  ).join("\n");
}

/** Gumroad "Description" field. Lead with the pain, then the offer. */
function listingMd(): string {
  return `# Make your Shopify store stop looking stock — in five minutes.

Most Shopify stores never change the theme's default font. So they all read
the same: competent, generic, forgettable. A **Shopify Typography Kit** is the
font decision already made — a proven pairing for your store type, the exact
copy-paste install code for your theme, and a specimen so you see it before you
ship it. Built on the same pairings we'd install on a storefront ourselves.

## What you get

- **Six done-for-you kits** — one proven heading + body pairing for each kind of
  store, so you don't guess and don't second-guess.
- **Install code for all 13 free Shopify OS 2.0 themes** — Dawn, Sense, Crave,
  and every other free theme. Two CSS blocks, pasted into one file. No app, no
  JavaScript, nothing that slows your store down.
- **A visual specimen per kit** — an HTML preview you open in any browser, so you
  see the headings, body, and a product card before you touch your theme.
- **Licensing cleared** — every font is SIL Open Font License. Free for
  commercial use on a Shopify storefront, self-hosted, with no seat counts or
  pageview tiers. The kit spells it out in plain English.
- **A font-download sheet** — exactly which free files to grab from Google Fonts
  and the precise filenames the install code expects. No guesswork.
- **A clean uninstall sheet** — three steps to reverse everything. Nothing is
  permanent or stateful.

## Which kit is yours

${verticalList()}

Not sure? Take the free 30-second typography audit at
${siteConfig.domain}/shopify-typography-audit — it reads your theme and store
type and tells you exactly which kit fixes your store.

## The free generator gives you code. A kit gives you the decision.

There's a free font-install generator on ${siteConfig.domain}, and it's genuinely
good — if you already know your font, it writes the install code for you. The kit
is for the other 90% of the job: *which* pairing actually fits your brand and
won't break your theme, the per-theme code already built, the licensing
confirmed, and a specimen so you're sure before you ship. You're paying to skip
the research and the second-guessing, not for the fonts — those are free, and we
tell you exactly where to get them.

## FAQ

**Aren't these fonts free on Google Fonts?**
Yes — and you're not paying for the fonts. You're paying for the finished
decision: the pairing chosen for your store type, the exact per-theme install
code, the licensing cleared, and a specimen so you see the result before you ship
it. The kit is the answer, not the raw materials.

**Will this break my theme?**
No. The install is two CSS blocks pasted into one file (\`assets/base.css\`) plus
the font files in your \`assets/\` folder. Zero JavaScript, it retargets your
theme's own font variables, and it survives theme updates. Every kit includes an
uninstall sheet that reverses it completely in three steps.

**Do I need all six kits?**
You get all six in one purchase — pick the one that matches your store and keep
the rest for later or for your next store.

**Is this affiliated with Shopify?**
No. This is an independent product. "Shopify" and theme names are trademarks of
Shopify Inc., used here for compatibility reference only.

**What if it doesn't work for me?**
No-questions-asked refund within 7 days — just reply to your receipt. Each kit is
fully self-contained, so you never wait on support; the refund exists so a
mismatch is never your problem.

---

**${PRICE_LABEL}.** One purchase, lifetime access, every future kit update free.
*7-day refund, no questions asked — the kit should earn its price the first time
someone calls your store "clean."*
`;
}

/** Gumroad post-purchase "Content" field — what the buyer sees first. */
function contentPageMd(): string {
  const themeExamples = THEMES.slice(0, 3)
    .map((t) => t.name)
    .join(", ");
  return `# Start here — your store looks different in five minutes

Thanks for picking up the Shopify Typography Kits. Everything is in the download —
no account, no login, nothing phones home. Three steps:

## 1. Open the kit for your store

The bundle has six kits, each a folder named for its style:

${KITS.map((k) => `- **${k.name}/** — ${k.vertical}.`).join("\n")}

Open the one that matches your store and read its short \`README.txt\`. Want a
recommendation? The free audit at ${siteConfig.domain}/shopify-typography-audit
names your kit in 30 seconds.

## 2. Get the fonts (free)

Open \`fonts/DOWNLOAD.txt\` in your kit. It lists the exact Google Fonts files to
download (free, open-licensed) and the precise filenames to rename them to — the
install code expects those names. Upload the renamed \`.woff2\` files to your
theme's \`assets/\` folder.

## 3. Paste two blocks into your theme

Open \`install/<your-theme>/\` (for example ${themeExamples}, and ten more) and
follow \`INSTALL.txt\`: paste \`font-face.css\` and \`css-variables.css\` into your
theme's \`assets/base.css\`, and save. Hard-refresh your storefront — your new
typography is live.

Open \`SPECIMEN.html\` any time to preview the pairing in your browser before or
after you install.

## Licensing & refunds

Every font is SIL Open Font License — cleared for commercial use on any store you
own or operate (details in each kit's \`LICENSE-AND-USAGE.txt\`). Please don't
resell or redistribute the kits themselves.

Changed your mind? Reply to your receipt within 7 days for a full refund, no
questions asked. Future updates to any kit are free — save this receipt; that's
the address we'll send them to.

— ${siteConfig.name}, ${siteConfig.domain}
`;
}

// --- Main -----------------------------------------------------------

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });

  await writePng("cover.png", coverSvg());
  await writePng("thumbnail.png", thumbnailSvg());
  await writePng("preview-1-stock-vs-kit.png", previewContrastSvg());
  await writePng("preview-2-the-kits.png", previewKitsSvg());
  await writePng("preview-3-whats-inside.png", previewInsideSvg());

  writeFileSync(resolve(OUT, "GUMROAD-LISTING.md"), listingMd(), "utf8");
  writeFileSync(
    resolve(OUT, "GUMROAD-CONTENT-PAGE.md"),
    contentPageMd(),
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.log(
    `[build-kit-marketing] wrote 5 images + 2 copy files for the ${KITS.length}-kit bundle → ${OUT}`,
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[build-kit-marketing] failed:", err);
  process.exit(1);
});
