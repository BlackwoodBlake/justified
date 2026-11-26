/**
 * examples.test.js: lints the live examples and the reference components
 * with `recommended`.
 *
 * Each `examples/rules/<ID>.tsx` lists its examples as objects with
 * `kind: "do"` or `kind: "dont"` and a `Demo`. A report belongs to an
 * example when it lies in code that example's Demo renders: the Demo
 * itself, or a component declared in the same file that the Demo reaches,
 * directly or through other components.
 *
 *   - A report in code any Do reaches fails the test: Do code follows the
 *     rules, so the lint rule is too strict.
 *   - A report in helper files (`examples/rules/<lower-case>.tsx`), in the
 *     reference components (`adapters/shadcn/src`) or in code no Don't
 *     reaches alone fails too, since that code is shared with Do examples.
 *   - A report in code only Don'ts reach is a catch. The test prints, per
 *     lint rule, how many of its own rule's Don't examples it catches.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { it } from "node:test";

import tsParser from "@typescript-eslint/parser";
import { Linter } from "eslint";

import plugin from "../index.js";
import { examplesOf } from "./example-map.js";
import { repoRoot } from "./helpers.js";

const linter = new Linter({ configType: "flat" });
const config = [
  {
    files: ["**/*.tsx", "**/*.ts"],
    languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } },
    // The examples' own disable comments name rules from other plugins, and must never switch ours off.
    linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: "off" },
  },
  { files: ["**/*.tsx", "**/*.ts"], ...plugin.configs.recommended },
];

const list = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return list(path);
    return /\.tsx?$/.test(path) ? [path] : [];
  });

const exampleDir = join(repoRoot, "examples", "rules");
const files = [...list(exampleDir), ...list(join(repoRoot, "adapters", "shadcn", "src"))].sort();
const isRuleFile = (path) => path.startsWith(exampleDir) && /^[A-Z]{3}-\d{3}[a-z]?\.tsx$/.test(basename(path));

const inside = (line, ranges) => ranges.some(([a, b]) => line >= a && line <= b);

const idOf = (ruleId) => /** @type {any} */ (plugin.rules[ruleId.replace(/^justified\//, "")]?.meta?.docs)?.justifiedId;

it("reports nothing in Do examples or shared code, and prints the Don't hit rate", () => {
  const problems = [];
  /** Per Justified id: Don't examples in its own file, and how many its lint rules catch. */
  const rate = new Map(Object.values(plugin.rules).map((r) => [/** @type {any} */ (r.meta.docs).justifiedId, { donts: 0, caught: 0, other: [] }]));

  for (const path of files) {
    const code = readFileSync(path, "utf8");
    const filename = relative(repoRoot, path);
    const all = linter.verify(code, config, { filename });
    assert.deepEqual(all.filter((m) => m.fatal), [], `${filename} did not parse`);
    const messages = all.filter((m) => m.ruleId?.startsWith("justified/"));

    if (!isRuleFile(path)) {
      for (const m of messages) problems.push(`${filename}:${m.line} ${m.ruleId} in shared code: ${m.message}`);
      continue;
    }
    const examples = examplesOf(code);
    const fileId = basename(path, ".tsx");
    const dos = examples.filter((e) => e.kind === "do");
    const donts = examples.filter((e) => e.kind === "dont");
    for (const m of messages) {
      const inDo = dos.find((e) => inside(m.line, e.ranges));
      const inDont = donts.find((e) => inside(m.line, e.ranges));
      if (inDo) problems.push(`${filename}:${m.line} ${m.ruleId} in the Do "${inDo.title}": ${m.message}`);
      else if (!inDont) problems.push(`${filename}:${m.line} ${m.ruleId} outside any Don't: ${m.message}`);
      else if (idOf(m.ruleId) !== fileId) rate.get(idOf(m.ruleId))?.other.push(`${fileId} "${inDont.title}"`);
    }
    const entry = rate.get(fileId);
    if (entry) {
      entry.donts += donts.length;
      entry.caught += donts.filter((e) => messages.some((m) => idOf(m.ruleId) === fileId && inside(m.line, e.ranges))).length;
    }
  }

  const out = [`Don't examples caught, per lint rule (${files.length} files linted):`];
  for (const [name, rule] of Object.entries(plugin.rules)) {
    const id = /** @type {any} */ (rule.meta.docs).justifiedId;
    const r = rate.get(id);
    out.push(`  justified/${name} (${id}): ${r.caught} of ${r.donts}${r.other.length ? `; also in ${r.other.join(", ")}` : ""}`);
  }
  console.log(out.join("\n"));
  assert.deepEqual(problems, []);
});
