"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buildCssVariableOverrides,
  buildFontFaceCss,
  buildPreloadSnippet,
  buildSettingsSchemaJson,
  FORMAT_ORDER,
  fromSimple,
  VALID_WEIGHTS,
  type FontDisplay,
  type FontFace,
  type FontFamily,
  type FontFormat,
  type FontStyle,
  type FontWeight,
  type GeneratorInput,
  type SimpleGeneratorInput,
  type VariableAxis,
  type WeightRange,
} from "@/lib/generators";

/* ------------------------------------------------------------------ */
/* Defaults                                                            */
/* ------------------------------------------------------------------ */

const DEFAULT_FONT_NAME = "My Brand Sans";
const DEFAULT_FACE: FontFace = {
  weight: 400,
  style: "normal",
  formats: ["woff2"],
};

function defaultPrimary(): FontFamily {
  return {
    name: DEFAULT_FONT_NAME,
    faces: [{ ...DEFAULT_FACE }],
    displayStrategy: "swap",
    isVariable: false,
  };
}

function defaultInput(): GeneratorInput {
  return {
    primary: defaultPrimary(),
    applyTo: ["heading", "body"],
    preloadHints: false,
  };
}

/* ------------------------------------------------------------------ */
/* Copy-target tracking                                                */
/* ------------------------------------------------------------------ */

export type CopyTarget = "fontFace" | "settings" | "cssVars" | "preload";

export const COPY_ORDER: ReadonlyArray<CopyTarget> = [
  "fontFace",
  "settings",
  "cssVars",
  "preload",
];

export type FamilyKey = "primary" | "secondary";
export type FallbackMetricKey =
  | "sizeAdjust"
  | "ascentOverride"
  | "descentOverride"
  | "lineGapOverride";

export type Warnings = {
  fontFace: string | null;
  settings: string | null;
  cssVars: string | null;
  preload: string | null;
};

export type GeneratorState = {
  /** Resolved input passed to the four generators. */
  input: GeneratorInput;

  /* outputs */
  fontFaceCss: string;
  settingsSchemaJson: string;
  cssVariableOverrides: string;
  preloadSnippet: string;

  /* warnings */
  warnings: Warnings;

  /* copy tracking */
  copiedSteps: ReadonlySet<CopyTarget>;
  markCopied: (id: CopyTarget) => void;

  /* primary family setters */
  setPrimaryName: (v: string) => void;
  setPrimaryFileBaseName: (v: string | undefined) => void;
  setPrimaryDisplay: (v: FontDisplay) => void;

  /* secondary family */
  hasSecondary: boolean;
  toggleSecondary: () => void;
  setSecondaryName: (v: string) => void;
  setSecondaryDisplay: (v: FontDisplay) => void;

  /* face manipulation (works on primary or secondary) */
  addFace: (family: FamilyKey, face?: Partial<FontFace>) => void;
  updateFace: (
    family: FamilyKey,
    idx: number,
    patch: Partial<FontFace>,
  ) => void;
  removeFace: (family: FamilyKey, idx: number) => void;
  toggleFormatOnFace: (
    family: FamilyKey,
    idx: number,
    fmt: FontFormat,
  ) => void;

  /* variable fonts (Tier 2) */
  toggleVariable: (family: FamilyKey) => void;
  setWeightRange: (family: FamilyKey, range: WeightRange) => void;
  setAxis: (family: FamilyKey, tag: string, value: number) => void;
  removeAxis: (family: FamilyKey, tag: string) => void;

  /* perf + i18n (Tier 3) */
  setFallbackMetric: (
    family: FamilyKey,
    key: FallbackMetricKey,
    value: string | undefined,
  ) => void;
  setFeatureSettings: (
    family: FamilyKey,
    values: ReadonlyArray<string>,
  ) => void;

  /* applyTo (active when no secondary) */
  applyToHeading: boolean;
  applyToBody: boolean;
  setApplyToHeading: (v: boolean) => void;
  setApplyToBody: (v: boolean) => void;

  /* preload */
  preloadHints: boolean;
  setPreloadHints: (v: boolean) => void;

  /* preview helpers — derived for the Preview.tsx component */
  previewWeight: number;
  previewStyle: FontStyle;
  previewVariationSettings: string | undefined;
};

