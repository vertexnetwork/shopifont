import { useCallback, useEffect, useRef, useState } from "react";
import type { GeneratorState } from "@/components/Generator/state";

const DEFAULT_SAMPLE_TEXT = "The quick brown fox 0123";

/**
 * Popup-tight live preview. Same FontFace + blob-URL pattern as the
 * website's <GeneratorPreview>, but stripped to one row of sample text
 * and a button-driven file picker — no drag-drop zone, no sample text
 * switcher, no error block taking 40 px when no error exists.
 *
 * The dropped file stays in popup memory: blob URL only, registered
 * via FontFace into document.fonts, revoked on unmount. The popup
 * lifetime is short (closes when the user clicks elsewhere) so the
 * cleanup is mostly belt-and-suspenders, but it matches the website's
 * "no upload" promise and keeps the privacy story consistent.
 */
export function CompactPreview({ state }: { state: GeneratorState }) {
  const [previewFamily, setPreviewFamily] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [sampleText, setSampleText] = useState<string>(DEFAULT_SAMPLE_TEXT);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Free the blob URL when the popup unmounts (or when the user
  // replaces the file with a fresh upload).
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // Probe document.fonts for a locally-installed copy of the typed
  // name. Re-runs on every fontName change. If the name resolves
  // locally we hide the "not installed" badge — the system rendering
  // is already a useful preview.
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
      setInstalled(document.fonts.check(`12px "${name}"`));
    } catch {
      setInstalled(null);
    }
  }, [state.fontName, previewFamily]);

  const loadFont = useCallback(
    async (file: File) => {
      setError(null);
      const safeName = file.name.replace(/[^a-zA-Z0-9_-]/g, "_");
      const family = `__shopifont_popup_${safeName}_${Date.now()}`;
      try {
        const buffer = await file.arrayBuffer();
        const face = new FontFace(family, buffer, {
          weight: String(state.weight),
          style: state.style,
          display: "swap",
        });
        await face.load();
        document.fonts.add(face);
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = URL.createObjectURL(file);
        setPreviewFamily(family);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not decode the file. Confirm it's a valid WOFF2/WOFF/TTF.",
        );
      }
    },
    [state.weight, state.style],
  );

  const onPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void loadFont(file);
    },
    [loadFont],
  );

  const renderedFamily =
    previewFamily ?? (state.fontName.trim() || "system-ui");
  const showNotInstalled =
    !previewFamily &&
    installed === false &&
    state.fontName.trim().length > 0;

  return (
    <section
      aria-labelledby="popup-preview-heading"
      className="rounded-md border border-charcoal-line/30 bg-paper-dim/40 p-2.5 flex flex-col gap-1.5"
    >
      <div className="flex items-center justify-between gap-2">
        <p
          id="popup-preview-heading"
          className="text-xs font-medium text-muted"
        >
          Live preview
        </p>
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
          className="text-[11px] font-medium text-muted hover:text-electric"
        >
          {previewFamily ? "Replace file" : "Upload file"}
        </button>
      </div>

      <p
        className="text-base leading-snug truncate"
        style={{
          fontFamily: `"${renderedFamily}", system-ui, sans-serif`,
          fontWeight: state.weight,
          fontStyle: state.style,
          fontFeatureSettings: '"kern", "liga"',
        }}
      >
        {sampleText || DEFAULT_SAMPLE_TEXT}
      </p>

      <input
        type="text"
        value={sampleText}
        onChange={(e) => setSampleText(e.target.value)}
        onFocus={(e) => {
          if (e.currentTarget.value === DEFAULT_SAMPLE_TEXT) {
            e.currentTarget.select();
          }
        }}
        maxLength={120}
        spellCheck={false}
        aria-label="Preview text"
        placeholder={DEFAULT_SAMPLE_TEXT}
        className="w-full h-7 px-2 rounded border border-charcoal-line/30 bg-paper text-charcoal text-[11px] placeholder:text-muted focus:border-electric"
      />

      {showNotInstalled ? (
        <p
          className="text-[10px] leading-tight"
          style={{ color: "var(--color-warn)" }}
        >
          Not installed locally — generated code is correct, drop a file to
          preview the actual face.
        </p>
      ) : error ? (
        <p
          className="text-[10px] leading-tight"
          role="alert"
          style={{ color: "var(--color-error)" }}
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
