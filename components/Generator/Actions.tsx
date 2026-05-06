"use client";

import { useEffect, useState } from "react";
import type { GeneratorState } from "./state";

/**
 * Share + Download-All actions row. The share button copies the
 * current URL (which the state hook has already synced with the
 * configuration). Download-All triggers three sequential file
 * downloads — browsers ask permission for the second and third on
 * first use, which is acceptable in exchange for not adding ~80 KB of
 * JSZip to the bundle.
 */
export function GeneratorActions({ state }: { state: GeneratorState }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ShareLinkButton />
      <DownloadAllButton state={state} />
    </div>
  );
}

function ShareLinkButton() {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const onShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        legacyCopy(url);
      }
      setCopied(true);
    } catch {
      // Clipboard blocked — fall back to a hidden textarea select.
      legacyCopy(url);
      setCopied(true);
    }
  };

  return (
    <button
      type="button"
      onClick={onShare}
      className={
        "inline-flex items-center gap-1.5 min-h-[2.25rem] px-3 rounded-md border text-xs font-medium transition-colors " +
        (copied
          ? "bg-electric text-paper border-electric shopifont-pulse"
          : "bg-paper text-charcoal border-charcoal-line/50 hover:border-electric hover:text-electric")
      }
    >
      <ShareIcon />
      {copied ? "Link copied" : "Share this config"}
    </button>
  );
}

function DownloadAllButton({ state }: { state: GeneratorState }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1800);
    return () => clearTimeout(t);
  }, [done]);

  const blocked =
    Boolean(state.warnings.fontFace) ||
    Boolean(state.warnings.settings) ||
    Boolean(state.warnings.cssVars);

  const onDownload = () => {
    if (blocked) return;
    downloadFile("font-face.css", state.fontFaceCss, "text/css");
    downloadFile(
      "settings_schema.json",
      state.settingsSchemaJson,
      "application/json",
    );
    downloadFile(
      "css-variables.css",
      state.cssVariableOverrides,
      "text/css",
    );
    setDone(true);
  };

  return (
    <button
      type="button"
      onClick={onDownload}
      disabled={blocked}
      title={blocked ? "Resolve the warnings above before downloading" : undefined}
      className={
        "inline-flex items-center gap-1.5 min-h-[2.25rem] px-3 rounded-md border text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed " +
        (done
          ? "bg-electric text-paper border-electric shopifont-pulse"
          : "bg-paper text-charcoal border-charcoal-line/50 hover:border-electric hover:text-electric")
      }
    >
      <DownloadIcon />
      {done ? "Downloaded ✓" : "Download all 3 files"}
    </button>
  );
}

function downloadFile(filename: string, content: string, type: string) {
  if (typeof window === "undefined" || content.trim().length === 0) return;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function legacyCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}

function ShareIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 9L11 6M5 7L11 10" />
      <circle cx="3.5" cy="8" r="1.6" />
      <circle cx="12.5" cy="4.5" r="1.6" />
      <circle cx="12.5" cy="11.5" r="1.6" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v8M4.5 7L8 10.5 11.5 7M3 13h10" />
    </svg>
  );
}
