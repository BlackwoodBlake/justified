/**
 * shadcn-corpus.js: lints shadcn's own v4 app and registry code (`apps/v4`)
 * with `recommended` and compares the reports with the reviewed list in
 * `test/shadcn-corpus.txt`.
 *
 * shadcn's code is the code these rules meet most, so a new report there is
 * most often a wrong one. Every line in the list has been read by hand and
 * is a report the rule text backs.
 *
 *   node scripts/shadcn-corpus.js            fetch shadcn at the pinned commit, then compare
 *   node scripts/shadcn-corpus.js <dir>      compare, using a checkout of shadcn-ui/ui at <dir>
 *   ... --update                             write the list from the current reports
 *
 * shadcn's source is never copied into this repository: the script fetches
 * the pinned commit into a temporary folder and removes it afterwards.
 * Exit code 0 = same reports, 1 = reports differ, 2 = setup error.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import tsParser from "@typescript-eslint/parser";
import { Linter } from "eslint";

import plugin from "../index.js";

/** The shadcn-ui/ui commit the list was reviewed against. Change it only together with the list. */
export const SHADCN_COMMIT = "0e5b2e621a9ee4cf6a604bbe6c5c0d5b70561eb4";
const REPOSITORY = "https://github.com/shadcn-ui/ui.git";
/**
 * shadcn's v4 app: its own site (app, components, hooks), the examples for
 * both bases, and every registry, including the components, examples,
 * blocks and hooks the CLI copies into an app.
 */
const REGISTRY = "apps/v4";

const here = fileURLToPath(new URL(".", import.meta.url));
const listFile = join(here, "..", "test", "shadcn-corpus.txt");

const args = process.argv.slice(2);
const update = args.includes("--update");
let dir = args.find((a) => !a.startsWith("--"));
let fetched;

/** @param {string} message */
const fail = (message) => {
  console.error(message);
  if (fetched) rmSync(fetched, { recursive: true, force: true });
  process.exit(2);
};

if (!dir) {
  fetched = mkdtempSync(join(tmpdir(), "shadcn-corpus-"));
  const git = (/** @type {string[]} */ ...a) => execFileSync("git", a, { cwd: fetched, stdio: ["ignore", "ignore", "inherit"] });
  try {
    git("init", "--quiet");
    git("remote", "add", "origin", REPOSITORY);
    git("sparse-checkout", "set", "--no-cone", `/${REGISTRY}/`);
    git("fetch", "--quiet", "--depth", "1", "--filter=blob:none", "origin", SHADCN_COMMIT);
    git("checkout", "--quiet", "FETCH_HEAD");
  } catch {
    fail(`could not fetch shadcn-ui/ui at ${SHADCN_COMMIT}`);
  }
  dir = fetched;
}

const root = join(dir, REGISTRY);
try {
  statSync(root);
} catch {
  fail(`${root} is missing: give a checkout of shadcn-ui/ui at ${SHADCN_COMMIT}`);
}

/** @param {string} path @returns {string[]} */
const list = (path) =>
  readdirSync(path)
    .sort()
    .flatMap((entry) => {
      const p = join(path, entry);
      if (statSync(p).isDirectory()) return /^(node_modules|\.next|dist)$/.test(entry) ? [] : list(p);
      return /\.(js|jsx|ts|tsx)$/.test(entry) ? [p] : [];
    });

// The config the README gives: every .js, .jsx, .ts and .tsx file.
const linter = new Linter({ configType: "flat" });
const config = [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } },
    linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: "off" },
  },
  { files: ["**/*.{js,jsx,ts,tsx}"], ...plugin.configs.recommended },
];

const found = [];
const files = list(root);
for (const path of files) {
  const name = relative(root, path);
  let messages;
  try {
    messages = linter.verify(readFileSync(path, "utf8"), config, { filename: name });
  } catch (error) {
    found.push(`${name}:0 crash ${String(error).split("\n")[0]}`);
    continue;
  }
  for (const m of messages) {
    if (m.fatal) found.push(`${name}:${m.line} parse ${m.message}`);
    else if (m.ruleId?.startsWith("justified/")) found.push(`${name}:${m.line} ${m.ruleId.slice(10)}/${m.messageId}`);
  }
}
if (fetched) rmSync(fetched, { recursive: true, force: true });

if (update) {
  const header = [
    `# Reports from justified's recommended config on shadcn-ui/ui ${SHADCN_COMMIT}, ${REGISTRY}.`,
    "# Each line was read by hand and is a report the rule text backs. Written by `npm run corpus -- --update`.",
  ];
  writeFileSync(listFile, `${[...header, ...found].join("\n")}\n`);
  console.log(`${files.length} files, ${found.length} reports written to ${relative(process.cwd(), listFile)}`);
  process.exit(0);
}

const expected = readFileSync(listFile, "utf8")
  .split("\n")
  .filter((l) => l && !l.startsWith("#"));
const count = (/** @type {string[]} */ a) => a.reduce((m, l) => m.set(l, (m.get(l) ?? 0) + 1), new Map());
const want = count(expected);
const got = count(found);
const extra = [];
const gone = [];
for (const line of [...new Set([...want.keys(), ...got.keys()])].sort()) {
  const d = (got.get(line) ?? 0) - (want.get(line) ?? 0);
  for (let i = 0; i < Math.abs(d); i++) (d > 0 ? extra : gone).push(`${d > 0 ? "+" : "-"} ${line}`);
}

console.log(`${files.length} files from shadcn-ui/ui ${SHADCN_COMMIT.slice(0, 7)}, ${found.length} reports, ${expected.length} expected`);
if (!extra.length && !gone.length) process.exit(0);
if (extra.length) console.log(`New reports (check each: most often the rule is too strict):\n${extra.join("\n")}`);
if (gone.length) console.log(`Reports that went away (check that each was a wrong one):\n${gone.join("\n")}`);
console.log("When every change is right, run `npm run corpus --workspace packages/eslint -- --update` and commit the list.");
process.exit(1);
