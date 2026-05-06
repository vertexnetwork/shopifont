"use client";

import { useEffect, useState } from "react";
import { Highlight, themes as prismThemes, type PrismTheme } from "prism-react-renderer";

/**
 * Copy-able iframe snippet shown on /embed-this. Mirrors the look of
 * the generator's CodeBlock (charcoal background, brand-blue Copy
 * button) so the marketing page reads as part of the same product.
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
    {
      types: ["keyword", "selector", "atrule", "rule"],
      style: { color: "#7fb1ff" },
    },
    {
      types: ["property", "tag", "attr-name"],
      style: { color: "#bce0ff" },
    },
    { types: ["number", "boolean"], style: { color: "#ffd58a" } },
    { types: ["punctuation", "operator"], style: { color: "#cfcfcf" } },
    { types: ["function"], style: { color: "#f4a99a" } },
  ],
};

export function EmbedSnippet({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const onCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(snippet);
      } else {
        legacyCopy(snippet);
      }
      setCopied(true);
      setAnnounce("Snippet copied to clipboard");
    } catch {
      legacyCopy(snippet);
      setCopied(true);
      setAnnounce("Snippet copied");
    }
  };

  return (
    <div className="rounded-lg border border-charcoal-line/60 bg-paper overflow-hidden shadow-card">
      <header className="flex items-center justify-between gap-3 p-3 border-b border-charcoal-line/40">
        <p className="text-xs uppercase tracking-wide text-muted font-medium">
          iframe snippet
        </p>
        <button
          type="button"
          onClick={onCopy}
          className={
            "min-h-[var(--spacing-touch)] px-3 rounded-md text-sm font-medium transition-colors " +
            (copied
              ? "bg-electric text-paper shopifont-pulse"
              : "bg-charcoal text-paper hover:bg-electric")
          }
        >
          {copied ? "Copied ✓" : "Copy snippet"}
        </button>
      </header>
      <div className="code-scroll overflow-auto bg-charcoal text-paper-dim">
        <Highlight code={snippet} language="markup" theme={CHARCOAL_THEME}>
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
      </div>
      <span aria-live="polite" className="sr-only">
        {announce}
      </span>
    </div>
  );
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
