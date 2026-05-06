"use client";

import { useEffect, useRef, useState } from "react";
import {
  FORMAT_LABEL,
  FORMAT_ORDER,
  VALID_WEIGHTS,
  type FontFormat,
  type FontWeight,
} from "@/lib/generators";
import type { GeneratorState } from "./state";

/**
 * Foundry-shaped names that signal "this works with the fonts you
 * actually license." Cycled below the input via a typewriter so the
 * tool reads as live without forcing the user to interact.
 */
const TYPE_EXAMPLES = [
  "Söhne",
  "PP Editorial New",
  "Inter Display",
  "Sentinel",
  "Mona Sans",
];

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

/**
 * Self-contained so its frequent state ticks don't re-render the
 * whole Inputs panel. Visual cycling text is aria-hidden; an sr-only
 * span emits the full example list for assistive tech.
 *
 * IntersectionObserver gate: the typewriter only runs when this hint
 * is in the viewport. The Generator sits below the fold on initial
 * load — running the cycle while the user can't see it wasted style/
 * layout cycles that Lighthouse counted toward LCP-window CPU time.
 */
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
      <span className="sr-only">
        Examples: {TYPE_EXAMPLES.join(", ")}
      </span>
      <span ref={ref} aria-hidden className="font-mono text-charcoal">
        Try:{" "}
        <span>{reduced ? TYPE_EXAMPLES[0] : text}</span>
        {!reduced ? (
          <span className="animate-blink ml-px text-electric">|</span>
        ) : null}
      </span>
    </>
  );
}

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

type Props = {
  state: GeneratorState;
};

/**
 * Generator input panel. The outer fieldset/legend was removed in favor
 * of a plain card — the section heading on the parent already labels
 * the surface, and stripping the floating legend cuts visual debt next
 * to the Live Preview pane sitting alongside.
 */
export function GeneratorInputs({ state }: Props) {
  return (
    <section
      aria-label="Configure font"
      className="flex flex-col gap-5 border border-charcoal-line/60 rounded-lg p-5 bg-paper shadow-card"
    >
      <label className="flex flex-col gap-2 text-sm font-medium">
        <span>Custom font name</span>
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          value={state.fontName}
          onChange={(e) => state.setFontName(e.target.value)}
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
          <span aria-hidden className="text-charcoal-line/60">·</span>
          <span>
            Becomes the @font-face{" "}
            <code className="font-mono">font-family</code>
          </span>
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
                {WEIGHT_LABEL[w]}
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
    </section>
  );
}

/**
 * 14×14px check icon. Rendered conditionally so unchecked toggles
 * don't show a half-transparent placeholder. Width slot is reserved
 * via a 14px-wide span on the unchecked path so toggling doesn't shift
 * the label.
 */
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
        "min-h-[var(--spacing-touch)] min-w-[var(--spacing-touch)] px-4 rounded-md border text-sm font-medium transition-colors inline-flex items-center gap-2 " +
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
