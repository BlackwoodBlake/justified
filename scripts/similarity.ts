#!/usr/bin/env node
/**
 * similarity.ts: stops rule texts that reuse wording from a source.
 *
 * Compares every rule in rules/ with the saved source excerpts and reports
 * every run of N words in a row (default 7) that appears in both.
 *
 * Usage:
 *   npx tsx scripts/similarity.ts [--rules rules] [--sources .sources-cache]
 *                                 [--n 7] [--allow scripts/similarity-allow.txt]
 *
 * Texts to check are .md, .txt or .tsx files (the live examples). Source excerpts are plain .txt or .md files, one per source page, named
 * after the source id in sources.yaml (for example material-buttons.txt).
 * The analysing agent saves them while it reads. They are copies of other
 * people's text, so they stay out of the repository (.sources-cache/ is in
 * .gitignore).
 *
 * In published texts (rules/ and examples/rules/) the frontmatter's text
 * values (title, how_to_check, changelog notes and any other) are compared
 * like the body, since they are published too. Elsewhere, such as
 * .analysis/, only the body is compared. `--frontmatter yes|no` overrides
 * that choice.
 *
 * The check needs the excerpts, which are never committed, so it runs on
 * the machine that holds them and not in CI.
 *
 * What is ignored:
 *   - frontmatter keys and syntax, code blocks, inline code, HTML comments
 *     and URLs in rules
 *   - word runs that are mostly function words ("it is not the same as the")
 *   - phrases listed in the allow file (WCAG criterion names, common terms)
 *
 * Exit code: 0 = no overlap, 1 = overlap found, 2 = setup error.
 */
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { parseDocument, visit } from "yaml";

// ---------------------------------------------------------------- options

type Options = { rules: string; sources: string; n: number; allow: string; frontmatter: boolean | null };

/** The folders whose texts are published, frontmatter and all. */
const PUBLISHED = ["rules", "examples/rules"];

function parseArgs(argv: string[]): Options {
  const opts: Options = {
    rules: "rules",
    sources: ".sources-cache",
    n: 7,
    allow: "scripts/similarity-allow.txt",
    frontmatter: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (value === undefined) fail(`Missing value for ${flag}`);
    switch (flag) {
      case "--rules": opts.rules = value; break;
      case "--sources": opts.sources = value; break;
      case "--allow": opts.allow = value; break;
      case "--n": opts.n = Number(value); break;
      case "--frontmatter":
        if (value !== "yes" && value !== "no") fail("--frontmatter must be yes or no");
        opts.frontmatter = value === "yes";
        break;
      default: fail(`Unknown option ${flag}`);
    }
    i++;
  }
  if (!Number.isInteger(opts.n) || opts.n < 4) fail("--n must be a whole number, 4 or more");
  return opts;
}

function fail(message: string): never {
  console.error(`similarity: ${message}`);
  process.exit(2);
}

// ---------------------------------------------------------------- text

type Word = { w: string; line: number };

/** Blank out a match but keep its newlines, so line numbers stay right. */
const blank = (m: string) => m.replace(/[^\n]/g, " ");

/**
 * The frontmatter, with only its text values kept, each on the line where
 * it is written. Keys, YAML syntax and comments are blanked. A number goes
 * between values, and numbers are masked before comparing, so a run of
 * words never joins two fields. Titles, how_to_check and changelog notes
 * are published (rules.json, the agent files, the rule pages), so they
 * must be in our own words like the body.
 */
function frontmatterText(block: string): string {
  const yaml = block.slice(4, block.lastIndexOf("\n---")); // between the --- lines
  const doc = parseDocument(yaml);
  if (doc.errors.length) return block; // compare all of it rather than skip it
  const lines = blank(block).split("\n");
  visit(doc, {
    Scalar(key, node) {
      if (key === "key" || typeof node.value !== "string" || !node.range) return;
      const line = 1 + (yaml.slice(0, node.range[0]).match(/\n/g)?.length ?? 0);
      lines[line] += ` 0 ${node.value.replace(/\s+/g, " ")} 0`;
    },
  });
  return lines.join("\n");
}

