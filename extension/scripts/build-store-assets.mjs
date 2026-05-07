/**
 * Compose Web Store marketing assets from a single popup screenshot.
 *
 * Drop a clean popup capture at:
 *   extension/store-assets/source/popup.png
 *
 * Then run `npm run assets:store` and the script writes four PNGs to
 * extension/store-assets/dist/ at the exact dimensions Chrome's Web
 * Store dashboard expects:
 *
 *   - screenshot-1-tagline-1280x800.png   (lead screenshot, popup centered)
 *   - screenshot-2-features-1280x800.png  (feature list left, popup right)
 *   - promo-tile-small-440x280.png        (browse-view promo tile)
 *   - promo-tile-marquee-1400x560.png     (large promo, only used if featured)
 *
 * All four lean on the website's brand language (charcoal canvas with
 * an electric-blue radial glow, the Shopifont logo glyph, system-font
 * stack typography) so the extension reads as a member of the same
 * product family as shopifont.app — without claiming functionality
 * the popup doesn't have.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, existsSync } from "node:fs";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const sourceDir = path.join(root, "store-assets", "source");
const outDir = path.join(root, "store-assets", "dist");

// Brand tokens — match app/globals.css. Muted is lifted vs. the
// website because the canvas here is dark and the website's #5a5a5a
// would disappear.
const CHARCOAL = "#1a1a1a";
const PAPER = "#ffffff";
const ELECTRIC = "#0066ff";
const MUTED_ON_DARK = "#a3a3a3";
const FONT_STACK =
  "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif";

const POPUP_SOURCE = path.join(sourceDir, "popup.png");

if (!existsSync(POPUP_SOURCE)) {
  console.error(
    `[build-store-assets] missing source file at ${POPUP_SOURCE}`,
  );
  console.error(
    "Save the popup screenshot to that path (PNG, any reasonable size — 380×600 or 760×1200 both work) and re-run.",
  );
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const POPUP_BUFFER = await sharp(POPUP_SOURCE).png().toBuffer();
const POPUP_META = await sharp(POPUP_BUFFER).metadata();
console.log(
  `[build-store-assets] source popup: ${POPUP_META.width}×${POPUP_META.height}`,
);

/*
 * Source captures (especially full-size DevTools screenshots in tab
 * mode) often include the entire scrollable popup body, which can run
 * 1700+ source px tall. None of the marketing canvases are that tall,
 * so we crop the popup to its "above the fold" portion and apply a
 * soft fade-to-charcoal gradient at the bottom edge — the popup then
 * blends into the canvas charcoal background and the cutoff reads as
 * "scrolls" rather than as a hard cropline.
 *
 * If the source happens to already be short enough (≤ POPUP_CROP_HEIGHT
 * source px), the crop is a no-op and the fade still applies, which
 * is harmless visually.
 */
const POPUP_CROP_HEIGHT = 1200; // source pixels; ≈ 600 device px at 2× DPR
const POPUP_FADE_HEIGHT = 80; // bottom fade band, source pixels

