"use client";

import { useEffect, useRef, useState } from "react";
import {
  DISPLAY_STRATEGIES,
  DISPLAY_STRATEGY_LABEL,
  FORMAT_LABEL,
  FORMAT_ORDER,
  UNICODE_RANGE_LABEL,
  VALID_WEIGHTS,
  type FontDisplay,
  type FontFace,
  type FontFormat,
  type FontWeight,
  type UnicodeRangePreset,
} from "@/lib/generators";
import type { FamilyKey, GeneratorState } from "./state";

const TYPE_EXAMPLES = [
  "Söhne",
  "PP Editorial New",
  "Inter Display",
  "Sentinel",
  "Mona Sans",
];

const WEIGHT_LABEL: Record<FontWeight, string> = {
  100: "100 — Thin",
  200: "200 — Extra Light",
  300: "300 — Light",
  400: "400 — Regular",
  500: "500 — Medium",
  600: "600 — Semi Bold",
  700: "700 — Bold",
  800: "800 — Extra Bold",
  900: "900 — Black",
};

const AXIS_HINTS: Record<string, string> = {
  wght: "Weight",
  wdth: "Width",
  slnt: "Slant",
  opsz: "Optical size",
  ital: "Italic",
};

const UNICODE_PRESETS: ReadonlyArray<UnicodeRangePreset> = [
  "latin",
  "latin-ext",
  "cyrillic",
  "cyrillic-ext",
  "greek",
  "vietnamese",
];

type Props = { state: GeneratorState };

