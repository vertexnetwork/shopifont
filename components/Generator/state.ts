"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildCssVariableOverrides,
  buildFontFaceCss,
  buildSettingsSchemaJson,
  type FontFormat,
  type FontStyle,
  type FontWeight,
  type GeneratorInput,
  FORMAT_ORDER,
  VALID_WEIGHTS,
} from "@/lib/generators";

/**
 * Stable identifiers for the three generated code blocks. Used to
 * sequence the primary/secondary CTA visual hierarchy and to mark each
 * block as copied so the generator can guide the user one paste at a
 * time instead of presenting three identical-priority Copy buttons.
 */
export type CopyTarget = "fontFace" | "settings" | "cssVars";

export const COPY_ORDER: ReadonlyArray<CopyTarget> = [
  "fontFace",
  "settings",
  "cssVars",
];

export type GeneratorState = {
  fontName: string;
  setFontName: (v: string) => void;
  formats: FontFormat[];
  toggleFormat: (f: FontFormat) => void;
  weight: FontWeight;
  setWeight: (w: FontWeight) => void;
  style: FontStyle;
  setStyle: (s: FontStyle) => void;
  applyToHeading: boolean;
  setApplyToHeading: (v: boolean) => void;
  applyToBody: boolean;
  setApplyToBody: (v: boolean) => void;
  additionalWeights: FontWeight[];
  addWeight: (w: FontWeight) => void;
  removeWeight: (w: FontWeight) => void;
  /** Snapshot of the current input for downstream generators. */
  input: GeneratorInput;
  fontFaceCss: string;
  settingsSchemaJson: string;
  cssVariableOverrides: string;
  /**
   * Surface-level validation. Each warning is a short, actionable line we
   * render at the top of the relevant code block AND use to gate the
   * Copy button so users never paste a degenerate snippet.
   */
  warnings: {
    fontFace: string | null;
    settings: string | null;
    cssVars: string | null;
  };
  /** Steps the user has successfully copied this session. */
  copiedSteps: ReadonlySet<CopyTarget>;
  markCopied: (id: CopyTarget) => void;
};

const DEFAULT_FONT_NAME = "My Brand Sans";
const DEFAULT_FORMATS: FontFormat[] = ["woff2"];
const DEFAULT_WEIGHT: FontWeight = 400;
const DEFAULT_STYLE: FontStyle = "normal";

export type GeneratorOptions = {
  /**
   * When false, the hook skips reading + writing
   * `window.location.search`. Set this in non-page contexts where the
   * URL belongs to someone else: the iframe `/embed` route (host page
   * owns the URL) and the Chrome extension popup (popup URL is
   * transient and rewriting it is meaningless). Default true keeps the
   * existing share-the-config behavior on the homepage and pSEO pages.
   */
  syncToUrl?: boolean;
};

