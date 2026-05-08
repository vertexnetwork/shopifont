"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GeneratorState } from "./state";

const SAMPLE_OPTIONS = [
  {
    id: "storefront",
    label: "Storefront",
    text: "Add to cart · Free shipping · 30-day returns",
  },
  {
    id: "headings",
    label: "Headings",
    text: "Limited Edition Drop — Now Shipping",
  },
  {
    id: "body",
    label: "Body copy",
    text: "Hand-finished in small batches. Designed to last for years, not seasons. Free returns within 30 days, no questions asked.",
  },
  {
    id: "pangram",
    label: "Pangram",
    text: "The quick brown fox jumps over the lazy dog 0123456789",
  },
  {
    id: "custom",
    label: "Custom",
    text: "",
  },
] as const;

type SampleId = (typeof SAMPLE_OPTIONS)[number]["id"];

const DEFAULT_CUSTOM_TEXT =
  "Type any text here — your real product names, headlines, or a multilingual sample. The preview updates live.";

/**
 * Live preview pane. Drag-and-drop a font file (WOFF2/WOFF/TTF) to
 * register a FontFace into `document.fonts`, then render sample copy in
 * that face. The file is held only as a blob URL — never uploaded.
 *
 * If no file has been dropped, we render the sample in the current
 * `fontName` directly. The browser will use its installed copy if one
 * exists, otherwise the system fallback — which is itself a useful
 * preview because it shows the metric box your users would see while
 * the WOFF2 is in flight. We surface a "not installed locally" badge in
 * that case so the user doesn't think the preview is broken; a 120ms
 * delay suppresses the brief flash that would otherwise appear while
 * `document.fonts.check` settles.
 */
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

  // Free the blob URL when we replace or unmount.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // Coarse-pointer detection. Touch devices can't drag-and-drop a file,
  // so we swap the drop-zone copy and remove the misleading instruction.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    const apply = () => setIsTouch(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Probe document.fonts for a locally-installed copy of the typed name.
  // Re-runs when fontName changes; cheap, synchronous, no side effects.
  useEffect(() => {
    if (previewFamily) {
      setInstalled(null);
      return;
    }
    if (typeof document === "undefined" || !document.fonts?.check) return;
    const name = state.fontName.trim();
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
  }, [state.fontName, previewFamily]);

  // Defer the "not installed" badge so the rendered system fallback
  // doesn't visibly flicker between paint and badge appearance.
  useEffect(() => {
    const shouldShow =
      !previewFamily && installed === false && state.fontName.trim().length > 0;
    if (!shouldShow) {
      setShowNotInstalledBadge(false);
      return;
    }
    const t = setTimeout(() => setShowNotInstalledBadge(true), 120);
    return () => clearTimeout(t);
  }, [installed, previewFamily, state.fontName]);

  const loadFont = useCallback(
    async (file: File) => {
      setError(null);
      const safeName = file.name.replace(/[^a-zA-Z0-9_-]/g, "_");
      const family = `__shopifont_preview_${safeName}_${Date.now()}`;
      try {
        const buffer = await file.arrayBuffer();
        const face = new FontFace(family, buffer, {
          weight: String(state.weight),
          style: state.style,
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
    [state.weight, state.style],
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

  const renderedFamily = previewFamily ?? state.fontName ?? "system-ui";

  return (
    <section
      aria-labelledby="preview-heading"
      className="flex flex-col gap-3 border border-charcoal-line/60 rounded-lg p-5 bg-paper shadow-card"
      style={{ minHeight: "var(--preview-min-h)" }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 id="preview-heading" className="text-sm font-medium uppercase tracking-wide text-muted">
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
        <p
          className="text-xl sm:text-2xl leading-snug break-words"
          style={{
            fontFamily: `"${renderedFamily}", system-ui, sans-serif`,
            fontWeight: state.weight,
            fontStyle: state.style,
            fontFeatureSettings: '"kern", "liga"',
          }}
        >
          {sampleId === "custom" ? customText : sampleTextFor(sampleId)}
        </p>

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
              &ldquo;{state.fontName}&rdquo; isn&apos;t installed on this device.
              Generated code is still correct — drop a file above to preview the
              actual face.
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

function sampleTextFor(id: SampleId): string {
  return SAMPLE_OPTIONS.find((o) => o.id === id)?.text ?? SAMPLE_OPTIONS[0].text;
}

function SampleChipStrip({
  sampleId,
  onSelect,
}: {
  sampleId: SampleId;
  onSelect: (id: SampleId) => void;
}) {
  const groupId = useMemo(() => "sample-strip", []);
  return (
    <div
      role="radiogroup"
      aria-label="Sample text"
      id={groupId}
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
