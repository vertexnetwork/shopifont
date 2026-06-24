"use client";

/**
 * The Shopify Typography Audit — the free diagnostic that re-cuts the
 * funnel. Instead of answering "what are good fonts" (the guides do that,
 * for free, completely), it asks four questions about the visitor's OWN
 * store and reveals the specific reason it reads as "just another Shopify
 * store" — then prescribes the exact kit that fixes it.
 *
 * Pure client component, no backend (mirrors the Generator's useState
 * approach). All logic lives in `lib/audit/recommend.ts` so it stays
 * testable; this file is presentation + step flow + analytics only.
 *
 * The result ships DARK-aware: when the kit isn't live
 * (`features.kit.enabled` false) it still delivers the verdict and the
 * free DIY path — never a dead buy button.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { safeTrack } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
import { KitCta } from "@/components/Kit/KitCta";
import {
  buildAuditResult,
  storeTypeLabel,
  FONT_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  STORE_TYPE_OPTIONS,
  THEME_OPTIONS,
  type AuditAnswers,
  type FontStatus,
  type Priority,
  type StoreType,
} from "@/lib/audit/recommend";

type Draft = {
  themeSlug: string;
  fontStatus: FontStatus | null;
  storeType: StoreType | null;
  priority: Priority | null;
};

const TOTAL_STEPS = 4;
const SALES_PATH = "/shopify-typography-kits";

const EMPTY_DRAFT: Draft = {
  themeSlug: "dawn",
  fontStatus: null,
  storeType: null,
  priority: null,
};

export function ShopifontAudit() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [started, setStarted] = useState(false);

  function markStarted() {
    if (!started) {
      setStarted(true);
      safeTrack("audit_started", { context: "audit" });
    }
  }

  const result = useMemo(() => {
    if (draft.fontStatus && draft.storeType && draft.priority && draft.themeSlug) {
      return buildAuditResult({
        themeSlug: draft.themeSlug,
        fontStatus: draft.fontStatus,
        storeType: draft.storeType,
        priority: draft.priority,
      } satisfies AuditAnswers);
    }
    return null;
  }, [draft]);

  const onResult = step >= TOTAL_STEPS && result !== null;

  function advance() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function restart() {
    setStep(0);
    setDraft(EMPTY_DRAFT);
  }

  return (
    <section
      aria-labelledby="audit-heading"
      className="flex flex-col gap-5 rounded-xl border border-charcoal-line/30 bg-paper p-5 sm:p-7 shadow-card"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="audit-heading" className="text-lg sm:text-xl font-bold tracking-tight">
          {onResult ? "Your typography scorecard" : "30-second typography audit"}
        </h2>
        {!onResult ? (
          <span className="text-xs font-mono text-muted whitespace-nowrap">
            {Math.min(step + 1, TOTAL_STEPS)} / {TOTAL_STEPS}
          </span>
        ) : null}
      </div>

      {!onResult ? <Progress step={step} /> : null}

      {onResult && result ? (
        <Scorecard result={result} onRestart={restart} />
      ) : (
        <Steps
          step={step}
          draft={draft}
          onPick={(patch) => {
            markStarted();
            setDraft((d) => ({ ...d, ...patch }));
            advance();
          }}
          onBack={back}
        />
      )}
    </section>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <span
          key={i}
          className={
            "h-1 flex-1 rounded-full " + (i <= step ? "bg-electric" : "bg-charcoal-line/25")
          }
        />
      ))}
    </div>
  );
}

function Steps({
  step,
  draft,
  onPick,
  onBack,
}: {
  step: number;
  draft: Draft;
  onPick: (patch: Partial<Draft>) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {step === 0 ? (
        <Question
          prompt="Which Shopify theme is your store on?"
          help="This tells us your stock font and where the fix goes."
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="audit-theme" className="sr-only">
              Theme
            </label>
            <select
              id="audit-theme"
              value={draft.themeSlug}
              onChange={(e) => onPick({ themeSlug: e.target.value })}
              className="min-h-[3rem] flex-1 rounded-md border border-charcoal-line/40 bg-paper px-3 text-base text-charcoal focus:border-electric focus:outline-none"
            >
              {THEME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label} — {o.hint}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted">
            On a paid or custom theme? Pick the closest — the diagnosis is the same.
          </p>
        </Question>
      ) : null}

      {step === 1 ? (
        <Question prompt="Have you changed your fonts from the theme default?" onBack={onBack}>
          <OptionGrid
            options={FONT_STATUS_OPTIONS}
            onPick={(value) => onPick({ fontStatus: value as FontStatus })}
          />
        </Question>
      ) : null}

      {step === 2 ? (
        <Question prompt="What kind of store is it?" onBack={onBack}>
          <OptionGrid
            options={STORE_TYPE_OPTIONS}
            onPick={(value) => onPick({ storeType: value as StoreType })}
          />
        </Question>
      ) : null}

      {step === 3 ? (
        <Question
          prompt="What matters most for your type?"
          help="The tie-breaker between a characterful pick and a fast, safe one."
          onBack={onBack}
        >
          <OptionGrid
            options={PRIORITY_OPTIONS}
            onPick={(value) => onPick({ priority: value as Priority })}
          />
        </Question>
      ) : null}
    </div>
  );
}

function Question({
  prompt,
  help,
  onBack,
  children,
}: {
  prompt: string;
  help?: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-base sm:text-lg font-semibold tracking-tight text-charcoal">{prompt}</p>
        {help ? <p className="text-sm text-muted">{help}</p> : null}
      </div>
      {children}
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="self-start text-xs text-muted hover:text-electric transition-colors"
        >
          ← Back
        </button>
      ) : null}
    </div>
  );
}

function OptionGrid<T extends string>({
  options,
  onPick,
}: {
  options: ReadonlyArray<{ value: T; label: string; hint: string }>;
  onPick: (value: T) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onPick(o.value)}
          className="group flex flex-col gap-0.5 rounded-lg border border-charcoal-line/30 px-4 py-3 text-left hover:border-electric hover:bg-electric/[0.04] transition-colors"
        >
          <span className="font-medium text-charcoal group-hover:text-electric">{o.label}</span>
          <span className="text-xs text-muted">{o.hint}</span>
        </button>
      ))}
    </div>
  );
}

function Scorecard({
  result,
  onRestart,
}: {
  result: NonNullable<ReturnType<typeof buildAuditResult>>;
  onRestart: () => void;
}) {
  const { kit, findings, score, answers } = result;
  const { enabled: kitEnabled } = siteConfig.features.kit;

  // Fire the completion event exactly once when the scorecard mounts.
  useEffect(() => {
    safeTrack("audit_completed", {
      context: "audit",
      theme: answers.themeSlug,
      storeType: answers.storeType,
      recommendedKit: kit.slug,
      score: score.score,
    });
    // Mount-only: the scorecard only renders once answers are complete.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pairingLabel = kit.singleFamily
    ? kit.heading.family
    : `${kit.heading.family} + ${kit.body.family}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Verdict */}
      <div className="flex flex-col gap-2 rounded-lg border border-electric/30 bg-gradient-to-br from-electric/[0.07] via-electric/[0.02] to-transparent p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-wide text-muted">
            Based on your answers · a 30-second gut-check, not a live scan
          </p>
          <span className="text-xs font-mono text-electric">
            {score.score}/{score.max}
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight">{score.label}</p>
      </div>

      {/* Findings */}
      <ul className="flex flex-col gap-3">
        {findings.map((f, i) => (
          <li key={i} className="flex gap-3 rounded-lg border border-charcoal-line/25 bg-paper p-4">
            <span
              aria-hidden
              className={
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold " +
                (f.kind === "good" ? "bg-electric/15 text-electric" : "bg-danger/10 text-danger")
              }
            >
              {f.kind === "good" ? "✓" : "!"}
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="font-semibold text-charcoal">{f.title}</p>
              <p className="text-sm text-charcoal/80 leading-relaxed">{f.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Prescription */}
      <div className="flex flex-col gap-3 rounded-xl border border-electric/40 bg-gradient-to-br from-electric/[0.08] via-electric/[0.03] to-transparent p-5 sm:p-6">
        <p className="inline-flex items-center gap-1.5 self-start rounded-full bg-electric/15 text-electric px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold">
          <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-electric" />
          Your fix
        </p>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
          {kit.name} — {pairingLabel}
        </h3>
        <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed">
          For a {storeTypeLabel(answers.storeType)} store, this is the proven pairing:{" "}
          {kit.rationale}
        </p>
        <p className="text-sm text-charcoal/80 leading-relaxed">
          The kit is the decision already made — the exact copy-paste install code for{" "}
          {result.theme?.name ?? "your theme"}, the licensing cleared, and a visual specimen. A
          five-minute swap and your store stops reading as stock.
        </p>
        {/*
         * Peak-intent CTA. The visitor just learned their store reads as
         * stock AND got the exact kit that fixes it — the hottest moment on
         * the site. When the store is live we buy DIRECTLY here via the
         * Gumroad overlay (stays on-page), collapsing the old two-hop path
         * through the sales page. The secondary link stays for shoppers who
         * want to read what's inside first. When dark, the link is the only
         * affordance and routes to the sales page.
         */}
        <div className="flex flex-col gap-3 pt-1">
          {kitEnabled ? (
            <>
              <KitCta source="audit-scorecard" block />
              <Link
                href={`${SALES_PATH}#${kit.slug}`}
                onClick={() =>
                  safeTrack("audit_cta_kit_click", {
                    context: "audit",
                    recommendedKit: kit.slug,
                  })
                }
                className="self-start text-sm text-electric hover:underline"
              >
                See all six kits and what&apos;s inside →
              </Link>
            </>
          ) : (
            <Link
              href={`${SALES_PATH}#${kit.slug}`}
              onClick={() =>
                safeTrack("audit_cta_kit_click", {
                  context: "audit",
                  recommendedKit: kit.slug,
                })
              }
              className="group inline-flex items-center justify-center self-start min-h-[2.75rem] px-5 rounded-md bg-electric text-paper font-semibold text-sm shadow-cta hover:bg-electric-hover whitespace-nowrap"
            >
              See the Typography Kits
              <span aria-hidden className="ml-1.5 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* DIY fallback — keeps the free path honest and useful */}
      <div className="flex flex-col gap-2 rounded-lg border border-charcoal-line/25 bg-paper-dim p-4 sm:p-5">
        <p className="font-semibold text-charcoal">Prefer to do it yourself?</p>
        <p className="text-sm text-charcoal/80 leading-relaxed">
          Your pairing is <strong>{pairingLabel}</strong>. Both are free and open-licensed — grab
          them from Google Fonts, then use the generator to produce the install code for{" "}
          {result.theme?.name ?? "your theme"}.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <a
            href={kit.heading.googleFontsUrl}
            target="_blank"
            rel="noopener"
            className="text-electric hover:underline"
          >
            {kit.heading.family} on Google Fonts →
          </a>
          {!kit.singleFamily ? (
            <a
              href={kit.body.googleFontsUrl}
              target="_blank"
              rel="noopener"
              className="text-electric hover:underline"
            >
              {kit.body.family} on Google Fonts →
            </a>
          ) : null}
          <Link
            href="/"
            onClick={() =>
              safeTrack("audit_cta_generator_click", {
                context: "audit",
                recommendedKit: kit.slug,
              })
            }
            className="text-electric hover:underline"
          >
            Open the generator →
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="self-start text-xs text-muted hover:text-electric transition-colors"
      >
        ↺ Run the audit again
      </button>
    </div>
  );
}
