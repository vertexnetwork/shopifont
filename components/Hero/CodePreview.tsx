"use client";

import { Highlight, themes as prismThemes, type PrismTheme } from "prism-react-renderer";

const FULL_CODE = `@font-face {
  font-family: "Söhne";
  src: url({{ 'söhne.woff2' | asset_url }}) format('woff2');
  font-weight: 400;
  font-display: swap;
}`;

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
 * Hero-level micro-demo of the @font-face output. The content is
 * tokenized exactly once; per-line "fade-up" appearance is driven by a
 * CSS keyframe with a staggered animation-delay so we get the live
 * feel without re-tokenizing on every animation tick (the previous
 * char-by-char typewriter ran the highlighter ~80 times per render and
 * was a measurable contributor to LCP element render delay).
 *
 * Reduced-motion users see the full block with no stagger via the
 * global prefers-reduced-motion override in globals.css.
 */
export function HeroCodePreview() {
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
        <Highlight code={FULL_CODE} language="css" theme={CHARCOAL_THEME}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} font-mono text-[12px] leading-relaxed m-0`}
              style={style}
            >
              {tokens.map((line, i) => {
                const lineProps = getLineProps({ line });
                return (
                  <div
                    key={i}
                    {...lineProps}
                    className={`${lineProps.className ?? ""} shopifont-line`}
                    style={{
                      ...lineProps.style,
                      animationDelay: `${i * 80}ms`,
                    }}
                  >
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
    </figure>
  );
}
