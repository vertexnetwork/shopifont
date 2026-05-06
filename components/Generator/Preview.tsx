"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GeneratorState } from "./state";

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog 0123456789";

/**
 * Live preview pane. Drag-and-drop a font file (WOFF2/WOFF/TTF) to
 * register a FontFace into `document.fonts`, then render sample copy in
 * that face. The file is held only as a blob URL — never uploaded.
 *
 * If no file has been dropped, we render the sample in the current
 * `fontName` directly. The browser will use its installed copy if one
 * exists, otherwise the system fallback — which is itself a useful
 * preview because it shows the metric box your users would see while
 * the WOFF2 is in flight.
 */
export function GeneratorPreview({ state }: { state: GeneratorState }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewFamily, setPreviewFamily] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Free the blob URL when we replace or unmount.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

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
      className="flex flex-col gap-3 border border-charcoal-line/60 rounded-lg p-5 bg-paper"
      style={{ minHeight: "var(--preview-min-h)" }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 id="preview-heading" className="text-sm font-medium uppercase tracking-wide text-muted">
          Live preview
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted">
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
            Upload file
          </button>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        className={
          "rounded-md border-2 border-dashed p-4 transition-colors " +
          (isDragOver
            ? "border-electric bg-electric/5"
            : "border-charcoal-line/40")
        }
      >
        <p
          className="text-xl sm:text-2xl leading-snug break-words"
          style={{
            fontFamily: previewFamily
              ? `"${renderedFamily}", system-ui, sans-serif`
              : `"${renderedFamily}", system-ui, sans-serif`,
            fontWeight: state.weight,
            fontStyle: state.style,
          }}
        >
          {SAMPLE_TEXT}
        </p>
        {!previewFamily ? (
          <p className="mt-3 text-xs text-muted">
            Drop a WOFF2 / WOFF / TTF file here to preview your actual font.
            The file stays in your browser — nothing is uploaded.
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted">
            Previewing locally-loaded font. Refresh to clear.
          </p>
        )}
        {error ? (
          <p className="mt-3 text-xs text-electric" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
