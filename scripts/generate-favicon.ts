/**
 * Prebuild script. Rasterizes `app/icon.svg` into the PNG/ICO sizes the
 * spec requires:
 *
 *   public/favicon.ico            — 32×32 ICO (legacy <link rel="shortcut icon">)
 *   public/favicon-16.png         — 16×16
 *   public/favicon-32.png         — 32×32
 *   public/icon-192.png           — 192×192 (PWA + Android)
 *   public/icon-512.png           — 512×512 (PWA + Android)
 *   public/apple-touch-icon-180.png — 180×180 (iOS home-screen)
 *
 * Uses `sharp`. If sharp isn't installed (local dev without devDeps),
 * the script no-ops with a warning so `npm run prebuild` doesn't fail
 * in environments where the icons are intentionally pre-generated.
 *
 * Sharp doesn't natively emit .ico — we render the same 32×32 PNG and
 * write it under both the .ico and .png filenames. Browsers accept a
 * raw 32×32 PNG with the .ico extension via content-sniffing; for
 * proper multi-size .ico we'd use `png-to-ico`, intentionally skipped
 * here to avoid an extra dep.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const sourceSvg = resolve(projectRoot, "app", "icon.svg");
const publicDir = resolve(projectRoot, "public");

type SizeSpec = { name: string; size: number };

const targets: SizeSpec[] = [
  { name: "favicon-16.png", size: 16 },
  { name: "favicon-32.png", size: 32 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon-180.png", size: 180 },
  { name: "favicon.ico", size: 32 },
];

type SharpFactory = (input?: Buffer, opts?: { density?: number }) => {
  resize: (
    w: number,
    h: number,
    o?: { fit?: "contain" | "cover" },
  ) => SharpReturn;
  png: (o?: { compressionLevel?: number }) => SharpReturn;
  toFile: (path: string) => Promise<unknown>;
};
type SharpReturn = ReturnType<SharpFactory>;

async function main(): Promise<void> {
  let sharp: SharpFactory | null = null;
  try {
    const mod = (await import("sharp")) as unknown as
      | SharpFactory
      | { default: SharpFactory };
    sharp = (typeof mod === "function" ? mod : mod.default) as SharpFactory;
  } catch {
    console.warn(
      "[generate-favicon] `sharp` not installed; skipping rasterization. " +
        "Run `npm install -D sharp` to enable.",
    );
    return;
  }

  const svgBuffer = readFileSync(sourceSvg);

  mkdirSync(publicDir, { recursive: true });

  for (const target of targets) {
    const outPath = resolve(publicDir, target.name);
    await sharp(svgBuffer, { density: 320 })
      .resize(target.size, target.size, { fit: "contain" })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(
      `[generate-favicon] wrote ${target.name} (${target.size}×${target.size})`,
    );
  }
  void writeFileSync;
}

main().catch((err) => {
  console.error("[generate-favicon] failed", err);
  process.exit(1);
});