export function GeneratorInputs({ state }: Props) {
  return (
    <section
      aria-label="Configure font"
      className="flex flex-col gap-5 border border-charcoal-line/60 rounded-lg p-5 bg-paper shadow-card"
    >
      {/* When a secondary family is active, label the primary as the
          body family so the two panels read as a pair, not a duplicate.  */}
      {state.hasSecondary ? <FamilyRoleBadge role="body" /> : null}

      {/* Primary family name */}
      <label className="flex flex-col gap-2 text-sm font-medium">
        <span>{state.hasSecondary ? "Body font name" : "Custom font name"}</span>
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          value={state.input.primary.name}
          onChange={(e) => state.setPrimaryName(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          className="min-h-[var(--spacing-touch)] w-full px-3 rounded-md border border-charcoal-line/60 bg-paper text-charcoal placeholder:text-muted focus:border-electric"
          placeholder="My Brand Sans"
          aria-describedby="fontname-hint"
        />
        <span
          id="fontname-hint"
          className="text-xs text-muted font-normal flex flex-wrap items-baseline gap-x-2"
        >
          <TypedHint />
          <span aria-hidden className="text-charcoal-line/60">
            ·
          </span>
          <span>
            Becomes the @font-face{" "}
            <code className="font-mono">font-family</code>
          </span>
        </span>
      </label>

      {/* Faces */}
      <FacesPanel state={state} family="primary" label="Faces" />

      {/* Apply to (only meaningful when no secondary family) */}
      {!state.hasSecondary ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Apply to</legend>
          <div className="flex flex-wrap gap-3">
            <ApplyToggle
              label="Headings"
              checked={state.applyToHeading}
              onToggle={() => state.setApplyToHeading(!state.applyToHeading)}
            />
            <ApplyToggle
              label="Body"
              checked={state.applyToBody}
              onToggle={() => state.setApplyToBody(!state.applyToBody)}
            />
          </div>
          <span className="text-xs text-muted">
            Controls which Dawn typography roots the CSS variable block overrides.
          </span>
        </fieldset>
      ) : null}

      {/* Disclosure: Second family for headings */}
      <Disclosure
        label={
          state.hasSecondary
            ? "Second family for headings (active)"
            : "Second family for headings"
        }
        open={state.hasSecondary}
        onToggle={() => state.toggleSecondary()}
      >
        {state.hasSecondary && state.input.secondary ? (
          <div className="flex flex-col gap-4 rounded-md border-l-4 border-amber bg-amber-soft/30 p-4">
            <FamilyRoleBadge role="heading" />
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span>Heading font name</span>
              <input
                type="text"
                spellCheck={false}
                value={state.input.secondary.name}
                onChange={(e) => state.setSecondaryName(e.target.value)}
                className="min-h-[var(--spacing-touch)] w-full px-3 rounded-md border border-charcoal-line/60 bg-paper text-charcoal placeholder:text-muted focus:border-electric"
                placeholder="Playfair Display"
              />
            </label>
            <FacesPanel state={state} family="secondary" label="Heading faces" />
          </div>
        ) : (
          <p className="text-xs text-muted">
            Most stores use one family. Click above to add a second font that
            applies only to headings — useful for serif headlines paired with
            a sans-serif body.
          </p>
        )}
      </Disclosure>

      {/* Disclosure: Variable font (primary) */}
      <Disclosure
        label="Variable font (primary family)"
        open={state.input.primary.isVariable}
        onToggle={() => state.toggleVariable("primary")}
      >
        {state.input.primary.isVariable ? (
          <VariableControls state={state} family="primary" />
        ) : (
          <p className="text-xs text-muted">
            Toggle on if your font ships as a single variable file. Adds a
            weight RANGE + axis sliders that route to{" "}
            <code className="font-mono">font-variation-settings</code>.
          </p>
        )}
      </Disclosure>

      {/* Disclosure: Performance */}
      <Disclosure
        label="Performance (font-display, preload, subset, local)"
        open={false}
      >
        <PerformancePanel state={state} family="primary" />
      </Disclosure>

      {/* Disclosure: Fallback metrics */}
      <Disclosure label="Fallback metrics (zero-CLS font swap)" open={false}>
        <FallbackMetricsPanel state={state} family="primary" />
      </Disclosure>

      {/* Disclosure: OpenType features */}
      <Disclosure label="OpenType features" open={false}>
        <FeatureSettingsPanel state={state} family="primary" />
      </Disclosure>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Role badge — clarifies primary vs secondary family at a glance       */
/* ------------------------------------------------------------------ */

function FamilyRoleBadge({ role }: { role: "body" | "heading" }) {
  const isHeading = role === "heading";
  return (
    <span
      aria-hidden
      className={
        "inline-flex items-center gap-1.5 self-start rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold " +
        (isHeading
          ? "bg-amber text-amber-deep"
          : "bg-electric/15 text-electric")
      }
    >
      <span
        aria-hidden
        className={
          "w-1.5 h-1.5 rounded-full " +
          (isHeading ? "bg-amber-deep" : "bg-electric")
        }
      />
      {isHeading ? "Heading family · /h1, h2, …" : "Body family · /p, li, …"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Faces panel — one row per face, Add / Remove                        */
/* ------------------------------------------------------------------ */

function FacesPanel({
  state,
  family,
  label,
}: {
  state: GeneratorState;
  family: FamilyKey;
  label: string;
}) {
  const fam =
    family === "primary" ? state.input.primary : state.input.secondary;
  if (!fam) return null;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium flex items-baseline gap-2">
        <span>{label}</span>
        <span className="text-xs text-muted font-normal">
          ({fam.faces.length} {fam.faces.length === 1 ? "face" : "faces"})
        </span>
      </legend>
      <div className="flex flex-col gap-3">
        {fam.faces.map((face, idx) => (
          <FaceRow
            key={idx}
            face={face}
            index={idx}
            removable={fam.faces.length > 1}
            onUpdate={(patch) => state.updateFace(family, idx, patch)}
            onRemove={() => state.removeFace(family, idx)}
            onToggleFormat={(fmt) =>
              state.toggleFormatOnFace(family, idx, fmt)
            }
          />
        ))}
        <button
          type="button"
          onClick={() =>
            state.addFace(family, suggestNextFace(fam.faces))
          }
          className="self-start min-h-[var(--spacing-touch)] px-4 rounded-md border border-dashed border-electric/50 text-electric text-sm font-medium hover:bg-electric/5"
        >
          + Add face ({suggestNextLabel(fam.faces)})
        </button>
        <p className="text-xs text-muted">
          Each face becomes its own <code className="font-mono">@font-face</code>{" "}
          block. The filename field on each row defaults to a clean pattern, but
          you can paste the exact filename you uploaded if your foundry shipped
          it with a different name — no renaming required.
        </p>
      </div>
    </fieldset>
  );
}

/**
 * Suggest the next-most-useful face to add based on what's already
 * configured: Regular → Bold → Italic → Bold Italic → next weight up.
 * Lets the "+ Add face" button advertise a concrete next step instead of
 * a generic "e.g. Bold, Italic" hint.
 */
function suggestNextFace(faces: ReadonlyArray<FontFace>): Partial<FontFace> {
  const has = (w: number, s: "normal" | "italic") =>
    faces.some((f) => f.weight === w && f.style === s);
  if (!has(700, "normal"))
    return { weight: 700, style: "normal", formats: ["woff2"] };
  if (!has(400, "italic"))
    return { weight: 400, style: "italic", formats: ["woff2"] };
  if (!has(700, "italic"))
    return { weight: 700, style: "italic", formats: ["woff2"] };
  if (!has(500, "normal"))
    return { weight: 500, style: "normal", formats: ["woff2"] };
  if (!has(300, "normal"))
    return { weight: 300, style: "normal", formats: ["woff2"] };
  return { weight: 400, style: "normal", formats: ["woff2"] };
}

function suggestNextLabel(faces: ReadonlyArray<FontFace>): string {
  const next = suggestNextFace(faces);
  const weight = next.weight ?? 400;
  const style = next.style ?? "normal";
  const styleLabel = style === "italic" ? " Italic" : "";
  const weightLabel =
    weight === 700
      ? "Bold"
      : weight === 400
        ? "Regular"
        : (WEIGHT_LABEL[weight as FontWeight] ?? `${weight}`).split(
            " — ",
          )[1] ?? `${weight}`;
  return `add ${weightLabel}${styleLabel}`;
}

function faceSummary(face: FontFace): string {
  const weightWord =
    face.weight === 400
      ? "Regular"
      : face.weight === 700
        ? "Bold"
        : (WEIGHT_LABEL[face.weight] ?? `${face.weight}`)
            .split(" — ")[1] ?? `${face.weight}`;
  const styleSuffix = face.style === "italic" ? " Italic" : "";
  return `${weightWord} ${face.weight}${styleSuffix}`;
}

function FaceRow({
  face,
  index,
  removable,
  onUpdate,
  onRemove,
  onToggleFormat,
}: {
  face: FontFace;
  index: number;
  removable: boolean;
  onUpdate: (patch: Partial<FontFace>) => void;
  onRemove: () => void;
  onToggleFormat: (fmt: FontFormat) => void;
}) {
  const summary = faceSummary(face);
  return (
    <div className="rounded-md border border-charcoal-line/40 flex flex-col bg-paper-dim/30 overflow-hidden">
      <header className="flex items-center justify-between gap-2 px-3 py-2 bg-charcoal/[0.04] border-b border-charcoal-line/30">
        <p className="text-xs font-semibold text-charcoal flex items-baseline gap-2">
          <span
            aria-hidden
            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-charcoal text-paper font-mono text-[10px]"
          >
            {index + 1}
          </span>
          <span>Face {index + 1}</span>
          <span className="font-normal text-muted">·</span>
          <span className="font-normal text-muted">{summary}</span>
        </p>
        {removable ? (
          <button
            type="button"
            onClick={onRemove}
            className="min-h-[1.75rem] px-2 rounded text-xs text-muted hover:text-error hover:bg-error/5"
            aria-label={`Remove face ${index + 1}`}
          >
            Remove
          </button>
        ) : null}
      </header>
      <div className="flex flex-col gap-3 p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium">
            <span>Weight</span>
            <select
              value={face.weight}
              onChange={(e) =>
                onUpdate({ weight: Number(e.target.value) as FontWeight })
              }
              className="min-h-[var(--spacing-touch)] px-3 rounded-md border border-charcoal-line/60 bg-paper text-charcoal"
            >
              {VALID_WEIGHTS.map((w) => (
                <option key={w} value={w}>
                  {WEIGHT_LABEL[w]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium">
            <span>Style</span>
            <select
              value={face.style}
              onChange={(e) =>
                onUpdate({
                  style: e.target.value === "italic" ? "italic" : "normal",
                })
              }
              className="min-h-[var(--spacing-touch)] px-3 rounded-md border border-charcoal-line/60 bg-paper text-charcoal"
            >
              <option value="normal">normal</option>
              <option value="italic">italic</option>
            </select>
          </label>
        </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium">Formats</span>
        <div className="flex flex-wrap gap-2">
          {FORMAT_ORDER.map((fmt) => (
            <FormatToggle
              key={fmt}
              format={fmt}
              checked={face.formats.includes(fmt)}
              onToggle={() => onToggleFormat(fmt)}
            />
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-xs">
        <span className="font-medium">Filename (no extension)</span>
        <input
          type="text"
          spellCheck={false}
          placeholder="auto"
          value={face.filenameOverride ?? ""}
          onChange={(e) =>
            onUpdate({ filenameOverride: e.target.value || undefined })
          }
          className="min-h-[2.25rem] px-2 rounded-md border border-charcoal-line/60 bg-paper text-charcoal font-mono"
        />
        <span className="text-muted">
          Leave blank to auto-generate from the font name. Set it to your exact
          uploaded filename if your font shipped as e.g.{" "}
          <code className="font-mono">Calibre-Bold.woff2</code> — then paste{" "}
          <code className="font-mono">Calibre-Bold</code> here.
        </span>
      </label>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Variable font controls                                              */
/* ------------------------------------------------------------------ */

function VariableControls({
  state,
  family,
}: {
  state: GeneratorState;
  family: FamilyKey;
}) {
  const fam =
    family === "primary" ? state.input.primary : state.input.secondary;
  if (!fam) return null;
  const [min, max] = fam.weightRange ?? [100, 900];
  const axes = fam.axes ?? [];

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted">
          Weight range
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium">
            <span className="text-muted">Min</span>
            <input
              type="number"
              min={1}
              max={1000}
              value={min}
              onChange={(e) =>
                state.setWeightRange(family, [Number(e.target.value), max])
              }
              className="min-h-[var(--spacing-touch)] px-3 rounded-md border border-charcoal-line/60 bg-paper text-charcoal font-mono"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium">
            <span className="text-muted">Max</span>
            <input
              type="number"
              min={1}
              max={1000}
              value={max}
              onChange={(e) =>
                state.setWeightRange(family, [min, Number(e.target.value)])
              }
              className="min-h-[var(--spacing-touch)] px-3 rounded-md border border-charcoal-line/60 bg-paper text-charcoal font-mono"
            />
          </label>
        </div>
        <p className="text-[11px] text-muted">
          Becomes <code className="font-mono">font-weight: {min} {max};</code>{" "}
          in every face. Most variable fonts ship 100–900.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted">
          Axis defaults
        </legend>
        {axes.length === 0 ? (
          <p className="text-[11px] text-muted">
            No axes yet. Add one below — <code className="font-mono">wght</code>{" "}
            (weight) is the most common; <code className="font-mono">wdth</code>{" "}
            (width) and <code className="font-mono">slnt</code> (slant) cover the
            remaining design space.
          </p>
        ) : null}
        {axes.map((axis) => (
          <div
            key={axis.tag}
            className="grid grid-cols-[9rem_1fr_auto] gap-2 items-center bg-paper-dim/40 rounded-md px-2 py-1.5 border border-charcoal-line/30"
          >
            <span className="flex flex-col">
              <code className="font-mono text-xs text-charcoal font-semibold">
                {axis.tag}
              </code>
              <span className="text-[10px] text-muted">
                {AXIS_HINTS[axis.tag] ?? "Custom axis"}
              </span>
            </span>
            <input
              type="number"
              value={axis.value}
              onChange={(e) =>
                state.setAxis(family, axis.tag, Number(e.target.value))
              }
              className="min-h-[2.25rem] px-2 rounded-md border border-charcoal-line/60 bg-paper text-charcoal font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => state.removeAxis(family, axis.tag)}
              className="min-h-[2rem] min-w-[2rem] rounded text-sm text-muted hover:text-error hover:bg-error/5"
              aria-label={`Remove axis ${axis.tag}`}
            >
              ×
            </button>
          </div>
        ))}
        <AddAxisRow
          existingTags={axes.map((a) => a.tag)}
          onAdd={(tag, value) => state.setAxis(family, tag, value)}
        />
      </fieldset>
    </div>
  );
}

function AddAxisRow({
  existingTags,
  onAdd,
}: {
  existingTags: string[];
  onAdd: (tag: string, value: number) => void;
}) {
  const [tag, setTag] = useState("");
  const [value, setValue] = useState("");
  const presets = ["wght", "wdth", "slnt", "opsz", "ital"].filter(
    (t) => !existingTags.includes(t),
  );
  const canAdd =
    tag.length > 0 && value.length > 0 && Number.isFinite(Number(value));
  return (
    <div className="grid grid-cols-[9rem_1fr_auto] gap-2 items-center pt-1">
      <select
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className="min-h-[var(--spacing-touch)] px-2 rounded-md border border-charcoal-line/60 bg-paper text-charcoal text-xs"
      >
        <option value="">+ Add axis…</option>
        {presets.map((t) => (
          <option key={t} value={t}>
            {t} ({AXIS_HINTS[t]})
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="default value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="min-h-[var(--spacing-touch)] px-2 rounded-md border border-charcoal-line/60 bg-paper text-charcoal font-mono text-xs"
      />
      <button
        type="button"
        disabled={!canAdd}
        onClick={() => {
          if (!canAdd) return;
          onAdd(tag, Number(value));
          setTag("");
          setValue("");
        }}
        className="min-h-[var(--spacing-touch)] px-3 rounded-md border border-electric text-electric text-xs hover:bg-electric/5 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Add
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Performance panel — font-display, preload, subset, local            */
/* ------------------------------------------------------------------ */

function PerformancePanel({
  state,
  family,
}: {
  state: GeneratorState;
  family: FamilyKey;
}) {
  const fam =
    family === "primary" ? state.input.primary : state.input.secondary;
  if (!fam) return null;
  const firstFace = fam.faces[0];

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-xs">
        <span className="font-medium">font-display strategy</span>
        <select
          value={fam.displayStrategy}
          onChange={(e) => {
            const v = e.target.value as FontDisplay;
            if (family === "primary") state.setPrimaryDisplay(v);
            else state.setSecondaryDisplay(v);
          }}
          className="min-h-[var(--spacing-touch)] px-3 rounded-md border border-charcoal-line/60 bg-paper text-charcoal text-sm"
        >
          {DISPLAY_STRATEGIES.map((s) => (
            <option key={s} value={s}>
              {DISPLAY_STRATEGY_LABEL[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={state.preloadHints}
          onChange={(e) => state.setPreloadHints(e.target.checked)}
        />
        <span>
          <strong className="font-medium">Add preload hints</strong> — emits a
          fourth code block to paste in{" "}
          <code className="font-mono">theme.liquid</code>&apos;s{" "}
          <code className="font-mono">&lt;head&gt;</code>. Preloads the first
          WOFF2 of every family so the LCP element renders in your brand face on
          first paint.
        </span>
      </label>

      {firstFace ? (
        <SubsetPanel
          face={firstFace}
          onUpdate={(patch) => state.updateFace(family, 0, patch)}
        />
      ) : null}

      {firstFace ? (
        <LocalNamesPanel
          face={firstFace}
          onUpdate={(patch) => state.updateFace(family, 0, patch)}
        />
      ) : null}
    </div>
  );
}

function SubsetPanel({
  face,
  onUpdate,
}: {
  face: FontFace;
  onUpdate: (patch: Partial<FontFace>) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <span className="font-medium">Unicode subset (first face)</span>
      <select
        value={face.unicodeRangePreset ?? ""}
        onChange={(e) =>
          onUpdate({
            unicodeRangePreset: e.target.value
              ? (e.target.value as UnicodeRangePreset)
              : undefined,
          })
        }
        className="min-h-[var(--spacing-touch)] px-3 rounded-md border border-charcoal-line/60 bg-paper text-charcoal text-sm"
      >
        <option value="">No subset (entire font)</option>
        {UNICODE_PRESETS.map((p) => (
          <option key={p} value={p}>
            {UNICODE_RANGE_LABEL[p]}
          </option>
        ))}
      </select>
      <input
        type="text"
        spellCheck={false}
        placeholder="Custom unicode-range (overrides preset)"
        value={face.unicodeRangeCustom ?? ""}
        onChange={(e) =>
          onUpdate({ unicodeRangeCustom: e.target.value || undefined })
        }
        className="min-h-[2.25rem] px-2 rounded-md border border-charcoal-line/60 bg-paper text-charcoal font-mono text-xs"
      />
      <span className="text-muted">
        Subsets cut bytes by ~50–80% per face. Best for sites that serve a
        single locale.
      </span>
    </div>
  );
}

function LocalNamesPanel({
  face,
  onUpdate,
}: {
  face: FontFace;
  onUpdate: (patch: Partial<FontFace>) => void;
}) {
  const value = (face.localNames ?? []).join(", ");
  return (
    <label className="flex flex-col gap-1.5 text-xs">
      <span className="font-medium">local() fallbacks (first face)</span>
      <input
        type="text"
        spellCheck={false}
        placeholder='e.g. "Inter", "Inter-Regular"'
        value={value}
        onChange={(e) => {
          const next = e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          onUpdate({ localNames: next.length > 0 ? next : undefined });
        }}
        className="min-h-[2.25rem] px-2 rounded-md border border-charcoal-line/60 bg-paper text-charcoal text-sm"
      />
      <span className="text-muted">
        When the font is already installed on the visitor&apos;s machine (a known
        system font), the browser uses the local copy and skips the network
        fetch entirely.
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Fallback metrics panel — size-adjust, ascent/descent/line-gap       */
/* ------------------------------------------------------------------ */

function FallbackMetricsPanel({
  state,
  family,
}: {
  state: GeneratorState;
  family: FamilyKey;
}) {
  const fam =
    family === "primary" ? state.input.primary : state.input.secondary;
  if (!fam) return null;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted">
        Zero-CLS font swap. Set the system-font fallback&apos;s metrics to match
        your custom font, so the page doesn&apos;t reflow when the WOFF2 lands.
        Values are CSS strings (e.g. <code className="font-mono">105%</code>).
      </p>
      <MetricInput
        label="size-adjust"
        value={fam.sizeAdjust ?? ""}
        onChange={(v) => state.setFallbackMetric(family, "sizeAdjust", v)}
        placeholder="100%"
      />
      <MetricInput
        label="ascent-override"
        value={fam.ascentOverride ?? ""}
        onChange={(v) => state.setFallbackMetric(family, "ascentOverride", v)}
        placeholder="88%"
      />
      <MetricInput
        label="descent-override"
        value={fam.descentOverride ?? ""}
        onChange={(v) =>
          state.setFallbackMetric(family, "descentOverride", v)
        }
        placeholder="22%"
      />
      <MetricInput
        label="line-gap-override"
        value={fam.lineGapOverride ?? ""}
        onChange={(v) =>
          state.setFallbackMetric(family, "lineGapOverride", v)
        }
        placeholder="0%"
      />
    </div>
  );
}

function MetricInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string | undefined) => void;
  placeholder: string;
}) {
  return (
    <label className="grid grid-cols-[8rem_1fr] gap-2 items-center text-xs">
      <code className="font-mono">{label}</code>
      <input
        type="text"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="min-h-[2.25rem] px-2 rounded-md border border-charcoal-line/60 bg-paper text-charcoal font-mono"
      />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* OpenType feature settings                                           */
/* ------------------------------------------------------------------ */

const FEATURE_PRESETS: ReadonlyArray<{ tag: string; label: string }> = [
  { tag: "liga", label: "Ligatures (recommended)" },
  { tag: "kern", label: "Kerning" },
  { tag: "tnum", label: "Tabular figures" },
  { tag: "lnum", label: "Lining figures" },
  { tag: "onum", label: "Old-style figures" },
  { tag: "smcp", label: "Small caps" },
  { tag: "ss01", label: "Stylistic set 01" },
  { tag: "ss02", label: "Stylistic set 02" },
];

function FeatureSettingsPanel({
  state,
  family,
}: {
  state: GeneratorState;
  family: FamilyKey;
}) {
  const fam =
    family === "primary" ? state.input.primary : state.input.secondary;
  if (!fam) return null;
  const active = new Set(fam.featureSettings ?? []);

  const toggle = (raw: string) => {
    const next = new Set(active);
    if (next.has(raw)) next.delete(raw);
    else next.add(raw);
    state.setFeatureSettings(family, Array.from(next));
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">
        Toggle OpenType features your font supports. The generator passes them
        through as <code className="font-mono">font-feature-settings</code>.
      </p>
      <div className="flex flex-wrap gap-2">
        {FEATURE_PRESETS.map(({ tag, label }) => {
          const raw = `"${tag}" 1`;
          const checked = active.has(raw);
          return (
            <button
              key={tag}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => toggle(raw)}
              className={
                "min-h-[2.5rem] px-3 rounded-md border text-xs transition-colors " +
                (checked
                  ? "bg-electric text-paper border-electric"
                  : "bg-paper text-charcoal border-charcoal-line/60 hover:border-electric")
              }
            >
              <span className="font-mono mr-1">{tag}</span>
              <span className="text-[10px] opacity-80">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Disclosure primitive                                                */
/* ------------------------------------------------------------------ */

function Disclosure({
  label,
  open: openProp,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(openProp);
  const isControlled = onToggle !== undefined;
  const open = isControlled ? openProp : internalOpen;
  return (
    <div className="border-t border-charcoal-line/20 pt-3">
      <button
        type="button"
        onClick={() => {
          if (isControlled) onToggle();
          else setInternalOpen((v) => !v);
        }}
        aria-expanded={open}
        className="flex items-center justify-between w-full text-sm font-medium text-charcoal hover:text-electric"
      >
        <span>{label}</span>
        <span aria-hidden className="ml-2 text-muted">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? <div className="mt-3 flex flex-col gap-3">{children}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Format / apply chips (reused)                                       */
/* ------------------------------------------------------------------ */

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M3.5 8.5l3 3 6-6.5" />
    </svg>
  );
}

function FormatToggle({
  format,
  checked,
  onToggle,
}: {
  format: FontFormat;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={
        "min-h-[2.5rem] min-w-[2.5rem] px-3 rounded-md border text-xs font-medium transition-colors inline-flex items-center gap-1.5 " +
        (checked
          ? "bg-electric text-paper border-electric"
          : "bg-paper text-charcoal border-charcoal-line/60 hover:border-electric")
      }
    >
      {checked ? <CheckIcon /> : <span aria-hidden className="w-[14px] shrink-0" />}
      <span>{FORMAT_LABEL[format]}</span>
    </button>
  );
}

function ApplyToggle({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={
        "min-h-[var(--spacing-touch)] px-4 rounded-md border text-sm font-medium transition-colors inline-flex items-center gap-2 " +
        (checked
          ? "bg-electric text-paper border-electric"
          : "bg-paper text-charcoal border-charcoal-line/60 hover:border-electric")
      }
    >
      {checked ? <CheckIcon /> : <span aria-hidden className="w-[14px] shrink-0" />}
      <span>{label}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Typewriter hint                                                     */
/* ------------------------------------------------------------------ */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

function useTypewriter(active: boolean) {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<
    "typing" | "holding" | "erasing" | "pausing"
  >("typing");

  useEffect(() => {
    if (!active) return;
    const target = TYPE_EXAMPLES[idx]!;
    const TYPE_MS = 80;
    const ERASE_MS = 38;
    const HOLD_MS = 1400;
    const PAUSE_MS = 320;

    let timer: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      timer =
        text.length < target.length
          ? setTimeout(() => setText(target.slice(0, text.length + 1)), TYPE_MS)
          : setTimeout(() => setPhase("holding"), HOLD_MS);
    } else if (phase === "holding") {
      timer = setTimeout(() => setPhase("erasing"), 0);
    } else if (phase === "erasing") {
      timer =
        text.length > 0
          ? setTimeout(() => setText(text.slice(0, -1)), ERASE_MS)
          : setTimeout(() => setPhase("pausing"), 0);
    } else {
      timer = setTimeout(() => {
        setIdx((prev) => (prev + 1) % TYPE_EXAMPLES.length);
        setPhase("typing");
      }, PAUSE_MS);
    }
    return () => clearTimeout(timer);
  }, [text, phase, idx, active]);

  return text;
}

function TypedHint() {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const reduced = useReducedMotion();
  const text = useTypewriter(!reduced && inView);

  useEffect(() => {
    if (typeof window === "undefined" || !window.IntersectionObserver) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <span className="sr-only">Examples: {TYPE_EXAMPLES.join(", ")}</span>
      <span ref={ref} aria-hidden className="font-mono text-charcoal">
        Try: <span>{reduced ? TYPE_EXAMPLES[0] : text}</span>
        {!reduced ? (
          <span className="animate-blink ml-px text-electric">|</span>
        ) : null}
      </span>
    </>
  );
}
