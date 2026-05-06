# Shopifont — Chrome Extension

A Manifest V3 popup extension that ships the same React Generator the website uses. Reuses `lib/generators/*`, `components/Generator/*`, `components/Brand/Logo`, and the brand tokens directly from the parent project — single source of truth, no fork.

## Build

```bash
cd extension
npm install
npm run build
```

Outputs `extension/dist/`. Generated icons land in `extension/public/icons/icon-{16,32,48,128}.png` from `public/icons/source.svg`.

## Load unpacked into Chrome

1. Open `chrome://extensions`
2. Toggle **Developer mode** on (top right)
3. Click **Load unpacked** and select `extension/dist/`
4. Pin the toolbar icon for quick access

## Develop

```bash
npm run dev
```

`@crxjs/vite-plugin` watches the source tree and reloads the popup automatically. The extension auto-installs on any Chrome instance launched from the dev server.

## Architecture

The popup is a thin shell around `<ShopifontGenerator mode="embed">`. Setting `mode="embed"` does two things the popup needs:

- **Disables URL hydration / sync** — the popup URL is `chrome-extension://<id>/popup.html`, transient and meaningless to share. Without the opt-out the hook would clobber the popup's URL on every keystroke.
- **Hides the Share-this-config button** — the URL it would copy isn't shareable from the popup's perspective.

`extension/src/popup/styles.css` is a self-contained Tailwind v4 entry that re-declares the brand `@theme` tokens. We don't import the parent project's `app/globals.css` directly because that file contains hero-specific animations and ad-slot CLS reservations that don't belong in a 380×600 popup.

## Manifest highlights

- **No permissions, no host_permissions** — the generator is pure client-side string interpolation; there is nothing to ask for.
- **No content scripts** — the popup never runs on a host page.
- **No remote code** — every script the popup loads is bundled by Vite. Mediavine, Plausible, and Clarity are stripped because they only live in the parent project's `(site)/` layout, never in the Generator components themselves.

## Submission checklist (Chrome Web Store)

- [ ] `npm run build` produces a clean `dist/`
- [ ] Manifest version bumped if anything user-facing changed
- [ ] Screenshots: 1280×800 hero, 440×280 promo tile, 3+ in-context shots
- [ ] Single-purpose justification ("generates Shopify custom font code")
- [ ] Privacy policy URL: `https://shopifont.app/about` (or a dedicated `/privacy` if added later)
- [ ] Pay the one-time $5 developer fee
- [ ] Zip `dist/` and upload via the [Chrome Web Store dashboard](https://chrome.google.com/webstore/devconsole)
