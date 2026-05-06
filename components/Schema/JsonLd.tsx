/**
 * Inline JSON-LD renderer. App Router emits the script tag directly in
 * the rendered HTML, which is exactly what we want for AI extractors
 * and Google's Rich Results parser (PLAN.md §4 — "keep it inline, do
 * not lazy-load"). next/script's `beforeInteractive` strategy is a
 * Pages Router-only API; in App Router a plain <script> is the idiom.
 */
export function JsonLd({
  id,
  data,
}: {
  id: string;
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