function stripMarkdown(text: string, withFrontmatter: boolean): string {
  return text
    .replace(/^---\n[\s\S]*?\n---\n/, withFrontmatter ? frontmatterText : blank) // frontmatter: its text values, or nothing
    .replace(/```[\s\S]*?```/g, blank)            // fenced code
    .replace(/<!--[\s\S]*?-->/g, blank)           // HTML comments
    .replace(/`[^`\n]*`/g, blank)                 // inline code
    .replace(/\]\([^)\s]*\)/g, (m) => "]" + blank(m.slice(1))) // link targets
    .replace(/https?:\/\/\S+/g, blank);           // bare URLs
}

function tokenize(text: string): Word[] {
  const words: Word[] = [];
  text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .split("\n")
    .forEach((lineText, index) => {
      for (const m of lineText.matchAll(/[\p{L}\p{N}]+(?:'[\p{L}]+)?/gu)) {
        words.push({ w: m[0], line: index + 1 });
      }
    });
  return words;
}

const STOPWORDS = new Set(
  ("a an and are as at be been but by can do does for from has have if in into is it its " +
   "may must no not of on or should so than that the their them then there they this to " +
   "was we were what when where which who will with would you your our")
    .split(" "),
);

/** A run counts only if at least three of its words carry meaning. */
function isMeaningful(words: string[]): boolean {
  return words.filter((w) => !STOPWORDS.has(w)).length >= 3;
}

function ngrams(words: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i + n <= words.length; i++) out.push(words.slice(i, i + n).join(" "));
  return out;
}

// ---------------------------------------------------------------- files

function listFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...listFiles(path));
    else if ([".md", ".txt", ".tsx"].includes(extname(path))) out.push(path);
  }
  return out.sort();
}

/**
 * Allowed phrases of any length, as word lists. A rule's words that match
 * one, and criterion numbers such as 3.3.4, are masked before comparing,
 * so a run can never be built across them. This is what lets short names
 * like "Use of Color" through, which no 7-word run from the list could.
 */
function loadPhrases(path: string): string[][] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => tokenize(l).map((t) => t.w))
    .filter((p) => p.length >= 2);
}

function maskAllowed(words: Word[], phrases: string[][]): string[] {
  const masked = words.map((t) => (/^\p{N}+$/u.test(t.w) ? null : t.w));
  for (let i = 0; i < words.length; i++) {
    for (const p of phrases) {
      if (p.every((w, k) => words[i + k]?.w === w)) for (let k = 0; k < p.length; k++) masked[i + k] = null;
    }
  }
  // A masked word becomes a token no source contains.
  return masked.map((w, i) => w ?? `\u0000${i}`);
}

function loadAllowed(path: string, n: number): Set<string> {
  const allowed = new Set<string>();
  if (!existsSync(path)) return allowed;
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    for (const g of ngrams(tokenize(line).map((t) => t.w), n)) allowed.add(g);
  }
  return allowed;
}

// ---------------------------------------------------------------- check

type Hit = { rule: string; source: string; fromLine: number; toLine: number; words: string[] };

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!existsSync(opts.rules)) fail(`Rules folder not found: ${opts.rules}`);
  if (!existsSync(opts.sources)) fail(`Source folder not found: ${opts.sources}`);
  const real = (p: string) => (existsSync(p) ? realpathSync(p) : null);
  const withFrontmatter = opts.frontmatter ?? PUBLISHED.some((dir) => real(dir) === real(opts.rules));

  const allowed = loadAllowed(opts.allow, opts.n);
  const phrases = loadPhrases(opts.allow);

  // Every meaningful n-gram in the sources, and the first source it came from.
  const index = new Map<string, string>();
  const sourceFiles = listFiles(opts.sources);
  if (sourceFiles.length === 0) fail(`No source excerpts in ${opts.sources}`);
  for (const file of sourceFiles) {
    const words = tokenize(readFileSync(file, "utf8")).map((t) => t.w);
    const name = relative(opts.sources, file);
    for (const g of ngrams(words, opts.n)) if (!index.has(g)) index.set(g, name);
  }

  const hits: Hit[] = [];
  const ruleFiles = listFiles(opts.rules);
  for (const file of ruleFiles) {
    const words = tokenize(stripMarkdown(readFileSync(file, "utf8"), withFrontmatter));
    const keys = maskAllowed(words, phrases);
    // Matches as word spans [start, end); overlapping ones from the same
    // source are merged, so one copied passage is reported once.
    const spans: { start: number; end: number; source: string }[] = [];

    for (let i = 0; i + opts.n <= words.length; i++) {
      const run = keys.slice(i, i + opts.n);
      const key = run.join(" ");
      const source = index.get(key);
      if (!source || allowed.has(key) || !isMeaningful(run)) continue;

      const last = spans[spans.length - 1];
      if (last && last.source === source && i <= last.end) last.end = i + opts.n;
      else spans.push({ start: i, end: i + opts.n, source });
    }

    for (const s of spans) {
      const part = words.slice(s.start, s.end);
      hits.push({
        rule: file,
        source: s.source,
        fromLine: part[0].line,
        toLine: part[part.length - 1].line,
        words: part.map((t) => t.w),
      });
    }
  }

  if (hits.length === 0) {
    console.log(`similarity: no shared runs of ${opts.n} words ` +
      `(${ruleFiles.length} rules, ${sourceFiles.length} sources)`);
    return;
  }

  for (const h of hits) {
    const lines = h.fromLine === h.toLine ? `${h.fromLine}` : `${h.fromLine}-${h.toLine}`;
    const shown = h.words.length > 20 ? h.words.slice(0, 20).join(" ") + " ..." : h.words.join(" ");
    console.log(`${h.rule}:${lines}`);
    console.log(`  ${h.words.length} words in a row shared with ${h.source}`);
    console.log(`  "${shown}"\n`);
  }
  const files = new Set(hits.map((h) => h.rule)).size;
  console.log(`similarity: ${hits.length} shared passage(s) in ${files} rule(s). ` +
    "Rewrite them in your own words (WRITING.md).");
  process.exit(1);
}

main();
