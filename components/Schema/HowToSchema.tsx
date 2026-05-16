import { JsonLd } from "./JsonLd";

export type HowToStepData = {
  /** Short label. Optional — when omitted, only `text` is emitted. */
  name?: string;
  /** The instruction body. Required. */
  text: string;
};

type Props = {
  /** Stable element id for the JSON-LD `<script>` — must be unique per page. */
  id?: string;
  /** The full "How to ..." sentence. */
  name: string;
  /** One-sentence description shown by Google when expanding the rich result. */
  description: string;
  /** ISO 8601 duration (e.g., "PT5M"). Optional. */
  totalTime?: string;
  /** Free-form supply names (e.g., "Custom font file (WOFF2 recommended)"). */
  supply?: ReadonlyArray<string>;
  /** Ordered steps. `position` is assigned automatically from array index. */
  steps: ReadonlyArray<HowToStepData>;
};

/**
 * Generic HowTo schema emitter. Used by the homepage's three-step
 * install flow and by every non-comparison pSEO page (whose
 * useCaseSteps describe theme-specific installation steps that Google
 * rewards as HowTo rich results).
 *
 * Policy note: per Google's structured-data guidelines, every step
 * here must be visible on the same page. Both call sites render the
 * exact step text in an `<ol>` immediately above or below the schema
 * emission point.
 */
export function HowToSchema({
  id = "howto-schema",
  name,
  description,
  totalTime,
  supply,
  steps,
}: Props) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((s, idx) => ({
      "@type": "HowToStep",
      ...(s.name ? { name: s.name } : {}),
      text: s.text,
      position: idx + 1,
    })),
  };
  if (totalTime) data.totalTime = totalTime;
  if (supply && supply.length > 0) {
    data.supply = supply.map((name) => ({
      "@type": "HowToSupply",
      name,
    }));
  }
  return <JsonLd id={id} data={data} />;
}