/* ------------------------------------------------------------------ */
/* URL state codec — rich state lives under `?c=<base64url-JSON>`      */
/* Legacy URLs (?font=, ?weight=, …) hydrate via fromSimple for back-  */
/* compat.                                                             */
/* ------------------------------------------------------------------ */

function isDefaultInput(i: GeneratorInput): boolean {
  if (i.secondary) return false;
  if (i.preloadHints) return false;
  if (!arrayEq(i.applyTo, ["heading", "body"])) return false;
  const p = i.primary;
  if (p.name !== DEFAULT_FONT_NAME) return false;
  if (p.displayStrategy !== "swap") return false;
  if (p.isVariable) return false;
  if (p.fileBaseName) return false;
  if (p.sizeAdjust || p.ascentOverride || p.descentOverride || p.lineGapOverride)
    return false;
  if (p.featureSettings && p.featureSettings.length > 0) return false;
  if (p.faces.length !== 1) return false;
  const f = p.faces[0]!;
  if (f.weight !== DEFAULT_FACE.weight) return false;
  if (f.style !== DEFAULT_FACE.style) return false;
  if (!arrayEq(f.formats, DEFAULT_FACE.formats)) return false;
  if (f.filenameOverride) return false;
  if (f.localNames && f.localNames.length > 0) return false;
  if (f.unicodeRangePreset || f.unicodeRangeCustom) return false;
  return true;
}

function arrayEq<T>(a: ReadonlyArray<T>, b: ReadonlyArray<T>): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function encodeRichState(input: GeneratorInput): string {
  // Compact JSON, then base64url. JSON < 1KB for realistic configs.
  const json = JSON.stringify(input);
  if (typeof window === "undefined") {
    return Buffer.from(json, "utf8").toString("base64url");
  }
  const b64 = window.btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeRichState(raw: string): GeneratorInput | null {
  try {
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "==".slice(0, (4 - (b64.length % 4)) % 4);
    const json =
      typeof window === "undefined"
        ? Buffer.from(padded, "base64").toString("utf8")
        : decodeURIComponent(escape(window.atob(padded)));
    const parsed = JSON.parse(json) as GeneratorInput;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.primary || typeof parsed.primary.name !== "string") return null;
    if (!Array.isArray(parsed.primary.faces)) return null;
    if (!Array.isArray(parsed.applyTo)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function legacyHydrate(p: URLSearchParams): GeneratorInput | null {
  const font = p.get("font")?.trim();
  if (!font) return null;
  const simple: SimpleGeneratorInput = {
    fontName: font,
    formats: ["woff2"],
    weight: 400,
    style: "normal",
  };

  const fmtRaw = p.get("formats");
  if (fmtRaw) {
    const valid = fmtRaw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s): s is FontFormat =>
        FORMAT_ORDER.includes(s as FontFormat),
      );
    if (valid.length > 0) simple.formats = valid;
  }

  const w = Number(p.get("weight"));
  if (VALID_WEIGHTS.includes(w as FontWeight)) simple.weight = w as FontWeight;

  const s = p.get("style");
  if (s === "italic" || s === "normal") simple.style = s;

  const apply = p.get("apply");
  if (apply === "heading") simple.applyTo = ["heading"];
  else if (apply === "body") simple.applyTo = ["body"];
  else if (apply === "both") simple.applyTo = ["heading", "body"];

  const extraRaw = p.get("weights");
  if (extraRaw) {
    const extras = extraRaw
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n): n is FontWeight =>
        VALID_WEIGHTS.includes(n as FontWeight),
      );
    if (extras.length > 0) {
      simple.additionalWeights = Array.from(new Set(extras));
    }
  }

  return fromSimple(simple);
}

