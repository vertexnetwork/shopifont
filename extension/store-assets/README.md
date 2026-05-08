# Web Store assets

Asset compositions for the Chrome Web Store listing — built from a single popup screenshot via `sharp`.

## Workflow

1. **Capture a clean popup screenshot** (any reasonable resolution; 760×1200 from Chrome DevTools' "Capture full size screenshot" with 2× device pixel ratio looks sharpest, but a 380×600 native capture works too).
2. **Save it as PNG to** `store-assets/source/popup.png`.
3. **Run the build:**
   ```bash
   cd extension
   npm run assets:store
   ```
4. Output lands in `store-assets/dist/`:

   | File | Dimensions | Where it goes in the Web Store dashboard |
   |---|---|---|
   | `screenshot-1-tagline-1280x800.png` | 1280×800 | Lead screenshot |
   | `screenshot-2-features-1280x800.png` | 1280×800 | Second screenshot |
   | `promo-tile-small-440x280.png` | 440×280 | Small promo tile (browse views) |
   | `promo-tile-marquee-1400x560.png` | 1400×560 | Marquee tile (only used if Google features the listing) |

## Recapturing the popup

To capture cleanly:
1. `chrome://extensions` → Developer mode on → reload the unpacked extension if needed
2. Click the toolbar icon to open the popup
3. Right-click inside the popup → **Inspect** (a DevTools window opens attached to the popup)
4. In DevTools press `Ctrl+Shift+P` → type **"Capture full size screenshot"** → Enter
5. The PNG saves to your default Downloads folder. Move it to `extension/store-assets/source/popup.png`.

For a 2× capture (sharper text on the marketing tiles), open the **Device Toolbar** in DevTools (`Ctrl+Shift+M`), set DPR to 2, *then* run the capture command. The output will be 760×1200 instead of 380×600 and the script's downscale will produce visibly crisper assets.

## What's NOT in source control

`store-assets/source/` and `store-assets/dist/` are both gitignored — the source PNG is local-only (different team members may capture different states), and the outputs are derived. The script + this README live in git so anyone with the repo can regenerate.

## When you change the popup UI

Re-capture, drop into `source/`, re-run `npm run assets:store`. Two minutes total.

## Listing copy (current — keep PNGs in sync)

Source of truth for the Web Store dashboard text. Changes here mean the next screenshot capture must re-render any popup text that overlaps.

- **Name:** `Shopifont — Shopify Custom Font Code Generator`
- **Short description (manifest):** `Generate @font-face, settings_schema.json, and CSS variable code for all 13 free Shopify OS 2.0 themes — without leaving your tab.`
- **Detailed description (Web Store dashboard):** lead with "all 13 free Shopify OS 2.0 themes" framing — Dawn, Sense, Refresh, Crave, Origin, Studio, Taste, Spotlight, Colorblock, Craft, Ride, Publisher, Trade. Do NOT position the extension as Dawn-first.

If any current screenshot in `dist/` shows "Dawn"-specific text in the popup body (e.g., the CSS variables block description previously read "Retargets Dawn's typography roots"), recapture before the next Web Store submission. The popup copy now reads "Retargets the theme's --font-heading-family / --font-body-family."
