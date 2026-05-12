"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GeneratorState } from "./state";

const SAMPLE_OPTIONS = [
  {
    id: "storefront",
    label: "Storefront",
    text: "Add to cart · Free shipping · 30-day returns",
    headingText: "Limited Edition Drop",
  },
  {
    id: "headings",
    label: "Headings",
    text: "Limited Edition Drop — Now Shipping",
    headingText: "Limited Edition Drop — Now Shipping",
  },
  {
    id: "body",
    label: "Body copy",
    text: "Hand-finished in small batches. Designed to last for years, not seasons. Free returns within 30 days, no questions asked.",
    headingText: "Designed to last",
  },
  {
    id: "pangram",
    label: "Pangram",
    text: "The quick brown fox jumps over the lazy dog 0123456789",
    headingText: "The quick brown fox",
  },
  {
    id: "custom",
    label: "Custom",
    text: "",
    headingText: "",
  },
] as const;

type SampleOption = (typeof SAMPLE_OPTIONS)[number];
type SampleId = SampleOption["id"];

const DEFAULT_CUSTOM_TEXT =
  "Type any text here — your real product names, headlines, or a multilingual sample. The preview updates live.";

const FACE_LABEL_WORDS: Record<number, string> = {
  100: "Thin",
  200: "Extra Light",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semi Bold",
  700: "Bold",
  800: "Extra Bold",
  900: "Black",
};

function faceShortLabel(weight: number, style: string): string {
  const word = FACE_LABEL_WORDS[weight] ?? `${weight}`;
  return style === "italic" ? `${word} Italic` : word;
}

