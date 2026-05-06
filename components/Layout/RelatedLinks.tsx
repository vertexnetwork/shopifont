import Link from "next/link";
import { PSEO_BY_SLUG } from "@/content/pseo";

export function RelatedLinks({ slugs }: { slugs: ReadonlyArray<string> }) {
  if (slugs.length === 0) return null;
  return (
    <section
      aria-labelledby="related-heading"
      className="mt-10 rounded-lg border border-charcoal-line/30 bg-paper-dim p-5"
    >
      <h2
        id="related-heading"
        className="text-sm font-semibold uppercase tracking-wide text-muted"
      >
        Related guides
      </h2>
      <ul className="mt-3 grid sm:grid-cols-2 gap-2">
        {slugs.map((slug) => {
          const target = PSEO_BY_SLUG[slug];
          if (!target) return null;
          return (
            <li key={slug}>
              <Link
                href={`/${slug}`}
                className="block px-3 py-2 rounded-md hover:bg-paper hover:text-electric"
              >
                <span className="font-medium">{target.h1}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
