"use client";

import {
  FORMAT_LABEL,
  FORMAT_ORDER,
  VALID_WEIGHTS,
  type FontFormat,
  type FontWeight,
} from "@/lib/generators";
import type { GeneratorState } from "./state";

type Props = {
  state: GeneratorState;
};

export function GeneratorInputs({ state }: Props) {
  return (
    <fieldset className="flex flex-col gap-5 border border-charcoal-line/60 rounded-lg p-5 bg-paper">
      <legend className="px-2 text-xs uppercase tracking-wide text-muted">
        Configure font
      </legend>

      <label className="flex flex-col gap-2 text-sm font-medium">
        <span>Custom font name</span>
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          value={state.fontName}
          onChange={(e) => state.setFontName(e.target.value)}
          className="min-h-[var(--spacing-touch)] w-full px-3 rounded-md border border-charcoal-line/60 bg-paper text-charcoal placeholder:text-muted focus:border-electric"
          placeholder="My Brand Sans"
          aria-describedby="fontname-hint"
        />
        <span id="fontname-hint" className="text-xs text-muted font-normal">
          Used as the @font-face <code className="font-mono">font-family</code> and to
          derive the asset filename slug.
        </span>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Formats</legend>
        <div className="flex flex-wrap gap-2">
          {FORMAT_ORDER.map((fmt) => (
            <FormatToggle
              key={fmt}
              format={fmt}
              checked={state.formats.includes(fmt)}
              onToggle={() => state.toggleFormat(fmt)}
            />
          ))}
        </div>
        <span className="text-xs text-muted">
          WOFF2 covers ~97% of modern traffic. Add WOFF / TTF only if you need
          legacy fallbacks.
        </span>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span>Weight</span>
          <select
            value={state.weight}
            onChange={(e) => state.setWeight(Number(e.target.value) as FontWeight)}
            className="min-h-[var(--spacing-touch)] w-full px-3 rounded-md border border-charcoal-line/60 bg-paper text-charcoal"
          >
            {VALID_WEIGHTS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span>Style</span>
          <select
            value={state.style}
            onChange={(e) =>
              state.setStyle(e.target.value === "italic" ? "italic" : "normal")
            }
            className="min-h-[var(--spacing-touch)] w-full px-3 rounded-md border border-charcoal-line/60 bg-paper text-charcoal"
          >
            <option value="normal">normal</option>
            <option value="italic">italic</option>
          </select>
        </label>
      </div>

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
    </fieldset>
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
        "min-h-[var(--spacing-touch)] min-w-[var(--spacing-touch)] px-4 rounded-md border text-sm font-medium transition-colors " +
        (checked
          ? "bg-electric text-paper border-electric"
          : "bg-paper text-charcoal border-charcoal-line/60 hover:border-electric")
      }
    >
      {FORMAT_LABEL[format]}
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
        "min-h-[var(--spacing-touch)] px-4 rounded-md border text-sm font-medium transition-colors " +
        (checked
          ? "bg-charcoal text-paper border-charcoal"
          : "bg-paper text-charcoal border-charcoal-line/60 hover:border-electric")
      }
    >
      {label}
    </button>
  );
}
