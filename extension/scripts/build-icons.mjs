/**
 * Generate the four PNG icon sizes Chrome MV3 expects (16/32/48/128)
 * from a single SVG source. Run before `vite build` so the output
 * directory has icons ready to be copied into dist/.
 *
 * Source: extension/public/icons/source.svg — a brand-colored Shopifont
 * mark that reads correctly even at 16 px. Sized 128×128 in design
 * space; sharp's `resize` handles the downsamples.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "public", "icons", "source.svg");
const outDir = path.join(root, "public", "icons");

const SIZES = [16, 32, 48, 128];

async function main() {
  const svg = await readFile(sourcePath);
  await mkdir(outDir, { recursive: true });
  for (const size of SIZES) {
    const target = path.join(outDir, `icon-${size}.png`);
    const buffer = await sharp(svg, { density: 384 })
      .resize(size, size, { fit: "contain" })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(target, buffer);
    console.log(`[build-icons] ${target}`);
  }
}

main().catch((err) => {
  console.error("[build-icons] failed:", err);
  process.exit(1);
});
