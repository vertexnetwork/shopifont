"use client";

import { useCallback, useMemo, useState } from "react";
import {
  buildCssVariableOverrides,
  buildFontFaceCss,
  buildSettingsSchemaJson,
  type FontFormat,
  type FontStyle,
  type FontWeight,
  type GeneratorInput,
  VALID_WEIGHTS,
} from "@/lib/generators";

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
  /** Snapshot of the current input for downstream generators. */
  input: GeneratorInput;
  fontFaceCss: string;
  settingsSchemaJson: string;
  cssVariableOverrides: string;
};

const DEFAULT_FONT_NAME = "My Brand Sans";
const DEFAULT_FORMATS: FontFormat[] = ["woff2"];
const DEFAULT_WEIGHT: FontWeight = 400;
const DEFAULT_STYLE: FontStyle = "normal";

export function useGenerator(): GeneratorState {
  const [fontName, setFontName] = useState<string>(DEFAULT_FONT_NAME);
  const [formats, setFormats] = useState<FontFormat[]>([...DEFAULT_FORMATS]);
  const [weight, setWeight] = useState<FontWeight>(DEFAULT_WEIGHT);
  const [style, setStyle] = useState<FontStyle>(DEFAULT_STYLE);
  const [applyToHeading, setApplyToHeading] = useState<boolean>(true);
  const [applyToBody, setApplyToBody] = useState<boolean>(true);

  const toggleFormat = useCallback((f: FontFormat) => {
    setFormats((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  }, []);

  const setWeightSafe = useCallback((w: FontWeight) => {
    if (VALID_WEIGHTS.includes(w)) setWeight(w);
  }, []);

  const input = useMemo<GeneratorInput>(() => {
    const applyTo: Array<"heading" | "body"> = [];
    if (applyToHeading) applyTo.push("heading");
    if (applyToBody) applyTo.push("body");
    return { fontName, formats, weight, style, applyTo };
  }, [fontName, formats, weight, style, applyToHeading, applyToBody]);

  const fontFaceCss = useMemo(() => buildFontFaceCss(input), [input]);
  const settingsSchemaJson = useMemo(
    () => buildSettingsSchemaJson(input),
    [input],
  );
  const cssVariableOverrides = useMemo(
    () => buildCssVariableOverrides(input),
    [input],
  );

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
    input,
    fontFaceCss,
    settingsSchemaJson,
    cssVariableOverrides,
  };
}
