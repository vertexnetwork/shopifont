"use client";

import { useState } from "react";
import { GeneratorActions } from "./Actions";
import { GeneratorInputs } from "./Inputs";
import { GeneratorPreview } from "./Preview";
import { CodeBlock } from "./CodeBlock";
import { useGenerator, variantFor, type CopyTarget } from "./state";

type BlockMeta = {
  id: CopyTarget;
  step: number;
  title: string;
  short: string;
  description: string;
  language: "css" | "json";
};

const CORE_BLOCKS: ReadonlyArray<BlockMeta> = [
  {
    id: "fontFace",
    step: 1,
    title: "@font-face CSS",
    short: "@font-face",
    description:
      "Upload your font files to the theme's assets/ folder, then paste this at the bottom of assets/base.css. Shopify's asset_url filter resolves the file paths at render time.",
    language: "css",
  },
  {
    id: "settings",
    step: 2,
    title: "settings_schema.json",
    short: "settings_schema",
    description:
      "Adds a Theme Editor section so non-technical merchants can toggle the font on or off.",
    language: "json",
  },
  {
    id: "cssVars",
    step: 3,
    title: "CSS variable overrides",
    short: "CSS variables",
    description:
      "Retargets the theme's --font-heading-family / --font-body-family. Survives theme updates.",
    language: "css",
  },
];

const PRELOAD_BLOCK: BlockMeta = {
  id: "preload",
  step: 4,
  title: "<head> preload (theme.liquid)",
  short: "preload",
  description:
    "Paste in <head> in layout/theme.liquid, just before the stylesheet link. Preloads the first WOFF2 of every family so the LCP element renders in your brand face on first paint.",
  language: "css",
};

type ShopifontGeneratorProps = {
  /**
   * Render mode. "page" is the default homepage / pSEO context — the
   * generator owns the URL and shows the Share-this-config action.
   * "embed" is the iframe `/embed` route AND the Chrome extension
   * popup — URL syncing is off (host page owns the URL) and the
   * Share button is hidden.
   */
  mode?: "page" | "embed";
};

export function ShopifontGenerator({
  mode = "page",
}: ShopifontGeneratorProps = {}) {
  const isEmbed = mode === "embed";
  const state = useGenerator({ syncToUrl: !isEmbed });
  const [activeMobile, setActiveMobile] = useState<CopyTarget>("fontFace");

  const blocks: ReadonlyArray<BlockMeta> = state.preloadHints
    ? [...CORE_BLOCKS, PRELOAD_BLOCK]
    : CORE_BLOCKS;

  const codeFor = (id: CopyTarget): string => {
    if (id === "fontFace") return state.fontFaceCss;
    if (id === "settings") return state.settingsSchemaJson;
    if (id === "cssVars") return state.cssVariableOverrides;
    return state.preloadSnippet;
  };
  const warnFor = (id: CopyTarget): string | null => {
    if (id === "fontFace") return state.warnings.fontFace;
    if (id === "settings") return state.warnings.settings;
    if (id === "cssVars") return state.warnings.cssVars;
    return state.warnings.preload;
  };

  if (activeMobile === "preload" && !state.preloadHints) {
    setActiveMobile("fontFace");
  }

  const blockCountCopy = state.preloadHints
    ? "Paste these four blocks. The first three install the font; the fourth (<head> preload) is optional but speeds up your LCP."
    : "Paste these three blocks in order. They're independent files in your theme — copying one without the others won't break the store.";

  return (
    <div className="flex flex-col gap-6">
      {/* Generator surface.
          Mobile: preview-first (so it's visible at the top), inputs below,
          and the preview is sticky-positioned to the top of the viewport
          so users see live changes without scrolling back up.
          Desktop: side-by-side, with the preview column sticky inside its
          grid cell. */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* Inputs panel — order-2 on mobile so the preview sits on top of
            the scroll. order-1 on desktop so the input reads left-to-right
            in the natural reading direction. */}
        <div className="order-2 lg:order-1">
          <GeneratorInputs state={state} />
        </div>

        {/* Preview — sticky on every viewport. Order-1 on mobile (always
            on top of the inputs); on desktop the preview is the right
            column. `top-2` keeps a tiny gap from the viewport edge / the
            previous element when pinned. */}
        <div className="order-1 lg:order-2 sticky top-2 z-20 lg:top-4">
          <GeneratorPreview state={state} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted max-w-md">{blockCountCopy}</p>
        <GeneratorActions state={state} hideShare={isEmbed} />
      </div>

      {/* Mobile (< lg): tabbed switcher */}
      <div className="lg:hidden">
        <div
          role="tablist"
          aria-label="Generated code blocks"
          className="flex flex-wrap gap-2 mb-3"
        >
          {blocks.map((b) => {
            const active = activeMobile === b.id;
            const w = warnFor(b.id);
            const isDone = state.copiedSteps.has(b.id);
            return (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`mobile-panel-${b.id}`}
                aria-label={`Step ${b.step}: ${b.short}`}
                id={`mobile-tab-${b.id}`}
                onClick={() => setActiveMobile(b.id)}
                className={
                  "min-h-[var(--spacing-touch)] px-3 rounded-md border text-sm font-medium transition-colors flex items-center gap-2 " +
                  (active
                    ? "bg-electric text-paper border-electric"
                    : "bg-paper text-charcoal border-charcoal-line/60 hover:border-electric")
                }
              >
                <span
                  aria-hidden
                  className={
                    "inline-flex items-center justify-center w-5 h-5 rounded-full font-mono text-[11px] " +
                    (active
                      ? "bg-paper text-electric"
                      : isDone
                        ? "bg-paper-dim text-muted border border-charcoal-line/40"
                        : "bg-charcoal text-paper")
                  }
                >
                  {isDone ? "✓" : b.step}
                </span>
                <span>Step {b.step}</span>
                {w ? (
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
        {blocks.map((b) => (
          <div
            key={b.id}
            id={`mobile-panel-${b.id}`}
            role="tabpanel"
            aria-labelledby={`mobile-tab-${b.id}`}
            hidden={activeMobile !== b.id}
          >
            {activeMobile === b.id ? (
              <CodeBlock
                idPrefix="m"
                step={b.step}
                title={b.title}
                description={b.description}
                code={codeFor(b.id)}
                language={b.language}
                warning={warnFor(b.id)}
                variant={variantFor(b.id, state.copiedSteps)}
                onCopySuccess={() => state.markCopied(b.id)}
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Desktop: side-by-side blocks. `items-stretch` forces every grid
          cell to match the tallest sibling, so the optional 4th preload
          card matches @font-face's vertical extent. */}
      <div
        className={
          "hidden lg:grid gap-6 items-stretch " +
          (state.preloadHints ? "lg:grid-cols-4" : "lg:grid-cols-3")
        }
      >
        {blocks.map((b) => (
          <CodeBlock
            key={b.id}
            idPrefix="d"
            step={b.step}
            title={b.title}
            description={b.description}
            code={codeFor(b.id)}
            language={b.language}
            warning={warnFor(b.id)}
            variant={variantFor(b.id, state.copiedSteps)}
            onCopySuccess={() => state.markCopied(b.id)}
          />
        ))}
      </div>
    </div>
  );
}
