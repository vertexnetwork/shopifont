import { Logo } from "@/components/Brand/Logo";
import { SITE_NAME } from "@/lib/site";
import { CompactGenerator } from "./CompactGenerator";

const FULL_VERSION_URL =
  "https://shopifont.app/?utm_source=extension&utm_medium=popup";

/**
 * Chrome extension popup. Renders a popup-native CompactGenerator
 * that shares the same `useGenerator` hook + `<CodeBlock>` component
 * the website uses, but owns its own layout — the website's full
 * <ShopifontGenerator> was designed for a 1024px+ canvas and didn't
 * fit the 380×600 popup constraint without forcing.
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

      <div className="flex-1 px-3 py-3">
        <CompactGenerator />
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
