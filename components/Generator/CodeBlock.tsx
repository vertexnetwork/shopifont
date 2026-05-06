"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { Highlight, themes as prismThemes, type PrismTheme } from "prism-react-renderer";

export type CopyVariant = "primary" | "secondary" | "done";

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
  /**
   * Visual weight of the Copy CTA. Sequenced by the parent so only the
   * step the user should do next reads as primary; previously-copied
   * blocks fade to `done`. Avoids three identical-priority CTAs.
   */
  variant?: CopyVariant;
  /** Notify the parent so it can advance sequencing. */
  onCopySuccess?: () => void;
  /**
   * Disambiguates DOM ids when the same CodeBlock is rendered in
   * both the mobile tabpanel and the desktop 3-col grid. Lighthouse
   * a11y flagged duplicate `code-font-face-css` ids when both trees
   * mount simultaneously.
   */
  idPrefix?: string;
};

/**
 * Charcoal-on-paper Prism theme. Token colors are intentionally
 * neutral + warm so the only true brand-blue on screen is the Copy
 * CTA — keeps the call-to-action visually distinct from the code it
 * sits on top of.
 */
const CHARCOAL_THEME: PrismTheme = {
  ...prismThemes.vsLight,
  plain: {
    backgroundColor: "#1a1a1a",
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

export function CodeBlock({
  step,
  title,
  description,
  code,
  language,
  copyLabel = "Copy",
  warning,
  variant = "primary",
  onCopySuccess,
  idPrefix,
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
      onCopySuccess?.();
    } catch {
      setCopied(false);
      setAnnounce("Could not copy. Select the code and copy manually.");
    }
  };

  const blocked = Boolean(warning);
  const canCopy = !blocked && deferredCode.trim().length > 0;
  const sectionId = `code-${idPrefix ? `${idPrefix}-` : ""}${slugForId(title)}`;

  return (
    <section
      aria-labelledby={sectionId}
      className="flex flex-col rounded-lg border border-charcoal-line/60 bg-paper overflow-hidden shadow-card"
      style={{ minHeight: "var(--code-card-min-h)" }}
    >
      <header className="flex items-start gap-3 p-4 sm:p-5 border-b border-charcoal-line/40">
        {step ? (
          <span
            aria-hidden
            className={
              "shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full font-mono text-xs font-semibold " +
              (variant === "done"
                ? "bg-paper-dim text-muted border border-charcoal-line/40"
                : "bg-electric text-paper badge-glow")
            }
          >
            {variant === "done" ? "✓" : step}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 id={sectionId} className="text-base font-semibold tracking-tight">
            {step ? <span className="sr-only">Step {step}: </span> : null}
            {title}
          </h3>
          {/*
           * Reserve 3 lines worth of description height so all three
           * code blocks share equal-height headers in the desktop
           * 3-col grid. Without this the @font-face description (the
           * longest) pushes its code body down ~20px below the others.
           */}
          <p className="mt-1 text-xs text-muted line-clamp-3 min-h-[3rem]">
            {description}
          </p>
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
         * Desktop: top-anchored sticky Copy. Visible immediately and
         * stays in view as the user scrolls long blocks.
         */}
        <div className="hidden lg:flex sticky top-2 z-10 justify-end px-2 pointer-events-none">
          <CopyButton
            blocked={blocked}
            canCopy={canCopy}
            copied={copied}
            copyLabel={copyLabel}
            onCopy={onCopy}
            variant={variant}
            warning={warning}
          />
        </div>

        <div className="lg:-mt-[var(--spacing-touch)] lg:pt-[var(--spacing-touch)]">
          {!deferredCode.trim() ? (
            <p className="p-4 text-xs text-paper-dim/60 font-mono">
              {warning ?? "Enter a font name to generate this block."}
            </p>
          ) : (
            <Highlight code={deferredCode} language={language} theme={CHARCOAL_THEME}>
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

        {/*
         * Mobile: bottom-anchored sticky Copy. Sits in the natural
         * thumb arc on a one-handed phone hold. Renders only at <lg
         * because on desktop the top-anchored version is reachable.
         */}
        <div className="lg:hidden sticky bottom-2 z-10 flex justify-end px-2 pointer-events-none">
          <CopyButton
            blocked={blocked}
            canCopy={canCopy}
            copied={copied}
            copyLabel={copyLabel}
            onCopy={onCopy}
            variant={variant}
            warning={warning}
          />
        </div>
      </div>

      <span aria-live="polite" className="sr-only">
        {announce}
      </span>
    </section>
  );
}

function CopyButton({
  blocked,
  canCopy,
  copied,
  copyLabel,
  onCopy,
  variant,
  warning,
}: {
  blocked: boolean;
  canCopy: boolean;
  copied: boolean;
  copyLabel: string;
  onCopy: () => void;
  variant: CopyVariant;
  warning?: string | null;
}) {
  const stylesByVariant: Record<CopyVariant, string> = {
    primary:
      "bg-electric text-paper border border-electric hover:bg-electric-hover hover:border-electric-hover",
    secondary:
      "bg-paper text-charcoal border border-charcoal-line/50 hover:border-electric hover:text-electric",
    done: "bg-paper-dim text-muted border border-charcoal-line/40 hover:bg-paper hover:text-charcoal",
  };
  const baseLabel = variant === "done" && !copied ? "Copy again" : copyLabel;
  return (
    <button
      type="button"
      onClick={onCopy}
      disabled={!canCopy}
      aria-label={
        blocked
          ? `Copy disabled: ${warning ?? ""}`
          : copied
            ? "Copied"
            : baseLabel
      }
      title={blocked ? warning ?? undefined : undefined}
      className={
        "pointer-events-auto min-h-[var(--spacing-touch)] px-3 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm " +
        (copied
          ? "bg-electric text-paper border border-electric shopifont-pulse"
          : stylesByVariant[variant])
      }
    >
      {copied ? "Copied ✓" : baseLabel}
    </button>
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
