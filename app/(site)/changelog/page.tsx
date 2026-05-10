import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/Schema/BreadcrumbSchema";
import changelog from "@/content/changelog.json";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

const PAGE_DESCRIPTION = `Public changelog for ${siteConfig.name} — generated at build time from git history. Dates and titles only.`;

export const metadata: Metadata = {
  title: `Changelog`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/changelog" },
  openGraph: {
    title: `${siteConfig.name} Changelog`,
    description: PAGE_DESCRIPTION,
    url: "/changelog",
    type: "article",
  },
};

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** Locked data shape (spec §7). */
type Entry = {
  date: string;
  title: string;
};

function groupByMonth(entries: ReadonlyArray<Entry>) {
  const groups = new Map<string, Entry[]>();
  for (const e of entries) {
    if (!e.date) continue;
    const d = new Date(e.date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
}

export default function ChangelogPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Changelog", href: "/changelog" },
  ];
  const groups = groupByMonth(changelog as ReadonlyArray<Entry>);

  return (
    <>
      <BreadcrumbSchema id="changelog-breadcrumb-schema" crumbs={crumbs} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <ol className="flex flex-wrap gap-1">
            {crumbs.map((c, idx) => (
              <li key={c.href} className="flex items-center gap-1">
                {idx > 0 ? <span aria-hidden>›</span> : null}
                {idx === crumbs.length - 1 ? (
                  <span aria-current="page" className="text-charcoal">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.href} className="hover:text-electric">
                    {c.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide text-muted">
            Changelog
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]">
            What&apos;s shipped
          </h1>
          <p className="text-base sm:text-lg text-charcoal/80">
            Every commit landed on{" "}
            <code className="font-mono">main</code>, in order. Generated
            from git history at build time so it stays in sync with the
            repo without anyone hand-curating release notes.
            {siteConfig.repoUrl ? (
              <>
                {" "}
                Long-form release notes live in{" "}
                <a
                  href={`${siteConfig.repoUrl}/releases`}
                  target="_blank"
                  rel="noopener"
                  className="text-electric hover:underline"
                >
                  GitHub Releases
                </a>
                .
              </>
            ) : null}
          </p>
        </header>

        {groups.length === 0 ? (
          <p className="text-sm text-muted">
            No changelog entries yet — check back after the next deploy.
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {groups.map(([month, entries]) => {
              const firstDate = new Date(entries[0]!.date);
              return (
                <section
                  key={month}
                  aria-labelledby={`month-${month}`}
                  className="flex flex-col gap-4"
                >
                  <h2
                    id={`month-${month}`}
                    className="text-lg font-bold tracking-tight text-muted uppercase"
                  >
                    {firstDate.toLocaleString("en-US", {
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </h2>
                  <ul className="flex flex-col divide-y divide-charcoal-line/20 border-y border-charcoal-line/20">
                    {entries.map((e, idx) => (
                      <li
                        key={`${e.date}-${idx}`}
                        className="grid grid-cols-[6rem_1fr] sm:grid-cols-[7rem_1fr] gap-3 py-3"
                      >
                        <time
                          dateTime={e.date}
                          className="font-mono text-xs text-muted"
                        >
                          {DATE_FMT.format(new Date(e.date))}
                        </time>
                        <p className="text-sm text-charcoal leading-snug">
                          {e.title}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted">
          Generated from <code className="font-mono">git log</code> on every
          deploy.
        </p>
      </div>
    </>
  );
}
