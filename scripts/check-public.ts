#!/usr/bin/env node
/**
 * check-public.ts: stops text that should never be in a public repository.
 *
 * Reads every file git tracks (or has staged) and reports lines that hold:
 *   - an absolute path on someone's computer (home folders, temp folders)
 *   - a pointer to notes kept outside the repository (the folder above it)
 *   - Swedish letters: the repository is written in English
 *   - an email address that is not an example or a public project address
 *   - working words that belong in local notes, not in the repository
 * It also fails if a file from a never-committed folder is tracked.
 *
 * Usage:
 *   npx tsx scripts/check-public.ts
 *
 * A line that must stay can be allowed in scripts/public-allow.txt, one entry
 * per line: `path/to/file.md: exact text on the line`. Keep entries rare and
 * give each a comment (# ...) saying why.
 *
 * The patterns below are written with escapes so that this file does not
 * match itself. The maintainer's push hook adds a private list on top.
 *
 * Exit code: 0 = clean, 1 = something found, 2 = setup error.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

type Check = { name: string; pattern: RegExp };

const CHECKS: Check[] = [
  {
    name: "absolute path on a computer",
    pattern: /(?:\/Users\/[A-Za-z]|\/home\/[a-z]|\/private\/tmp\/|\/var\/folders\/|[A-Z]:\\Users\\)/,
  },
  { name: "pointer to notes outside the repository", pattern: /\.\.\/docs\b|collection folder/i },
  { name: "Swedish letters (write in English)", pattern: /[åäöÅÄÖ]/ },
  { name: "private working words", pattern: /\b(?:scratchpad)\b/i },
];

/** Email addresses that may appear: RFC 2606 examples, GitHub's no-reply addresses and the project's own domain. */
const EMAIL = /[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)/g;
const EMAIL_OK = /^(?:example\.(?:com|org|net)|users\.noreply\.github\.com|blackwoodblake\.com)$/i;

/** Folders that are never committed (see .gitignore). */
const NEVER_TRACKED = [/^\.sources-cache\//, /^\.analysis\//, /(^|\/)\.env(\.|$)/];

/** Files that are not text, or that hold other people's text we do not write. */
const SKIP = [/\.(png|jpe?g|gif|webp|ico|pdf|woff2?|ttf|otf)$/i, /^package-lock\.json$/, /^scripts\/check-public\.ts$/];

function trackedFiles(): string[] {
  try {
    const out = execFileSync("git", ["ls-files", "--cached", "-z"], { encoding: "utf8" });
    return out.split("\0").filter(Boolean);
  } catch {
    console.error("check-public: run this inside the git repository.");
    process.exit(2);
  }
}

function allowList(): Set<string> {
  const file = "scripts/public-allow.txt";
  if (!existsSync(file)) return new Set();
  return new Set(
    readFileSync(file, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#")),
  );
}

const allowed = allowList();
const problems: string[] = [];

for (const file of trackedFiles()) {
  if (NEVER_TRACKED.some((p) => p.test(file))) {
    problems.push(`${file}: file from a folder that is never committed`);
    continue;
  }
  if (SKIP.some((p) => p.test(file)) || !existsSync(file)) continue;

  const text = readFileSync(file, "utf8");
  if (text.includes("\0")) continue;

  text.split("\n").forEach((line, i) => {
    const where = `${file}:${i + 1}`;
    const isAllowed = [...allowed].some((entry) => {
      const [path, ...rest] = entry.split(": ");
      return path === file && line.includes(rest.join(": "));
    });
    if (isAllowed) return;

    for (const check of CHECKS) {
      if (check.pattern.test(line)) problems.push(`${where}: ${check.name}: ${line.trim().slice(0, 120)}`);
    }
    for (const match of line.matchAll(EMAIL)) {
      if (!EMAIL_OK.test(match[1])) problems.push(`${where}: email address that is not an example: ${match[0]}`);
    }
  });
}

if (problems.length) {
  console.error(`check-public: ${problems.length} line(s) should not be public:\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error("\nRemove them, or allow a line in scripts/public-allow.txt with a reason.");
  process.exit(1);
}
console.log("check-public: nothing private found in tracked files.");
