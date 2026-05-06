"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { Highlight, themes as prismThemes, type PrismTheme } from "prism-react-renderer";

type Props = {
  step?: number;
  title: string;
  description: string;
  code: string;
  language: "css" | "json";
  copyLabel?: string;
  /**
   * Surfaced as an actionable warning above the code body and used to
   * gate the Copy button — prevents users pasting a degenerate snippet.
   */
  warning?: string | null;
};

/**
 * Charcoal-on-paper Prism theme. Built inline so it stays consistent
 * with the brand palette and we don't pay for a runtime fetch of an
 * external theme stylesheet.
 */
const CHARCOAL_THEME: PrismTheme = {
  ...prismThemes.vsLight,
  plain: {
    backgroundColor: "#1a1a1a",
    color: "#f5f5f5",
  },
  styles: [
    { types: ["comment"], style: { color: "#7a7a7a", fontStyle: "italic" } },
    { types: ["string", "url"], style: { color: "#9ad7ff" } },
    { types: ["keyword", "selector", "atrule", "rule"], style: { color: "#7fb1ff" } },
    { types: ["property", "tag", "attr-name"], style: { color: "#bce0ff" } },
    { types: ["number", "boolean"], style: { color: "#ffd58a" } },
    { types: ["punctuation", "operator"], style: { color: "#cfcfcf" } },
    { types: ["function"], style: { color: "#f4a99a" } },
  ],
};

export function CodeBlock({
  step,
  title,
  description,
  code,
  language,
  copyLabel = "Copy",
  warning,
}: Props) {
  const deferredCode = useDeferredValue(code);
  const [copied, setCopied] = useState(false);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const onCopy = async () => {
    try {
      // Modern path. iOS Safari supports this from 13.1+; older Safari
      // and some embedded webviews fall back to the textarea selection
      // path below.
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        legacyCopy(code);
      }
      setCopied(true);
      setAnnounce("Copied to clipboard");
    } catch {
      setCopied(false);
      setAnnounce("Could not copy. Select the code and copy manually.");
    }
  };

  const blocked = Boolean(warning);
  const canCopy = !blocked && deferredCode.trim().length > 0;

  return (
    <section
      aria-labelledby={`code-${slugForId(title)}`}
      className="flex flex-col rounded-lg border border-charcoal-line/60 bg-paper overflow-hidden"
      style={{ minHeight: "var(--code-card-min-h)" }}
    >
      <header className="flex items-start gap-3 p-4 sm:p-5 border-b border-charcoal-line/40">
        {step ? (
          <span
            aria-hidden
            className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-electric text-paper font-mono text-xs font-semibold"
          >
            {step}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3
            id={`code-${slugForId(title)}`}
            className="text-base font-semibold tracking-tight"
          >
            {step ? <span className="sr-only">Step {step}: </span> : null}
            {title}
          </h3>
          <p className="mt-1 text-xs text-muted">{description}</p>
        </div>
      </header>

      {warning ? (
        <p
          role="status"
          className="px-4 sm:px-5 py-2 text-xs border-b border-charcoal-line/40 bg-paper-dim"
          style={{ color: "var(--color-warn)" }}
        >
          {warning}
        </p>
      ) : null}

      <div
        className="code-scroll relative overflow-auto bg-charcoal text-paper-dim"
        style={{ maxHeight: "60vh" }}
      >
        {/*
         * Sticky copy button lives INSIDE the scrolling container so the
         * `position: sticky` actually anchors as the user scrolls long
         * blocks (PLAN.md §5 — sticky copy reachable while scrolling).
         */}
        <div className="sticky top-2 z-10 flex justify-end px-2 pointer-events-none">
          <button
            type="button"
            onClick={onCopy}
            disabled={!canCopy}
            aria-label={
              blocked
                ? `Copy disabled: ${warning ?? ""}`
                : copied
                  ? "Copied"
                  : copyLabel
            }
            title={blocked ? warning ?? undefined : undefined}
            className={
              "pointer-events-auto min-h-[var(--spacing-touch)] px-3 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm " +
              (copied
                ? "bg-electric text-paper"
                : "bg-paper text-charcoal hover:bg-electric hover:text-paper border border-charcoal-line/40")
            }
          >
            {copied ? "Copied ✓" : copyLabel}
          </button>
        </div>

        <div className="-mt-[var(--spacing-touch)] pt-[var(--spacing-touch)]">
          {!deferredCode.trim() ? (
            <p className="p-4 text-xs text-paper-dim/60 font-mono">
              {warning ?? "Enter a font name to generate this block."}
            </p>
          ) : (
            <Highlight
              code={deferredCode}
              language={language}
              theme={CHARCOAL_THEME}
            >
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre
                  className={`${className} font-mono text-[13px] leading-relaxed p-4 m-0`}
                  style={style}
                >
                  {tokens.map((line, i) => {
                    const lineProps = getLineProps({ line });
                    return (
                      <div key={i} {...lineProps}>
                        {line.map((token, k) => {
                          const tokenProps = getTokenProps({ token });
                          return <span key={k} {...tokenProps} />;
                        })}
                      </div>
                    );
                  })}
                </pre>
              )}
            </Highlight>
          )}
        </div>
      </div>

      <span aria-live="polite" className="sr-only">
        {announce}
      </span>
    </section>
  );
}

function slugForId(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function legacyCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}
