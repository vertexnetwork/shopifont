"use client";

import { useState } from "react";
import { GeneratorActions } from "./Actions";
import { GeneratorInputs } from "./Inputs";
import { GeneratorPreview } from "./Preview";
import { CodeBlock } from "./CodeBlock";
import { useGenerator, variantFor, type CopyTarget } from "./state";
import { slugify } from "@/lib/generators/slugify";

const BLOCKS: ReadonlyArray<{
  id: CopyTarget;
  step: number;
  title: string;
  /** Long descriptor for desktop and aria-label. */
  short: string;
  description: string;
  language: "css" | "json";
}> = [
  {
    id: "fontFace",
    step: 1,
    title: "@font-face CSS",
    short: "@font-face",
    description:
      "Paste at the bottom of assets/base.css. Uses Liquid's asset_url filter — Shopify resolves the path at render time.",
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

type ShopifontGeneratorProps = {
  /**
   * Render mode. "page" is the default homepage / pSEO context — the
   * generator owns the URL and shows the Share-this-config action.
   * "embed" is the iframe `/embed` route AND the Chrome extension
   * popup — URL syncing is off (host page owns the URL) and the
   * Share button is hidden because the URL it would copy isn't
   * shareable from the host's perspective.
   */
  mode?: "page" | "embed";
};

/**
 * The full Shopifont generator surface. Embedded on the homepage and
 * on every pSEO page. Pure client-side string interpolation — no
 * network, no upload, no server round-trip.
 */
export function ShopifontGenerator({ mode = "page" }: ShopifontGeneratorProps = {}) {
  const isEmbed = mode === "embed";
  const state = useGenerator({ syncToUrl: !isEmbed });
  const [activeMobile, setActiveMobile] = useState<CopyTarget>("fontFace");

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

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <GeneratorInputs state={state} />
        <GeneratorPreview state={state} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted max-w-md">
          Paste these three blocks in order. They&apos;re independent files in
          your theme — copying one without the others won&apos;t break the store.
        </p>
        <GeneratorActions state={state} hideShare={isEmbed} />
      </div>

      <AssetsUploadCallout
        fontName={state.fontName}
        hasMultipleWeights={state.additionalWeights.length > 0}
      />

      {/*
       * Mobile (< lg): tabbed switcher to cut ~⅔ of vertical scroll on
       * the output. Desktop: all three side-by-side. Tab labels are
       * Step 1/2/3 on small viewports so three pills don't wrap to a
       * second row at 360px; the long technical name lives on the card.
       */}
      <div className="lg:hidden">
        <div
          role="tablist"
          aria-label="Generated code blocks"
          className="flex flex-wrap gap-2 mb-3"
        >
          {BLOCKS.map((b) => {
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
        {BLOCKS.map((b) => (
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

      <div className="hidden lg:grid gap-6 lg:grid-cols-3">
        {BLOCKS.map((b) => (
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

/**
 * Step 0 — explicit "upload your font files first" reminder. The
 * three code blocks all assume the merchant has already uploaded the
 * matching files to the theme's `assets/` folder; without that the
 * @font-face block silently 404s in production. This banner is the
 * only place that says it explicitly. Shown only after the merchant
 * has typed a font name so the empty-state surface stays uncluttered.
 */
function AssetsUploadCallout({
  fontName,
  hasMultipleWeights,
}: {
  fontName: string;
  hasMultipleWeights: boolean;
}) {
  const trimmed = fontName.trim();
  if (trimmed.length === 0) return null;
  const baseName = slugify(trimmed) || "your-font";
  const filenameExample = hasMultipleWeights
    ? `${baseName}-400.woff2`
    : `${baseName}.woff2`;

  return (
    <aside
      role="note"
      className="rounded-md border-l-4 border-amber bg-amber-soft/40 p-3 text-sm text-charcoal/90"
    >
      <strong className="block mb-1">Step 0 — Upload your font files first.</strong>
      Drop your{" "}
      <code className="font-mono text-xs">.woff2</code> /{" "}
      <code className="font-mono text-xs">.woff</code> /{" "}
      <code className="font-mono text-xs">.ttf</code> files into your theme&apos;s{" "}
      <code className="font-mono text-xs">assets/</code> folder before pasting
      any of the code below. Filenames must match{" "}
      <code className="font-mono text-xs">{filenameExample}</code>
      {hasMultipleWeights ? (
        <>
          {" "}— one file per weight, the{" "}
          <code className="font-mono text-xs">{`-{weight}`}</code> suffix is how
          Shopify resolves each face.
        </>
      ) : (
        <>
          {" "}or the @font-face block will 404 silently.
        </>
      )}
    </aside>
  );
}