async function popupCroppedWithFade() {
  const cropH = Math.min(POPUP_META.height, POPUP_CROP_HEIGHT);
  const cropped = await sharp(POPUP_BUFFER)
    .extract({
      left: 0,
      top: 0,
      width: POPUP_META.width,
      height: cropH,
    })
    .png()
    .toBuffer();
  const fadeSvg = `<svg width="${POPUP_META.width}" height="${cropH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fade" x1="0" y1="${cropH - POPUP_FADE_HEIGHT}" x2="0" y2="${cropH}" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="rgba(26,26,26,0)"/>
        <stop offset="100%" stop-color="rgba(26,26,26,1)"/>
      </linearGradient>
    </defs>
    <rect x="0" y="${cropH - POPUP_FADE_HEIGHT}" width="${POPUP_META.width}" height="${POPUP_FADE_HEIGHT}" fill="url(#fade)"/>
  </svg>`;
  return sharp(cropped)
    .composite([{ input: Buffer.from(fadeSvg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

const POPUP_PRESENTABLE = await popupCroppedWithFade();
const POPUP_PRESENTABLE_META = await sharp(POPUP_PRESENTABLE).metadata();
console.log(
  `[build-store-assets] presentable popup: ${POPUP_PRESENTABLE_META.width}×${POPUP_PRESENTABLE_META.height} (cropped + faded)`,
);

// --- helpers ---------------------------------------------------------

function charcoalBgSvg(width, height) {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="glow" cx="50%" cy="35%" r="55%">
        <stop offset="0%" stop-color="rgba(0,102,255,0.22)"/>
        <stop offset="40%" stop-color="rgba(0,102,255,0.08)"/>
        <stop offset="100%" stop-color="rgba(0,102,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="${CHARCOAL}"/>
    <rect width="100%" height="100%" fill="url(#glow)"/>
  </svg>`;
}

async function backgroundBuffer(width, height) {
  return sharp(Buffer.from(charcoalBgSvg(width, height))).png().toBuffer();
}

async function logoBuffer(size, strokeColor = PAPER) {
  const svg = `<svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.5 8.2C22 6.6 19.2 5.4 16.4 5.4c-3.6 0-6.7 1.9-6.7 5 0 2.7 2.4 3.9 6.6 4.9 4.9 1.2 7.7 2.7 7.7 6.4 0 3.5-3.5 5.6-7.6 5.6-3.6 0-7-1.6-8.4-3.8" stroke="${strokeColor}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <circle cx="25" cy="7" r="2" fill="${ELECTRIC}"/>
  </svg>`;
  return sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
}

async function popupAtWidth(targetWidth) {
  return sharp(POPUP_PRESENTABLE)
    .resize({ width: targetWidth, kernel: "lanczos3" })
    .png()
    .toBuffer();
}

// --- screenshot 1: lead, popup centered with tagline ----------------

async function screenshot1() {
  const W = 1280;
  const H = 800;
  // Width 380 against the cropped 760×1200 popup gives a 380×600
  // footprint that fits below the tagline area without overflow.
  const popupTargetWidth = 380;
  const popup = await popupAtWidth(popupTargetWidth);
  const popupMeta = await sharp(popup).metadata();

  const popupLeft = Math.round((W - popupMeta.width) / 2);
  const popupTop = Math.max(195, H - popupMeta.height - 10);

  const overlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <text x="${W / 2}" y="125" font-family="${FONT_STACK}" font-size="64" font-weight="700" fill="${PAPER}" text-anchor="middle" letter-spacing="-1.5">
      Shopify font code, in your toolbar
    </text>
    <text x="${W / 2}" y="180" font-family="${FONT_STACK}" font-size="22" font-weight="400" fill="${MUTED_ON_DARK}" text-anchor="middle">
      @font-face · settings_schema.json · CSS variables. No upload.
    </text>
  </svg>`;

  const out = path.join(outDir, "screenshot-1-tagline-1280x800.png");
  await sharp(await backgroundBuffer(W, H))
    .composite([
      { input: Buffer.from(overlay), top: 0, left: 0 },
      { input: popup, top: popupTop, left: popupLeft },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`[build-store-assets] wrote ${path.basename(out)}`);
}

// --- screenshot 2: feature list left, popup right --------------------

async function screenshot2() {
  const W = 1280;
  const H = 800;
  // Width 440 against the 760×1200 cropped popup gives a 440×695
  // footprint — leaves the full canvas height for visual breathing
  // room while keeping the popup readable from a distance.
  const popupTargetWidth = 440;
  const popup = await popupAtWidth(popupTargetWidth);
  const popupMeta = await sharp(popup).metadata();

  const features = [
    "Three copy-paste code blocks",
    "WOFF2 / WOFF / TTF / OTF / EOT",
    "Live preview without uploading",
    "Survives Shopify theme updates",
  ];

  const featureRows = features
    .map((f, i) => {
      const y = 290 + i * 70;
      return `<g transform="translate(80, ${y})">
        <circle cx="16" cy="16" r="16" fill="${ELECTRIC}"/>
        <path d="M10 16L14 20L22 12" stroke="${PAPER}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <text x="50" y="24" font-family="${FONT_STACK}" font-size="22" font-weight="500" fill="${PAPER}">${f}</text>
      </g>`;
    })
    .join("\n");

  const overlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <text x="80" y="160" font-family="${FONT_STACK}" font-size="56" font-weight="700" fill="${PAPER}" letter-spacing="-1.5">
      Built for Shopify Dawn
    </text>
    <text x="80" y="210" font-family="${FONT_STACK}" font-size="24" font-weight="400" fill="${MUTED_ON_DARK}">
      and every other free OS 2.0 theme
    </text>
    ${featureRows}
  </svg>`;

  const popupLeft = W - popupMeta.width - 80;
  const popupTop = Math.round((H - popupMeta.height) / 2);

  const out = path.join(outDir, "screenshot-2-features-1280x800.png");
  await sharp(await backgroundBuffer(W, H))
    .composite([
      { input: Buffer.from(overlay), top: 0, left: 0 },
      { input: popup, top: popupTop, left: popupLeft },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`[build-store-assets] wrote ${path.basename(out)}`);
}

// --- promo tile small 440×280 ----------------------------------------

async function promoTileSmall() {
  const W = 440;
  const H = 280;
  const logoSize = 32;
  const logo = await logoBuffer(logoSize);

  const overlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <text x="76" y="58" font-family="${FONT_STACK}" font-size="30" font-weight="700" fill="${PAPER}" letter-spacing="-1">Shopifont</text>
    <text x="32" y="158" font-family="${FONT_STACK}" font-size="22" font-weight="600" fill="${PAPER}">Custom fonts for</text>
    <text x="32" y="186" font-family="${FONT_STACK}" font-size="22" font-weight="600" fill="${ELECTRIC}">Shopify Dawn</text>
    <text x="32" y="232" font-family="${FONT_STACK}" font-size="13" fill="${MUTED_ON_DARK}">@font-face · settings_schema.json · CSS vars.</text>
    <text x="32" y="252" font-family="${FONT_STACK}" font-size="13" fill="${MUTED_ON_DARK}">Free. No signup. No upload.</text>
  </svg>`;

  const out = path.join(outDir, "promo-tile-small-440x280.png");
  await sharp(await backgroundBuffer(W, H))
    .composite([
      { input: logo, top: 36, left: 32 },
      { input: Buffer.from(overlay), top: 0, left: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`[build-store-assets] wrote ${path.basename(out)}`);
}

// --- promo tile marquee 1400×560 ------------------------------------

async function marqueeTile() {
  const W = 1400;
  const H = 560;
  const logoSize = 64;
  // Width 340 against the cropped 760×1200 popup gives 340×537 —
  // fits the 560 tile height with margin on both sides.
  const popupTargetWidth = 340;

  const logo = await logoBuffer(logoSize);
  const popup = await popupAtWidth(popupTargetWidth);
  const popupMeta = await sharp(popup).metadata();

  const popupLeft = W - popupMeta.width - 100;
  const popupTop = Math.round((H - popupMeta.height) / 2);

  const overlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <text x="180" y="135" font-family="${FONT_STACK}" font-size="60" font-weight="700" fill="${PAPER}" letter-spacing="-1.5">Shopifont</text>
    <text x="80" y="270" font-family="${FONT_STACK}" font-size="48" font-weight="700" fill="${PAPER}" letter-spacing="-1.5">
      Shopify font code,
    </text>
    <text x="80" y="328" font-family="${FONT_STACK}" font-size="48" font-weight="700" fill="${ELECTRIC}" letter-spacing="-1.5">
      in your toolbar.
    </text>
    <text x="80" y="400" font-family="${FONT_STACK}" font-size="22" fill="${MUTED_ON_DARK}">
      @font-face · settings_schema.json · CSS variables.
    </text>
    <text x="80" y="432" font-family="${FONT_STACK}" font-size="22" fill="${MUTED_ON_DARK}">
      Free. No upload. Works with every free Shopify theme.
    </text>
  </svg>`;

  const out = path.join(outDir, "promo-tile-marquee-1400x560.png");
  await sharp(await backgroundBuffer(W, H))
    .composite([
      { input: logo, top: 80, left: 80 },
      { input: Buffer.from(overlay), top: 0, left: 0 },
      { input: popup, top: popupTop, left: popupLeft },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`[build-store-assets] wrote ${path.basename(out)}`);
}

// --- run all ----------------------------------------------------------

await screenshot1();
await screenshot2();
await promoTileSmall();
await marqueeTile();

console.log(
  `\n[build-store-assets] all four assets written to ${path.relative(root, outDir)}/`,
);
