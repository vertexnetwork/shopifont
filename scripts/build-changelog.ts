/**
 * Prebuild script. Reads the last 100 commits from `git log` and
 * writes a typed JSON to `content/changelog.json` for the
 * `/changelog` page to render.
 *
 * Runs via `npm run prebuild`. Falls back to the existing JSON
 * (committed) if `git log` fails — so Vercel's shallow clones don't
 * blank out the changelog if depth is missing.
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
  hash: string;
  shortHash: string;
  date: string;
  subject: string;
};

let entries: ChangelogEntry[] = [];
try {
  const raw = execSync(
    'git log --pretty=format:"%H::%h::%aI::%s" --no-merges -100',
    { encoding: "utf8", cwd: projectRoot },
  );
  entries = raw
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash = "", shortHash = "", date = "", ...subjectParts] =
        line.split("::");
      return {
        hash,
        shortHash,
        date,
        subject: subjectParts.join("::"),
      };
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
