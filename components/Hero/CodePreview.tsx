"use client";

import { useEffect, useState } from "react";
import { Highlight, themes as prismThemes, type PrismTheme } from "prism-react-renderer";

const SAMPLE_NAME = "Söhne";
const FULL_CODE = `@font-face {
  font-family: "${SAMPLE_NAME}";
  src: url({{ 'söhne.woff2' | asset_url }}) format('woff2');
  font-weight: 400;
  font-display: swap;
}`;

const TYPE_INTERVAL_MS = 22;

const CHARCOAL_THEME: PrismTheme = {
  ...prismThemes.vsLight,
  plain: {
    backgroundColor: "transparent",
    color: "#ededed",
  },
  styles: [
    { types: ["comment"], style: { color: "#8a8a8a", fontStyle: "italic" } },
    { types: ["string", "url"], style: { color: "#e6c97a" } },
    { types: ["keyword", "selector", "atrule", "rule"], style: { color: "#ffffff", fontWeight: "600" } },
    { types: ["property", "tag", "attr-name"], style: { color: "#cfcfcf" } },
    { types: ["number", "boolean"], style: { color: "#d8b386" } },
    { types: ["punctuation", "operator"], style: { color: "#9a9a9a" } },
    { types: ["function"], style: { color: "#c8a3ff" } },
  ],
};

/**
 * Hero-level micro-demo. Types out the @font-face block once on mount
 * so non-developer merchants see what they'll be copying before they
 * decide to scroll. Static after first paint — no looping cycle —
 * because a perpetually-changing block competes with the H1 for
 * attention. Reduced-motion users see the full block immediately.
 */
export function HeroCodePreview() {
  const [shown, setShown] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReduced(true);
      setShown(FULL_CODE.length);
    }
  }, []);

  useEffect(() => {
    if (reduced || shown >= FULL_CODE.length) return;
    const t = setTimeout(() => setShown((c) => c + 1), TYPE_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [shown, reduced]);

  const visibleCode = FULL_CODE.slice(0, shown);
  const isTyping = !reduced && shown < FULL_CODE.length;

  return (
    <figure
      aria-label="Generated @font-face block preview"
      className="relative rounded-lg bg-charcoal text-paper-dim overflow-hidden border border-charcoal-line shadow-card"
    >
      <header className="flex items-center gap-2 px-3 py-2 border-b border-charcoal-line/60 bg-charcoal/80">
        <span aria-hidden className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-paper-dim/30" />
          <span className="w-2 h-2 rounded-full bg-paper-dim/30" />
          <span className="w-2 h-2 rounded-full bg-paper-dim/30" />
        </span>
        <span className="text-[10px] font-mono text-paper-dim/60 uppercase tracking-wide">
          assets/base.css
        </span>
      </header>
      <div className="p-4 min-h-[10.5rem]">
        <Highlight code={visibleCode} language="css" theme={CHARCOAL_THEME}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} font-mono text-[12px] leading-relaxed m-0`}
              style={style}
            >
              {tokens.map((line, i) => {
                const lineProps = getLineProps({ line });
                const isLast = i === tokens.length - 1;
                return (
                  <div key={i} {...lineProps}>
                    {line.map((token, k) => {
                      const tokenProps = getTokenProps({ token });
                      return <span key={k} {...tokenProps} />;
                    })}
                    {isLast && isTyping ? (
                      <span aria-hidden className="animate-blink text-electric">
                        |
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      </div>
    </figure>
  );
}
