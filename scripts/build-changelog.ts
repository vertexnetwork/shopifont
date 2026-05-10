/**
 * Prebuild script. Reads recent commits from `git log` and writes a
 * typed JSON to `content/changelog.json`.
 *
 * Spec §7 locks the data shape to `{ date, title }` — no hash, no
 * author, no body. Long-form release notes belong in GitHub Releases
 * (which is a private repo for Shopifont anyway).
 *
 * Falls back to the existing JSON if `git log` fails — Vercel's
 * shallow clones occasionally miss depth.
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const target = resolve(projectRoot, "content", "changelog.json");

type ChangelogEntry = {
  /** ISO date `YYYY-MM-DD`. */
  date: string;
  /** Commit subject; truncated to 80 chars. */
  title: string;
};

const MAX_TITLE = 80;

let entries: ChangelogEntry[] = [];
try {
  const raw = execSync(
    'git log --pretty=format:"%ad|%s" --date=short --no-merges -100',
    { encoding: "utf8", cwd: projectRoot },
  );
  entries = raw
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const sep = line.indexOf("|");
      const date = sep >= 0 ? line.slice(0, sep) : "";
      const subject = sep >= 0 ? line.slice(sep + 1) : line;
      const title =
        subject.length > MAX_TITLE
          ? subject.slice(0, MAX_TITLE - 1) + "…"
          : subject;
      return { date, title };
    });
} catch (err) {
  if (existsSync(target)) {
    console.warn(
      "[build-changelog] git log failed; keeping existing changelog.json",
      err,
    );
    process.exit(0);
  }
  console.warn(
    "[build-changelog] git log failed and no committed file; writing empty",
    err,
  );
}

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, JSON.stringify(entries, null, 2) + "\n", "utf8");
console.log(
  `[build-changelog] wrote ${target} (${entries.length} entries)`,
);
