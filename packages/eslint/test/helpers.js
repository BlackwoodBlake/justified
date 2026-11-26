/**
 * helpers.js: what every test shares.
 *
 *   - `ruleTester`: ESLint's RuleTester on node:test, parsing TSX.
 *   - `run(name, rule, { valid, invalid })`: runs a rule's cases, each as a
 *     .tsx file, with the shadcn code in `shadcn.js` added to `valid`.
 *   - `readRule(id)`: a rule file's frontmatter, level and verdict, worked
 *     out the way the agents build and `scripts/level.ts` do.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";
import { parse } from "yaml";

import { deriveLevel } from "../../../scripts/level.ts";
import { shadcnValid } from "./shadcn.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

export const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

export const languageOptions = {
  parser: tsParser,
  parserOptions: { ecmaFeatures: { jsx: true } },
};

export const ruleTester = new RuleTester({ languageOptions });

/** A short test name from the code, so the test log stays readable. @param {string} code */
const short = (code) => {
  const text = code.replace(/^import .*$/gm, "").replace(/\s+/g, " ").trim();
  return text.length > 90 ? `${text.slice(0, 87)}...` : text;
};

/** Gives a case a .tsx file name and a short name unless it has them. @param {string | object} c */
const asTsx = (c) => {
  const test = typeof c === "string" ? { code: c } : c;
  return { filename: "component.tsx", name: short(test.code), ...test };
};

/**
 * Runs a rule's tests. The shared shadcn examples are always valid.
 * @param {string} name
 * @param {import("eslint").Rule.RuleModule} rule
 * @param {{ valid: (string | object)[], invalid: object[] }} cases
 */
export function run(name, rule, { valid, invalid }) {
  ruleTester.run(name, rule, {
    valid: [...Object.entries(shadcnValid).map(([what, code]) => ({ code, filename: "shadcn.tsx", name: `shadcn ${what}` })), ...valid.map(asTsx)],
    invalid: invalid.map(asTsx),
  });
}

function listMarkdown(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return listMarkdown(path);
    return path.endsWith(".md") ? [path] : [];
  });
}

const VERDICT = {
  requirement: "Requirement",
  unanimous: "Unanimous",
  majority: "Majority",
  split: "Split",
  "insufficient-evidence": "Insufficient evidence",
};

/** The verdict as the review skill writes it. */
export function verdictText(meta) {
  if (meta.verdict === "requirement") return VERDICT.requirement;
  if (meta.verdict === "insufficient-evidence") return `${VERDICT[meta.verdict]} (${meta.judges.spoken} of 3 judges spoke)`;
  return `${VERDICT[meta.verdict]} (${meta.judges.agreeing} of ${meta.judges.spoken})`;
}

/**
 * A rule file by id.
 * @param {string} id
 * @returns {{ file: string, meta: any, level: "rule" | "guideline", verdict: string }}
 */
export function readRule(id) {
  const file = listMarkdown(join(repoRoot, "rules")).find((f) => f.endsWith(`/${id}.md`));
  if (!file) throw new Error(`no rule file for ${id}`);
  const m = readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error(`${file}: frontmatter is missing`);
  const meta = parse(m[1]);
  return { file, meta, level: deriveLevel(String(meta.verdict)), verdict: verdictText(meta) };
}