export function GeneratorPreview({ state }: { state: GeneratorState }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewFamily, setPreviewFamily] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sampleId, setSampleId] = useState<SampleId>("storefront");
  const [customText, setCustomText] = useState<string>(DEFAULT_CUSTOM_TEXT);
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [showNotInstalledBadge, setShowNotInstalledBadge] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const primaryFamilyName = state.input.primary.name;
  const primaryFaces = state.input.primary.faces;
  const isMultiFace = primaryFaces.length > 1;
  const isSpecimen = state.previewSecondary !== null;

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    const apply = () => setIsTouch(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    if (previewFamily) {
      setInstalled(null);
      return;
    }
    if (typeof document === "undefined" || !document.fonts?.check) return;
    const name = primaryFamilyName.trim();
    if (!name) {
      setInstalled(null);
      return;
    }
    try {
      const ok = document.fonts.check(`12px "${name}"`);
      setInstalled(ok);
    } catch {
      setInstalled(null);
    }
  }, [primaryFamilyName, previewFamily]);

  useEffect(() => {
    const shouldShow =
      !previewFamily &&
      installed === false &&
      primaryFamilyName.trim().length > 0;
    if (!shouldShow) {
      setShowNotInstalledBadge(false);
      return;
    }
    const t = setTimeout(() => setShowNotInstalledBadge(true), 120);
    return () => clearTimeout(t);
  }, [installed, previewFamily, primaryFamilyName]);

  const loadFont = useCallback(
    async (file: File) => {
      setError(null);
      const safeName = file.name.replace(/[^a-zA-Z0-9_-]/g, "_");
      const family = `__shopifont_preview_${safeName}_${Date.now()}`;
      try {
        const buffer = await file.arrayBuffer();
        const face = new FontFace(family, buffer, {
          weight: String(state.previewWeight),
          style: state.previewStyle,
          display: "swap",
        });
        await face.load();
        document.fonts.add(face);
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }
        objectUrlRef.current = URL.createObjectURL(file);
        setPreviewFamily(family);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not decode the font file. Confirm it's a valid WOFF2/WOFF/TTF.",
        );
      }
    },
    [state.previewWeight, state.previewStyle],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) void loadFont(file);
    },
    [loadFont],
  );

  const onPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void loadFont(file);
    },
    [loadFont],
  );

  // Renders the primary body face. When a dropped file is loaded, we
  // render in that uploaded family; otherwise the user's typed font
  // name + system fallback.
  const renderedBodyFamily = previewFamily ?? primaryFamilyName ?? "system-ui";
  const renderedHeadingFamily = state.previewSecondary?.name ?? renderedBodyFamily;

  const bodyStyle = useMemo<React.CSSProperties>(() => {
    const base: React.CSSProperties = {
      fontFamily: `"${renderedBodyFamily}", system-ui, sans-serif`,
      fontWeight: state.previewWeight,
      fontStyle: state.previewStyle,
      fontFeatureSettings: state.previewFeatureSettings ?? '"kern", "liga"',
    };
    if (state.previewVariationSettings) {
      base.fontVariationSettings = state.previewVariationSettings;
    }
    return base;
  }, [
    renderedBodyFamily,
    state.previewWeight,
    state.previewStyle,
    state.previewVariationSettings,
    state.previewFeatureSettings,
  ]);

  const headingStyle = useMemo<React.CSSProperties>(() => {
    const sec = state.previewSecondary;
    if (!sec) return bodyStyle;
    const base: React.CSSProperties = {
      fontFamily: `"${renderedHeadingFamily}", serif`,
      fontWeight: sec.weight,
      fontStyle: sec.style,
      fontFeatureSettings: sec.featureSettings ?? '"kern", "liga"',
    };
    if (sec.variationSettings) {
      base.fontVariationSettings = sec.variationSettings;
    }
    return base;
  }, [state.previewSecondary, renderedHeadingFamily, bodyStyle]);

  const sample = sampleTextFor(sampleId);
  const headingSample =
    sampleId === "custom" ? customText.slice(0, 40) : sample.headingText;
  const bodySample = sampleId === "custom" ? customText : sample.text;

  return (
    <section
      aria-labelledby="preview-heading"
      className="flex flex-col gap-3 border border-charcoal-line/60 rounded-lg p-5 bg-paper shadow-card"
      style={{ minHeight: "var(--preview-min-h)" }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3
          id="preview-heading"
          className="text-sm font-medium uppercase tracking-wide text-muted"
        >
          Live preview
        </h3>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf"
            onChange={onPick}
            className="sr-only"
            aria-label="Upload a font file for live preview"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[var(--spacing-touch)] px-3 rounded-md border border-charcoal-line/60 text-xs hover:border-electric"
          >
            {isTouch ? "Choose file" : "Upload file"}
          </button>
        </div>
      </div>

      {/* Face selector — only when the primary family has more than one
          face. Lets the user preview Bold / Italic / etc. without having
          to also change the primary face's weight & style. */}
      {isMultiFace && !isSpecimen ? (
        <div
          role="radiogroup"
          aria-label="Preview face"
          className="flex flex-wrap gap-1.5"
        >
          {primaryFaces.map((face, idx) => {
            const active = idx === state.selectedFaceIdx;
            return (
              <button
                key={idx}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => state.setSelectedFaceIdx(idx)}
                className={
                  "min-h-[2rem] px-2.5 rounded-full text-[11px] font-medium transition-colors border " +
                  (active
                    ? "bg-charcoal text-paper border-charcoal"
                    : "bg-paper text-muted border-charcoal-line/40 hover:border-electric hover:text-electric")
                }
              >
                {faceShortLabel(face.weight, face.style)}
              </button>
            );
          })}
        </div>
      ) : null}

      <div
        onDragOver={
          isTouch
            ? undefined
            : (e) => {
                e.preventDefault();
                setIsDragOver(true);
              }
        }
        onDragLeave={isTouch ? undefined : () => setIsDragOver(false)}
        onDrop={isTouch ? undefined : onDrop}
        onClick={isTouch ? () => fileInputRef.current?.click() : undefined}
        role={isTouch ? "button" : undefined}
        tabIndex={isTouch ? 0 : undefined}
        onKeyDown={
          isTouch
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }
            : undefined
        }
        className={
          "rounded-md p-4 transition-colors ring-1 ring-inset " +
          (isDragOver
            ? "ring-2 ring-electric bg-electric/5"
            : "ring-charcoal-line/30 bg-paper-dim/40 hover:ring-charcoal-line/50") +
          (isTouch ? " cursor-pointer" : "")
        }
      >
        {isSpecimen ? (
          <div className="flex flex-col gap-2">
            <p
              className="text-2xl sm:text-3xl leading-tight tracking-tight break-words"
              style={headingStyle}
            >
              {headingSample || sample.headingText}
            </p>
            <p
              className="text-base sm:text-lg leading-snug break-words"
              style={bodyStyle}
            >
              {bodySample}
            </p>
            <p className="text-[10px] text-muted flex flex-wrap gap-3 mt-1">
              <span>
                <strong>Heading:</strong>{" "}
                {state.previewSecondary?.name ?? "—"}
              </span>
              <span>
                <strong>Body:</strong> {primaryFamilyName}
              </span>
            </p>
          </div>
        ) : (
          <p
            className="text-xl sm:text-2xl leading-snug break-words"
            style={bodyStyle}
          >
            {bodySample}
          </p>
        )}

        <SampleChipStrip sampleId={sampleId} onSelect={setSampleId} />

        {sampleId === "custom" ? (
          <label className="mt-3 flex flex-col gap-1.5 text-xs">
            <span className="sr-only">Custom preview text</span>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onFocus={(e) => {
                if (e.currentTarget.value === DEFAULT_CUSTOM_TEXT) {
                  e.currentTarget.select();
                }
              }}
              rows={2}
              maxLength={500}
              spellCheck={false}
              className="w-full px-3 py-2 rounded-md border border-charcoal-line/60 bg-paper text-charcoal text-sm placeholder:text-muted focus:border-electric resize-y"
              placeholder="Your custom preview text…"
              aria-label="Custom preview text"
            />
            <span className="text-muted">
              Edits live above. Switch chips to compare against the presets — your text is preserved.
            </span>
          </label>
        ) : null}

        {/* Active-rendering hints — surface the most opaque CSS state so
            users can verify their controls are reaching the preview. */}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted font-mono">
          {state.input.primary.isVariable && state.previewVariationSettings ? (
            <span>
              <span className="text-charcoal/70">variation:</span>{" "}
              {state.previewVariationSettings}
            </span>
          ) : null}
          {state.previewFeatureSettings ? (
            <span>
              <span className="text-charcoal/70">features:</span>{" "}
              {state.previewFeatureSettings}
            </span>
          ) : null}
        </div>

        {!previewFamily ? (
          <p className="mt-3 text-xs text-muted">
            {isTouch
              ? "Tap here to choose a WOFF2 / WOFF / TTF file. The file stays in your browser — nothing is uploaded."
              : "Drop a WOFF2 / WOFF / TTF file here to preview your actual font. The file stays in your browser — nothing is uploaded."}
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted">
            Previewing locally-loaded font. Refresh to clear.
          </p>
        )}
        {showNotInstalledBadge ? (
          <p
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-paper-dim px-2 py-1 text-xs"
            style={{ color: "var(--color-warn)" }}
          >
            <span aria-hidden>!</span>
            <span>
              &ldquo;{primaryFamilyName}&rdquo; isn&apos;t installed on this
              device. Generated code is still correct — drop a file above to
              preview the actual face.
            </span>
          </p>
        ) : null}
        {error ? (
          <p
            className="mt-3 text-xs"
            role="alert"
            style={{ color: "var(--color-error)" }}
          >
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function sampleTextFor(id: SampleId): SampleOption {
  return SAMPLE_OPTIONS.find((o) => o.id === id) ?? SAMPLE_OPTIONS[0];
}

function SampleChipStrip({
  sampleId,
  onSelect,
}: {
  sampleId: SampleId;
  onSelect: (id: SampleId) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Sample text"
      className="mt-3 flex flex-wrap gap-1.5"
    >
      {SAMPLE_OPTIONS.map((o) => {
        const active = o.id === sampleId;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(o.id)}
            className={
              "min-h-[2rem] px-2.5 rounded-full text-[11px] font-medium transition-colors border " +
              (active
                ? "bg-charcoal text-paper border-charcoal"
                : "bg-paper text-muted border-charcoal-line/40 hover:border-electric hover:text-electric")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
