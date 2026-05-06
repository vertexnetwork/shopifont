import { ShopifontGenerator } from "@/components/Generator";
import { Logo } from "@/components/Brand/Logo";
import { SITE_NAME } from "@/lib/site";

const FULL_VERSION_URL =
  "https://shopifont.app/?utm_source=extension&utm_medium=popup";

/**
 * Chrome extension popup. Reuses the same React Generator that ships
 * on the website (`ShopifontGenerator mode="embed"`) — same code,
 * same brand, same tests. The popup is sized 380×600 to fit Chrome's
 * popup constraints without internal scrolling on most font configs.
 *
 * The Generator's `mode="embed"` prop disables URL hydration and
 * hides the Share-this-config button. Both behaviors only make sense
 * on a real page; the popup URL is `chrome-extension://<id>/popup.html`
 * which has no meaning to share.
 */
export function App() {
  return (
    <div className="min-h-[600px] w-[380px] flex flex-col bg-paper">
      <header className="border-b border-charcoal-line/30 bg-paper px-3 py-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-charcoal font-semibold tracking-tight">
          <Logo className="w-4 h-4 text-charcoal" />
          <span className="text-sm">{SITE_NAME}</span>
        </span>
        <a
          href={FULL_VERSION_URL}
          target="_blank"
          rel="noopener"
          className="text-[11px] text-muted hover:text-electric inline-flex items-center gap-1"
        >
          Open full site
          <ArrowOut />
        </a>
      </header>

      <div className="flex-1 px-2 py-3">
        <ShopifontGenerator mode="embed" />
      </div>

      <footer className="border-t border-charcoal-line/20 bg-paper-dim px-3 py-1.5 text-[10px] text-muted text-center">
        Free · No upload · No signup
      </footer>
    </div>
  );
}

function ArrowOut() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      width="9"
      height="9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 2H2v8h8V7M7 2h3v3M5 7l5-5" />
    </svg>
  );
}
