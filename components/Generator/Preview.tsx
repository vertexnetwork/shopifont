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
] as const;

type SampleId = (typeof SAMPLE_OPTIONS)[number]["id"];

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
 * that case so the user doesn't think the preview is broken.
 */
export function GeneratorPreview({ state }: { state: GeneratorState }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewFamily, setPreviewFamily] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sampleId, setSampleId] = useState<SampleId>("storefront");
  const [installed, setInstalled] = useState<boolean | null>(null);
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
  const sampleText = useMemo(
    () =>
      SAMPLE_OPTIONS.find((o) => o.id === sampleId)?.text ?? SAMPLE_OPTIONS[0].text,
    [sampleId],
  );

  const showNotInstalled =
    !previewFamily && installed === false && state.fontName.trim().length > 0;

  return (
    <section
      aria-labelledby="preview-heading"
      className="flex flex-col gap-3 border border-charcoal-line/60 rounded-lg p-5 bg-paper"
      style={{ minHeight: "var(--preview-min-h)" }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 id="preview-heading" className="text-sm font-medium uppercase tracking-wide text-muted">
          Live preview
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted">
          <label className="sr-only" htmlFor="sample-select">
            Sample text
          </label>
          <select
            id="sample-select"
            value={sampleId}
            onChange={(e) => setSampleId(e.target.value as SampleId)}
            className="min-h-[var(--spacing-touch)] px-2 rounded-md border border-charcoal-line/60 bg-paper text-charcoal text-xs"
          >
            {SAMPLE_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
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
            className="min-h-[var(--spacing-touch)] px-3 rounded-md border border-charcoal-line/60 hover:border-electric"
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
          "rounded-md border-2 border-dashed p-4 transition-colors " +
          (isDragOver
            ? "border-electric bg-electric/5"
            : "border-charcoal-line/40") +
          (isTouch ? " cursor-pointer" : "")
        }
      >
        <p
          className="text-xl sm:text-2xl leading-snug break-words"
          style={{
            fontFamily: `"${renderedFamily}", system-ui, sans-serif`,
            fontWeight: state.weight,
            fontStyle: state.style,
          }}
        >
          {sampleText}
        </p>
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
        {showNotInstalled ? (
          <p
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-paper-dim px-2 py-1 text-xs text-warn"
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