export function useGenerator(opts: GeneratorOptions = {}): GeneratorState {
  const syncToUrl = opts.syncToUrl ?? true;
  const [fontName, setFontName] = useState<string>(DEFAULT_FONT_NAME);
  const [formats, setFormats] = useState<FontFormat[]>([...DEFAULT_FORMATS]);
  const [weight, setWeight] = useState<FontWeight>(DEFAULT_WEIGHT);
  const [style, setStyle] = useState<FontStyle>(DEFAULT_STYLE);
  const [applyToHeading, setApplyToHeading] = useState<boolean>(true);
  const [applyToBody, setApplyToBody] = useState<boolean>(true);
  const [additionalWeights, setAdditionalWeights] = useState<FontWeight[]>([]);
  const [copiedSteps, setCopiedSteps] = useState<ReadonlySet<CopyTarget>>(
    () => new Set(),
  );
  const hydratedFromUrl = useRef(false);

  // Hydrate from URL on first mount only. Static export means SSR can't
  // see the search string, so we read it client-side and apply.
  // Skipped when syncToUrl is false (embed iframe, extension popup).
  useEffect(() => {
    if (!syncToUrl) {
      hydratedFromUrl.current = true;
      return;
    }
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const f = p.get("font");
    if (f && f.trim().length > 0) setFontName(f);

    const fmtRaw = p.get("formats");
    if (fmtRaw) {
      const valid = fmtRaw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s): s is FontFormat =>
          FORMAT_ORDER.includes(s as FontFormat),
        );
      if (valid.length > 0) setFormats(valid);
    }

    const w = Number(p.get("weight"));
    if (VALID_WEIGHTS.includes(w as FontWeight)) setWeight(w as FontWeight);

    const s = p.get("style");
    if (s === "italic" || s === "normal") setStyle(s);

    const apply = p.get("apply");
    if (apply === "heading") {
      setApplyToHeading(true);
      setApplyToBody(false);
    } else if (apply === "body") {
      setApplyToHeading(false);
      setApplyToBody(true);
    } else if (apply === "both") {
      setApplyToHeading(true);
      setApplyToBody(true);
    }

    const extraRaw = p.get("weights");
    if (extraRaw) {
      const validExtras = extraRaw
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n): n is FontWeight =>
          VALID_WEIGHTS.includes(n as FontWeight),
        );
      if (validExtras.length > 0) {
        const seen = new Set<FontWeight>();
        const deduped: FontWeight[] = [];
        for (const v of validExtras) {
          if (!seen.has(v)) {
            seen.add(v);
            deduped.push(v);
          }
        }
        setAdditionalWeights(deduped);
      }
    }

    hydratedFromUrl.current = true;
  }, [syncToUrl]);

  // Sync state to URL after hydration so a user can copy the address
  // bar (or click Share) and return / forward the same configuration.
  // Skipped when syncToUrl is false — see GeneratorOptions.
  useEffect(() => {
    if (!syncToUrl) return;
    if (typeof window === "undefined") return;
    if (!hydratedFromUrl.current) return;
    const p = new URLSearchParams();
    if (fontName !== DEFAULT_FONT_NAME) p.set("font", fontName);
    if (
      !(formats.length === 1 && formats[0] === "woff2") &&
      formats.length > 0
    ) {
      p.set("formats", formats.join(","));
    }
    if (weight !== DEFAULT_WEIGHT) p.set("weight", String(weight));
    if (style !== DEFAULT_STYLE) p.set("style", style);
    const applyKey =
      applyToHeading && applyToBody
        ? null
        : applyToHeading
          ? "heading"
          : applyToBody
            ? "body"
            : "none";
    if (applyKey) p.set("apply", applyKey);
    if (additionalWeights.length > 0) {
      p.set("weights", additionalWeights.join(","));
    }

    const search = p.toString();
    const url = new URL(window.location.href);
    url.search = search;
    window.history.replaceState({}, "", url.toString());
  }, [
    syncToUrl,
    fontName,
    formats,
    weight,
    style,
    applyToHeading,
    applyToBody,
    additionalWeights,
  ]);

  const toggleFormat = useCallback((f: FontFormat) => {
    setFormats((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  }, []);

  const setWeightSafe = useCallback((w: FontWeight) => {
    if (VALID_WEIGHTS.includes(w)) setWeight(w);
  }, []);

  const addWeight = useCallback(
    (w: FontWeight) => {
      if (!VALID_WEIGHTS.includes(w)) return;
      // Don't allow adding the primary weight as a duplicate.
      if (w === weight) return;
      setAdditionalWeights((prev) => (prev.includes(w) ? prev : [...prev, w]));
    },
    [weight],
  );

  const removeWeight = useCallback((w: FontWeight) => {
    setAdditionalWeights((prev) => prev.filter((x) => x !== w));
  }, []);

  const markCopied = useCallback((id: CopyTarget) => {
    setCopiedSteps((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const input = useMemo<GeneratorInput>(() => {
    const applyTo: Array<"heading" | "body"> = [];
    if (applyToHeading) applyTo.push("heading");
    if (applyToBody) applyTo.push("body");
    return {
      fontName,
      formats,
      weight,
      style,
      applyTo,
      additionalWeights:
        additionalWeights.length > 0 ? additionalWeights : undefined,
    };
  }, [
    fontName,
    formats,
    weight,
    style,
    applyToHeading,
    applyToBody,
    additionalWeights,
  ]);

  const fontFaceCss = useMemo(() => buildFontFaceCss(input), [input]);
  const settingsSchemaJson = useMemo(
    () => buildSettingsSchemaJson(input),
    [input],
  );
  const cssVariableOverrides = useMemo(
    () => buildCssVariableOverrides(input),
    [input],
  );

  const warnings = useMemo(() => {
    const trimmedName = fontName.trim();
    const noName = trimmedName.length === 0
      ? "Enter a font name above to generate this block."
      : null;
    const noFormats = formats.length === 0
      ? "Pick at least one format above — without WOFF2 the @font-face block won't load any file."
      : null;
    const noApply = !applyToHeading && !applyToBody
      ? "Select Headings or Body above so the override has a target."
      : null;
    return {
      fontFace: noName ?? noFormats,
      settings: noName,
      cssVars: noName ?? noApply,
    };
  }, [fontName, formats, applyToHeading, applyToBody]);

  return {
    fontName,
    setFontName,
    formats,
    toggleFormat,
    weight,
    setWeight: setWeightSafe,
    style,
    setStyle,
    applyToHeading,
    setApplyToHeading,
    applyToBody,
    setApplyToBody,
    additionalWeights,
    addWeight,
    removeWeight,
    input,
    fontFaceCss,
    settingsSchemaJson,
    cssVariableOverrides,
    warnings,
    copiedSteps,
    markCopied,
  };
}

/**
 * Variant for a given step's primary action.
 *  - "primary"   — fill with brand-blue, the next thing the user should do
 *  - "secondary" — outlined, available but not primary
 *  - "done"      — already copied this session; muted but still re-copyable
 */
export function variantFor(
  id: CopyTarget,
  copiedSteps: ReadonlySet<CopyTarget>,
): "primary" | "secondary" | "done" {
  if (copiedSteps.has(id)) return "done";
  const idx = COPY_ORDER.indexOf(id);
  if (idx <= 0) return "primary";
  return copiedSteps.has(COPY_ORDER[idx - 1]!) ? "primary" : "secondary";
}