/* ------------------------------------------------------------------ */
/* The hook                                                            */
/* ------------------------------------------------------------------ */

export type GeneratorOptions = {
  /**
   * When false, the hook skips reading + writing
   * `window.location.search`. Set this in non-page contexts:
   *   - the iframe `/embed` route (host page owns the URL)
   *   - the Chrome extension popup (popup URL is transient)
   */
  syncToUrl?: boolean;
};

export function useGenerator(opts: GeneratorOptions = {}): GeneratorState {
  const syncToUrl = opts.syncToUrl ?? true;
  const [state, setState] = useState<GeneratorInput>(() => defaultInput());
  const [copiedSteps, setCopiedSteps] = useState<ReadonlySet<CopyTarget>>(
    () => new Set(),
  );
  const hydratedFromUrl = useRef(false);

  /* hydrate from URL ------------------------------------------------ */
  useEffect(() => {
    if (!syncToUrl) {
      hydratedFromUrl.current = true;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const rich = params.get("c");
    if (rich) {
      const decoded = decodeRichState(rich);
      if (decoded) {
        setState(decoded);
        hydratedFromUrl.current = true;
        return;
      }
    }
    const legacy = legacyHydrate(params);
    if (legacy) setState(legacy);
    hydratedFromUrl.current = true;
  }, [syncToUrl]);

  /* write state to URL --------------------------------------------- */
  useEffect(() => {
    if (!syncToUrl) return;
    if (typeof window === "undefined") return;
    if (!hydratedFromUrl.current) return;
    const url = new URL(window.location.href);
    if (isDefaultInput(state)) {
      url.search = "";
    } else {
      const params = new URLSearchParams();
      params.set("c", encodeRichState(state));
      url.search = params.toString();
    }
    window.history.replaceState({}, "", url.toString());
  }, [state, syncToUrl]);

  /* mutators ------------------------------------------------------- */
  const patchFamily = useCallback(
    (key: FamilyKey, patch: (fam: FontFamily) => FontFamily) => {
      setState((prev) => {
        if (key === "primary") return { ...prev, primary: patch(prev.primary) };
        if (!prev.secondary) return prev;
        return { ...prev, secondary: patch(prev.secondary) };
      });
    },
    [],
  );

  const setPrimaryName = useCallback((v: string) => {
    setState((prev) => ({ ...prev, primary: { ...prev.primary, name: v } }));
  }, []);

  const setPrimaryFileBaseName = useCallback((v: string | undefined) => {
    setState((prev) => ({
      ...prev,
      primary: { ...prev.primary, fileBaseName: v?.trim() || undefined },
    }));
  }, []);

  const setPrimaryDisplay = useCallback((v: FontDisplay) => {
    setState((prev) => ({
      ...prev,
      primary: { ...prev.primary, displayStrategy: v },
    }));
  }, []);

  const toggleSecondary = useCallback(() => {
    setState((prev) =>
      prev.secondary
        ? { ...prev, secondary: undefined }
        : {
            ...prev,
            secondary: {
              name: "Heading Font",
              faces: [{ ...DEFAULT_FACE }],
              displayStrategy: "swap",
              isVariable: false,
            },
          },
    );
  }, []);

  const setSecondaryName = useCallback(
    (v: string) =>
      setState((prev) =>
        prev.secondary
          ? { ...prev, secondary: { ...prev.secondary, name: v } }
          : prev,
      ),
    [],
  );

  const setSecondaryDisplay = useCallback(
    (v: FontDisplay) =>
      setState((prev) =>
        prev.secondary
          ? { ...prev, secondary: { ...prev.secondary, displayStrategy: v } }
          : prev,
      ),
    [],
  );

  const addFace = useCallback(
    (family: FamilyKey, face: Partial<FontFace> = {}) => {
      patchFamily(family, (fam) => ({
        ...fam,
        faces: [
          ...fam.faces,
          {
            weight: 400,
            style: "normal",
            formats: ["woff2"],
            ...face,
          } as FontFace,
        ],
      }));
    },
    [patchFamily],
  );

  const updateFace = useCallback(
    (family: FamilyKey, idx: number, patch: Partial<FontFace>) => {
      patchFamily(family, (fam) => {
        const next = fam.faces.slice();
        const current = next[idx];
        if (!current) return fam;
        next[idx] = { ...current, ...patch };
        return { ...fam, faces: next };
      });
    },
    [patchFamily],
  );

  const removeFace = useCallback(
    (family: FamilyKey, idx: number) => {
      patchFamily(family, (fam) => {
        if (fam.faces.length <= 1) return fam; // keep at least one face
        return { ...fam, faces: fam.faces.filter((_, i) => i !== idx) };
      });
    },
    [patchFamily],
  );

  const toggleFormatOnFace = useCallback(
    (family: FamilyKey, idx: number, fmt: FontFormat) => {
      patchFamily(family, (fam) => {
        const next = fam.faces.slice();
        const current = next[idx];
        if (!current) return fam;
        const has = current.formats.includes(fmt);
        next[idx] = {
          ...current,
          formats: has
            ? current.formats.filter((f) => f !== fmt)
            : [...current.formats, fmt],
        };
        return { ...fam, faces: next };
      });
    },
    [patchFamily],
  );

  const toggleVariable = useCallback(
    (family: FamilyKey) => {
      patchFamily(family, (fam) => ({
        ...fam,
        isVariable: !fam.isVariable,
        weightRange: !fam.isVariable
          ? (fam.weightRange ?? [100, 900])
          : fam.weightRange,
        axes: !fam.isVariable
          ? (fam.axes ?? [{ tag: "wght", value: 400 }])
          : fam.axes,
      }));
    },
    [patchFamily],
  );

  const setWeightRange = useCallback(
    (family: FamilyKey, range: WeightRange) => {
      patchFamily(family, (fam) => ({ ...fam, weightRange: range }));
    },
    [patchFamily],
  );

  const setAxis = useCallback(
    (family: FamilyKey, tag: string, value: number) => {
      patchFamily(family, (fam) => {
        const existing = fam.axes ?? [];
        const idx = existing.findIndex((a) => a.tag === tag);
        const next: VariableAxis[] =
          idx === -1
            ? [...existing, { tag, value }]
            : existing.map((a, i) => (i === idx ? { tag, value } : a));
        return { ...fam, axes: next };
      });
    },
    [patchFamily],
  );

  const removeAxis = useCallback(
    (family: FamilyKey, tag: string) => {
      patchFamily(family, (fam) => ({
        ...fam,
        axes: (fam.axes ?? []).filter((a) => a.tag !== tag),
      }));
    },
    [patchFamily],
  );

  const setFallbackMetric = useCallback(
    (family: FamilyKey, key: FallbackMetricKey, value: string | undefined) => {
      patchFamily(family, (fam) => ({
        ...fam,
        [key]: value?.trim() || undefined,
      }));
    },
    [patchFamily],
  );

  const setFeatureSettings = useCallback(
    (family: FamilyKey, values: ReadonlyArray<string>) => {
      patchFamily(family, (fam) => ({
        ...fam,
        featureSettings: values.length > 0 ? values : undefined,
      }));
    },
    [patchFamily],
  );

  const setApplyToHeading = useCallback((v: boolean) => {
    setState((prev) => ({
      ...prev,
      applyTo: applyToFromFlags(v, prev.applyTo.includes("body")),
    }));
  }, []);

  const setApplyToBody = useCallback((v: boolean) => {
    setState((prev) => ({
      ...prev,
      applyTo: applyToFromFlags(prev.applyTo.includes("heading"), v),
    }));
  }, []);

  const setPreloadHints = useCallback((v: boolean) => {
    setState((prev) => ({ ...prev, preloadHints: v }));
  }, []);

  const markCopied = useCallback((id: CopyTarget) => {
    setCopiedSteps((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  /* outputs -------------------------------------------------------- */
  const fontFaceCss = useMemo(() => buildFontFaceCss(state), [state]);
  const settingsSchemaJson = useMemo(
    () => buildSettingsSchemaJson(state),
    [state],
  );
  const cssVariableOverrides = useMemo(
    () => buildCssVariableOverrides(state),
    [state],
  );
  const preloadSnippet = useMemo(() => buildPreloadSnippet(state), [state]);

  const warnings = useMemo<Warnings>(() => {
    const noPrimaryName = !state.primary.name.trim();
    const primaryFirstFace = state.primary.faces[0];
    const noFormatsAnywhere = state.primary.faces.every(
      (f) => f.formats.length === 0,
    );
    const noApply =
      !state.secondary && state.applyTo.length === 0
        ? "Select Headings or Body so the override has a target."
        : null;
    return {
      fontFace: noPrimaryName
        ? "Enter a font name above to generate this block."
        : noFormatsAnywhere
          ? "Pick at least one format on every face — without WOFF2 the block won't load."
          : null,
      settings: noPrimaryName
        ? "Enter a font name above to generate this block."
        : null,
      cssVars: noPrimaryName
        ? "Enter a font name above to generate this block."
        : noApply,
      preload:
        state.preloadHints && !primaryFirstFace
          ? "Add at least one face to emit a preload hint."
          : null,
    };
  }, [state]);

  /* preview helpers ------------------------------------------------ */
  const previewWeight = useMemo<number>(() => {
    if (state.primary.isVariable) {
      const wghtAxis = state.primary.axes?.find((a) => a.tag === "wght");
      return wghtAxis?.value ?? state.primary.weightRange?.[0] ?? 400;
    }
    return state.primary.faces[0]?.weight ?? 400;
  }, [state]);

  const previewStyle = useMemo<FontStyle>(
    () => state.primary.faces[0]?.style ?? "normal",
    [state],
  );

  const previewVariationSettings = useMemo<string | undefined>(() => {
    if (!state.primary.isVariable) return undefined;
    const axes = state.primary.axes ?? [];
    if (axes.length === 0) return undefined;
    return axes.map((a) => `"${a.tag}" ${a.value}`).join(", ");
  }, [state]);

  const applyToHeading = state.applyTo.includes("heading");
  const applyToBody = state.applyTo.includes("body");

  return {
    input: state,
    fontFaceCss,
    settingsSchemaJson,
    cssVariableOverrides,
    preloadSnippet,
    warnings,
    copiedSteps,
    markCopied,
    setPrimaryName,
    setPrimaryFileBaseName,
    setPrimaryDisplay,
    hasSecondary: Boolean(state.secondary),
    toggleSecondary,
    setSecondaryName,
    setSecondaryDisplay,
    addFace,
    updateFace,
    removeFace,
    toggleFormatOnFace,
    toggleVariable,
    setWeightRange,
    setAxis,
    removeAxis,
    setFallbackMetric,
    setFeatureSettings,
    applyToHeading,
    applyToBody,
    setApplyToHeading,
    setApplyToBody,
    preloadHints: state.preloadHints,
    setPreloadHints,
    previewWeight,
    previewStyle,
    previewVariationSettings,
  };
}

function applyToFromFlags(
  heading: boolean,
  body: boolean,
): ReadonlyArray<"heading" | "body"> {
  const out: Array<"heading" | "body"> = [];
  if (heading) out.push("heading");
  if (body) out.push("body");
  return out;
}

/**
 * Visual variant for a given step's primary action.
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
  const prev = COPY_ORDER[idx - 1];
  return prev && copiedSteps.has(prev) ? "primary" : "secondary";
}
