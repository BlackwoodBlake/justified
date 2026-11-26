#!/usr/bin/env node
/**
 * check-public.ts: stops text that should never be in a public repository.
 *
 * Reads every file git tracks (or has staged) and reports lines that hold:
 *   - an absolute path on someone's computer (home folders, temp folders,
 *     and paths that start at the home folder, such as ~/notes)
 *   - a pointer to notes kept outside the repository (the folder above it)
 *   - Swedish: its three extra letters, or two common Swedish words on one
 *     line, since Swedish written without those letters is still Swedish
 *   - a GitHub or npm token
 *   - an email address that is not an example or a public project address
 *   - working words that belong in local notes, not in the repository
 * It also fails if a file from a never-committed folder is tracked, and if
 * a file named as an image, font or PDF does not hold one: text saved
 * under such a name is checked like any other text.
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
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Check = { name: string; pattern: RegExp };

const CHECKS: Check[] = [
  {
    name: "absolute path on a computer",
    pattern: /(?:\/Users\/[A-Za-z]|\/home\/[a-z]|\/private\/tmp\/|\/var\/folders\/|[A-Z]:\\Users\\|(?:^|[\s"'`(=:,[])~\/[\w.-]|\$HOME\/|\$\{HOME\}\/)/,
  },
  { name: "pointer to notes outside the repository", pattern: /\.\.\/docs\b|collection folder/i },
  { name: "Swedish letters (write in English)", pattern: /[åäöÅÄÖ]/ },
  { name: "private working words", pattern: /\b(?:scratchpad)\b/i },
  {
    name: "a GitHub or npm token",
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,}|npm_[A-Za-z0-9]{36,})\b/,
  },
];

/**
 * Common Swedish words that are not English words, or so rare in English
 * that two of them on one line mean Swedish. Spelled without the three
 * Swedish letters, which are caught on their own. Words that are also English or
 * common in code (den, men, till, under, nu, vi, om, av) are left out.
 */
const SWEDISH = new Set(
  ("och inte eller eftersom alltid aldrig finns kanske varje detta denna dessa utan bara ska skall " +
   "att det som jag ett har kan vara blir efter sedan mycket hur vad alla inga ingen sitt sina " +
   "mot vid nej tack hej regel regler regeln sidan mappen gjort klart fixa behover maste ocksa " +
   "nagon nagot andra skriv skrivs ligger finns heter fast bra dag idag igen")
    .split(" "),
);
const SWEDISH_MIN = 2;

/** Email addresses that may appear: RFC 2606 examples, GitHub's no-reply addresses and the project's own domain. */
const EMAIL = /[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)/g;
const EMAIL_OK = /^(?:example\.(?:com|org|net)|users\.noreply\.github\.com|blackwoodblake\.com)$/i;

/** Folders that are never committed (see .gitignore). */
const NEVER_TRACKED = [/^\.sources-cache\//, /^\.analysis\//, /(^|\/)\.env(\.|$)/];

/** Files that hold other people's text we do not write, or this file's own patterns. */
const SKIP = [/^package-lock\.json$/, /^scripts\/check-public\.ts$/];

/** Binary files by extension, and the bytes such a file starts with. */
const BINARY: [RegExp, (b: Buffer) => boolean][] = [
  [/\.png$/i, (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))],
  [/\.jpe?g$/i, (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff],
  [/\.gif$/i, (b) => b.subarray(0, 4).toString("latin1") === "GIF8"],
  [/\.webp$/i, (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP"],
  [/\.ico$/i, (b) => b.subarray(0, 4).equals(Buffer.from([0, 0, 1, 0]))],
  [/\.pdf$/i, (b) => b.subarray(0, 5).toString("latin1") === "%PDF-"],
  [/\.woff$/i, (b) => b.subarray(0, 4).toString("latin1") === "wOFF"],
  [/\.woff2$/i, (b) => b.subarray(0, 4).toString("latin1") === "wOF2"],
  [/\.(?:ttf|otf)$/i, (b) => b.subarray(0, 4).equals(Buffer.from([0, 1, 0, 0])) || ["OTTO", "true"].includes(b.subarray(0, 4).toString("latin1"))],
];

function trackedFiles(): string[] {
  try {
    const out = execFileSync("git", ["ls-files", "--cached", "-z"], { encoding: "utf8" });
    return out.split("\0").filter(Boolean);
  } catch {
    console.error("check-public: run this inside the git repository.");
    process.exit(2);
  }
}

export function allowList(path = "scripts/public-allow.txt"): Set<string> {
  if (!existsSync(path)) return new Set();
  return new Set(
    readFileSync(path, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#")),
  );
}

/** The Swedish words on a line, each counted once. */
function swedishWords(line: string): string[] {
  const words = line.toLowerCase().match(/(?<![\w./-])[a-z]+(?![\w/-])/g) ?? [];
  return [...new Set(words.filter((w) => SWEDISH.has(w)))];
}

/** Every problem in one tracked file, given its path and its bytes. */
export function scanFile(file: string, content: Buffer, allowed: Set<string> = new Set()): string[] {
  const problems: string[] = [];
  if (NEVER_TRACKED.some((p) => p.test(file))) return [`${file}: file from a folder that is never committed`];
  if (SKIP.some((p) => p.test(file))) return [];

  const binary = BINARY.find(([name]) => name.test(file));
  if (binary) {
    if (binary[1](content)) return [];
    problems.push(`${file}: named as a binary file but does not hold one; its text is checked below`);
  }

  const text = content.toString("utf8");
  if (!binary && text.includes("\0")) return problems;

  text.split("\n").forEach((line, i) => {
    const where = `${file}:${i + 1}`;
    const isAllowed = [...allowed].some((entry) => {
      const [path, ...rest] = entry.split(": ");
      return path === file && line.includes(rest.join(": "));
    });
    if (isAllowed) return;

    const shown = line.trim().slice(0, 120);
    for (const check of CHECKS) {
      if (check.pattern.test(line)) problems.push(`${where}: ${check.name}: ${shown}`);
    }
    const swedish = swedishWords(line);
    if (swedish.length >= SWEDISH_MIN) problems.push(`${where}: Swedish words (${swedish.join(", ")}): ${shown}`);
    for (const match of line.matchAll(EMAIL)) {
      if (!EMAIL_OK.test(match[1])) problems.push(`${where}: email address that is not an example: ${match[0]}`);
    }
  });
  return problems;
}

function main() {
  const allowed = allowList();
  const problems: string[] = [];
  for (const file of trackedFiles()) {
    if (NEVER_TRACKED.some((p) => p.test(file))) {
      problems.push(`${file}: file from a folder that is never committed`);
      continue;
    }
    if (!existsSync(file)) continue;
    problems.push(...scanFile(file, readFileSync(file), allowed));
  }

  if (problems.length) {
    console.error(`check-public: ${problems.length} line(s) should not be public:\n`);
    for (const p of problems) console.error(`  ${p}`);
    console.error("\nRemove them, or allow a line in scripts/public-allow.txt with a reason.");
    process.exit(1);
  }
  console.log("check-public: nothing private found in tracked files.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
