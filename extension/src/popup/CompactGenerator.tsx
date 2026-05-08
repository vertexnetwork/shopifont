import { useState } from "react";
import { CodeBlock } from "@/components/Generator/CodeBlock";
import {
  useGenerator,
  variantFor,
  type CopyTarget,
} from "@/components/Generator/state";
import { CREATIVE_FABRICA_REF } from "@/lib/site";
import { CompactInputs } from "./CompactInputs";
import { CompactPreview } from "./CompactPreview";

const BLOCKS: ReadonlyArray<{
  id: CopyTarget;
  step: number;
  title: string;
  description: string;
  language: "css" | "json";
}> = [
  {
    id: "fontFace",
    step: 1,
    title: "@font-face CSS",
    description: "Paste at the bottom of assets/base.css.",
    language: "css",
  },
  {
    id: "settings",
    step: 2,
    title: "settings_schema.json",
    description: "Adds a Theme Editor toggle.",
    language: "json",
  },
  {
    id: "cssVars",
    step: 3,
    title: "CSS variables",
    description:
      "Retargets the theme's --font-heading-family / --font-body-family.",
    language: "css",
  },
];

/**
 * Popup-native generator. Owns layout for the 380×600 surface; reuses
 * the website's `useGenerator` hook and `<CodeBlock>` component for
 * everything below the layout layer (validation, output, copy
 * tracking, syntax highlighting). Single source of truth for logic;
 * separation of concerns for layout.
 *
 * What's stripped vs. the website's <ShopifontGenerator>:
 *
 *  - No live preview pane (saves ~220 vertical px)
 *  - No 3-column desktop grid for output blocks (always tabbed)
 *  - No Share-this-config button (the popup URL is unshareable)
 *  - No "Paste these three blocks in order…" helper paragraph
 *
 * The Download-all-3 action is kept because it's the only way out of
 * the popup with the generated files in hand.
 */
export function CompactGenerator() {
  const state = useGenerator({ syncToUrl: false });
  const [active, setActive] = useState<CopyTarget>("fontFace");

  const codeFor = (id: CopyTarget): string => {
    if (id === "fontFace") return state.fontFaceCss;
    if (id === "settings") return state.settingsSchemaJson;
    return state.cssVariableOverrides;
  };
  const warnFor = (id: CopyTarget): string | null => {
    if (id === "fontFace") return state.warnings.fontFace;
    if (id === "settings") return state.warnings.settings;
    return state.warnings.cssVars;
  };

  const blocked =
    Boolean(state.warnings.fontFace) ||
    Boolean(state.warnings.settings) ||
    Boolean(state.warnings.cssVars);

  const onDownloadAll = () => {
    if (blocked) return;
    downloadFile("font-face.css", state.fontFaceCss, "text/css");
    downloadFile(
      "settings_schema.json",
      state.settingsSchemaJson,
      "application/json",
    );
    downloadFile("css-variables.css", state.cssVariableOverrides, "text/css");
  };

  return (
    <div className="flex flex-col gap-3">
      <CompactInputs state={state} />

      <CompactPreview state={state} />

      <div
        role="tablist"
        aria-label="Generated code blocks"
        className="flex gap-1.5"
      >
        {BLOCKS.map((b) => {
          const isActive = active === b.id;
          const isDone = state.copiedSteps.has(b.id);
          const w = warnFor(b.id);
          return (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`popup-panel-${b.id}`}
              id={`popup-tab-${b.id}`}
              onClick={() => setActive(b.id)}
              className={
                "flex-1 min-h-8 px-2 rounded-md border text-xs font-medium transition-colors flex items-center justify-center gap-1.5 " +
                (isActive
                  ? "bg-electric text-paper border-electric"
                  : "bg-paper text-charcoal border-charcoal-line/60 hover:border-electric")
              }
            >
              <span
                aria-hidden
                className={
                  "inline-flex items-center justify-center w-4 h-4 rounded-full font-mono text-[10px] " +
                  (isActive
                    ? "bg-paper text-electric"
                    : isDone
                      ? "bg-paper-dim text-muted border border-charcoal-line/40"
                      : "bg-charcoal text-paper")
                }
              >
                {isDone ? "✓" : b.step}
              </span>
              <span>Step {b.step}</span>
              {w && !isActive ? (
                <span
                  aria-label="needs attention"
                  title={w}
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "var(--color-warn)" }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {BLOCKS.map((b) =>
        active === b.id ? (
          <div
            key={b.id}
            id={`popup-panel-${b.id}`}
            role="tabpanel"
            aria-labelledby={`popup-tab-${b.id}`}
          >
            <CodeBlock
              idPrefix="popup"
              step={b.step}
              title={b.title}
              description={b.description}
              code={codeFor(b.id)}
              language={b.language}
              warning={warnFor(b.id)}
              variant={variantFor(b.id, state.copiedSteps)}
              onCopySuccess={() => state.markCopied(b.id)}
            />
          </div>
        ) : null,
      )}

      {/*
       * One contextual affiliate line — font-relevant since the popup
       * IS a font-code generator. The extension stays a free SEO/
       * backlink lever (Web Store listings index); this is a single
       * passive line, not a monetization product. rel="sponsored" per
       * the FTC + Google enforcement note on CREATIVE_FABRICA_REF in
       * lib/site.ts.
       */}
      <a
        href={CREATIVE_FABRICA_REF}
        target="_blank"
        rel="sponsored noopener"
        className="flex items-center justify-between min-h-7 px-2 text-[11px] text-muted hover:text-electric"
      >
        <span>
          Need a font?{" "}
          <strong className="text-charcoal">Creative Fabrica</strong>
        </span>
        <span aria-hidden>→</span>
        <span className="sr-only">(affiliate link, opens in new tab)</span>
      </a>

      <button
        type="button"
        onClick={onDownloadAll}
        disabled={blocked}
        title={
          blocked ? "Resolve the warnings above before downloading" : undefined
        }
        className={
          "min-h-8 px-3 rounded-md border text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed " +
          "bg-paper text-charcoal border-charcoal-line/50 hover:border-electric hover:text-electric"
        }
      >
        Download all 3 files
      </button>
    </div>
  );
}

function downloadFile(filename: string, content: string, type: string) {
  if (typeof window === "undefined" || content.trim().length === 0) return;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
