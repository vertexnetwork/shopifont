import {
  FORMAT_LABEL,
  FORMAT_ORDER,
  VALID_WEIGHTS,
  type FontWeight,
} from "@/lib/generators";
import type { GeneratorState } from "@/components/Generator/state";

/**
 * Popup-tight input form. Shares the same hook as the website
 * (`useGenerator`) so warnings, output, and copy-tracking all behave
 * identically — but the markup is built for 380×600, not the website's
 * 1024px+ canvas. Specifically, this trims:
 *
 *  - The "Examples" copy and typewriter hint (no room)
 *  - Per-field help text (the labels carry enough meaning at this size)
 *  - The fieldset border + legend chrome (popup is one fieldset already)
 *  - Padding/gap budgets are halved vs. the website's GeneratorInputs
 */
export function CompactInputs({ state }: { state: GeneratorState }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium">
        <span className="text-muted">Font name</span>
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          value={state.fontName}
          onChange={(e) => state.setFontName(e.target.value)}
          placeholder="My Brand Sans"
          className="min-h-9 px-2.5 rounded-md border border-charcoal-line/60 bg-paper text-charcoal text-sm placeholder:text-muted focus:border-electric"
        />
      </label>

      <div>
        <p className="text-xs font-medium text-muted mb-1.5">Formats</p>
        <div className="flex flex-wrap gap-1.5">
          {FORMAT_ORDER.map((fmt) => {
            const checked = state.formats.includes(fmt);
            return (
              <button
                key={fmt}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => state.toggleFormat(fmt)}
                className={
                  "min-h-8 px-2.5 rounded-md border text-xs font-medium transition-colors " +
                  (checked
                    ? "bg-electric text-paper border-electric"
                    : "bg-paper text-charcoal border-charcoal-line/60 hover:border-electric")
                }
              >
                {FORMAT_LABEL[fmt]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs font-medium">
          <span className="text-muted">Weight</span>
          <select
            value={state.weight}
            onChange={(e) =>
              state.setWeight(Number(e.target.value) as FontWeight)
            }
            className="min-h-9 px-2.5 rounded-md border border-charcoal-line/60 bg-paper text-charcoal text-sm"
          >
            {VALID_WEIGHTS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium">
          <span className="text-muted">Style</span>
          <select
            value={state.style}
            onChange={(e) =>
              state.setStyle(e.target.value === "italic" ? "italic" : "normal")
            }
            className="min-h-9 px-2.5 rounded-md border border-charcoal-line/60 bg-paper text-charcoal text-sm"
          >
            <option value="normal">normal</option>
            <option value="italic">italic</option>
          </select>
        </label>
      </div>

      <div>
        <p className="text-xs font-medium text-muted mb-1.5">Apply to</p>
        <div className="grid grid-cols-2 gap-2">
          <ApplyChip
            label="Headings"
            checked={state.applyToHeading}
            onToggle={() => state.setApplyToHeading(!state.applyToHeading)}
          />
          <ApplyChip
            label="Body"
            checked={state.applyToBody}
            onToggle={() => state.setApplyToBody(!state.applyToBody)}
          />
        </div>
      </div>
    </div>
  );
}

function ApplyChip({
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
        "min-h-8 rounded-md border text-xs font-medium transition-colors " +
        (checked
          ? "bg-charcoal text-paper border-charcoal"
          : "bg-paper text-charcoal border-charcoal-line/60 hover:border-electric")
      }
    >
      {label}
    </button>
  );
}
