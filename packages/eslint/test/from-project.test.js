/**
 * from-project.test.js: `fromProject` and the generated rule data.
 *
 * Each case writes a justified.json into a temporary folder and reads the
 * config objects back. The last tests run ESLint itself on a small project.
 */
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path, { join } from "node:path";
import { describe, it } from "node:test";

import tsParser from "@typescript-eslint/parser";
import { Linter } from "eslint";
import { parse } from "yaml";

import { buildIds, buildSchema, json } from "../../../adapters/agents/scripts/ids.ts";
import plugin, { fromProject } from "../index.js";
import { rebaseGlob } from "../lib/from-project.js";
import { repoRoot } from "./helpers.js";

const REASON = "The admin screens follow their own convention.";

/** A temporary folder with files. @param {Record<string, string | object>} files */
function project(files) {
  const root = mkdtempSync(join(tmpdir(), "justified-project-"));
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(path.dirname(join(root, name)), { recursive: true });
    writeFileSync(join(root, name), typeof content === "string" ? content : JSON.stringify(content));
  }
  return root;
}

/** Overrides in a justified.json at the root. @param {object[]} overrides */
const withOverrides = (overrides) => project({ "justified.json": { justified: "0.5.0", overrides } });

/** Runs fromProject and collects the warnings. */
function load(dir, options) {
  const warnings = [];
  const configs = fromProject(dir, { ...options, onWarning: (m) => warnings.push(m) });
  return { configs, warnings };
}

const entry = (id, extra = {}) => ({ id, action: "off", reason: REASON, ...extra });
const rulesOf = (config) => config.rules ?? {};

describe("rule data", () => {
  const rulesDir = join(repoRoot, "rules");
  const files = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? files(join(dir, n)) : n.endsWith(".md") ? [join(dir, n)] : []));
  const frontmatter = files(rulesDir).map((f) => parse(readFileSync(f, "utf8").match(/^---\n([\s\S]*?)\n---/)[1]));
  const ids = buildIds(frontmatter);

  it("ids.json matches the rule files (run `npm run build`)", () => {
    assert.equal(readFileSync(new URL("../ids.json", import.meta.url), "utf8"), json(ids));
  });

  it("justified.schema.json matches the rule files (run `npm run build`)", () => {
    assert.equal(readFileSync(new URL("../justified.schema.json", import.meta.url), "utf8"), json(buildSchema(ids)));
  });

  it("names the WCAG criteria of every requirement", () => {
    for (const r of ids.filter((i) => i.verdict === "Requirement")) assert.ok(r.wcag?.length, `${r.id} has no criterion`);
  });

  it("the schema asks for a reason of at least 20 characters", () => {
    const schema = buildSchema(ids);
    assert.equal(schema.properties.overrides.items.properties.reason.minLength, 20);
  });
});

describe("fromProject without a file", () => {
  it("returns just recommended", () => {
    const { configs, warnings } = load(project({}), { file: "no-such-justified.json" });
    assert.deepEqual(configs, [plugin.configs.recommended]);
    assert.deepEqual(warnings, []);
  });

  it("limits recommended to files", () => {
    const { configs } = load(project({}), { file: "no-such-justified.json", files: ["**/*.tsx"] });
    assert.deepEqual(configs[0].files, ["**/*.tsx"]);
    assert.equal(configs[0].rules, plugin.configs.recommended.rules);
  });

  it("is also on the plugin", () => {
    assert.equal(plugin.fromProject, fromProject);
  });
});

describe("fromProject translation", () => {
  it("turns off every lint rule of an id, in one shared object", () => {
    const { configs } = load(withOverrides([entry("STR-005", { reason: REASON })]));
    assert.equal(configs.length, 2);
    assert.deepEqual(configs[1].rules, { "justified/meaningful-alt": "off", "justified/svg-hidden-or-named": "off" });
    assert.equal(configs[1].files, undefined);
    assert.equal(configs[1].plugins.justified, plugin);
  });

  it("narrows to lint_rules", () => {
    const { configs } = load(withOverrides([entry("STR-005", { lint_rules: ["justified/meaningful-alt"] })]));
    assert.deepEqual(configs[1].rules, { "justified/meaningful-alt": "off" });
  });

  it("throws for a lint rule that belongs to another id", () => {
    const dir = withOverrides([entry("STR-005", { lint_rules: ["justified/submit-stays-enabled"] })]);
    assert.throws(() => load(dir), /justified\.json.*overrides\[0\] \(STR-005\).*not a lint rule of STR-005/);
  });

  it("gives each override with files its own object, after the shared one", () => {
    const { configs } = load(withOverrides([entry("ACT-004", { files: ["src/admin/**"] }), entry("STR-005")]));
    assert.equal(configs.length, 3);
    assert.deepEqual(configs[1].rules, { "justified/meaningful-alt": "off", "justified/svg-hidden-or-named": "off" });
    assert.deepEqual(configs[2].files, ["src/admin/**"]);
    assert.deepEqual(configs[2].rules, { "justified/submit-stays-enabled": "off" });
  });

  it("keeps the files option as an outer limit on scoped overrides", () => {
    const { configs } = load(withOverrides([entry("ACT-004", { files: ["src/admin/**"] })]), { files: ["**/*.tsx"] });
    assert.deepEqual(configs[1].files, [["src/admin/**", "**/*.tsx"]]);
  });

  it("guideline on a rule gives a warning level", () => {
    const { configs, warnings } = load(withOverrides([entry("ACT-003a", { action: "guideline" })]));
    assert.deepEqual(configs[1].rules, { "justified/confirm-button-last": "warn" });
    assert.deepEqual(warnings, []);
  });

  it("guideline on a guideline changes nothing and says so", () => {
    const { configs, warnings } = load(withOverrides([entry("ACT-004", { action: "guideline" })]));
    assert.equal(configs.length, 1);
    assert.match(warnings.join("\n"), /ACT-004 is already a guideline/);
  });

  it("guideline on a requirement is an error", () => {
    const dir = withOverrides([entry("KBD-001", { action: "guideline" })]);
    assert.throws(() => load(dir), /overrides\[0\] \(KBD-001\).*requirement/);
  });

  it("note changes nothing", () => {
    const { configs, warnings } = load(withOverrides([entry("KBD-001", { action: "note" })]));
    assert.equal(configs.length, 1);
    assert.deepEqual(warnings, []);
  });

  it("an id without a lint rule gives no config and no error", () => {
    const { configs, warnings } = load(withOverrides([entry("FRM-004b")]));
    assert.equal(configs.length, 1);
    assert.deepEqual(warnings, []);
  });
});

describe("fromProject unknown ids", () => {
  it("warns by default, naming the id and the file", () => {
    const { configs, warnings } = load(withOverrides([entry("ZZZ-999")]));
    assert.equal(configs.length, 1);
    assert.match(warnings[0], /ZZZ-999/);
    assert.match(warnings[0], /justified\.json/);
  });

  it("throws with strict", () => {
    assert.throws(() => load(withOverrides([entry("ZZZ-999")]), { strict: true }), /ZZZ-999.*not a Justified id/);
  });
});

describe("fromProject malformed files", () => {
  const bad = (name, overrides, pattern) =>
    it(name, () => assert.throws(() => load(typeof overrides === "string" ? project({ "justified.json": overrides }) : withOverrides(overrides)), pattern));

  bad("bad JSON", "{ nope", /justified\.json.*JSON/);
  bad("missing reason", [{ id: "ACT-004", action: "off" }], /overrides\[0\] \(ACT-004\).*reason/);
  bad("short reason", [entry("ACT-004", { reason: "too short" })], /reason.*20/);
  bad("unknown action", [entry("ACT-004", { action: "skip" })], /action/);
  bad("unknown field", [entry("ACT-004", { why: "x" })], /unknown field "why"/);
  bad("a wildcard id", [entry("ACT-*")], /exact id/);
  bad("a negated glob", [entry("ACT-004", { files: ["src/**", "!src/a/**"] })], /positive globs/);
  bad("empty files", [entry("ACT-004", { files: [] })], /files/);
  bad("bad review_by", [entry("ACT-004", { review_by: "next spring" })], /review_by/);
  bad("bad rule_version", [entry("ACT-004", { rule_version: "1" })], /rule_version/);
  bad("the same id twice for the same files", [entry("ACT-004", { files: ["src/**"] }), entry("ACT-004", { files: ["src/**"] })], /overrides\[1\] \(ACT-004\).*twice/);
  bad("the same id twice for the whole project", [entry("ACT-004"), entry("ACT-004")], /twice/);
  bad("unknown top-level field", '{"overrides": [], "extra": 1}', /unknown field "extra"/);
  bad("no overrides list", "{}", /overrides/);

  it("allows the same id for different files", () => {
    assert.doesNotThrow(() => load(withOverrides([entry("ACT-004", { files: ["a/**"] }), entry("ACT-004", { files: ["b/**"] })])));
  });
});

describe("fromProject versions, requirements and dates", () => {
  it("warns when the rule's major version is newer", () => {
    const { configs, warnings } = load(withOverrides([entry("ACT-004", { rule_version: "0.9.0" })]));
    assert.match(warnings[0], /has changed since this override was written/);
    assert.deepEqual(configs[1].rules, { "justified/submit-stays-enabled": "off" });
  });

  it("does not warn for a minor or patch difference, or when there is no rule_version", () => {
    assert.deepEqual(load(withOverrides([entry("ACT-004", { rule_version: "1.0.0" })])).warnings, []);
    assert.deepEqual(load(withOverrides([entry("ACT-004")])).warnings, []);
  });

  it("says once per requirement that is turned off, naming the criteria", () => {
    const { warnings } = load(withOverrides([entry("KBD-001", { files: ["a/**"] }), entry("KBD-001", { files: ["b/**"] })]));
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /KBD-001/);
    assert.match(warnings[0], /WCAG 2\.2 2\.1\.1 Keyboard/);
    assert.match(warnings[0], /your project's decision/);
    assert.match(warnings[0], /still involved/);
  });

  it("ignores review_by, whatever the date", () => {
    const past = load(withOverrides([entry("ACT-004", { review_by: "2001-01-01" })]));
    const future = load(withOverrides([entry("ACT-004", { review_by: "2999-01-01" })]));
    assert.deepEqual(past.configs.map(rulesOf), future.configs.map(rulesOf));
    assert.deepEqual(past.warnings, []);
  });
});

describe("fromProject in a monorepo", () => {
  const root = project({
    "justified.json": { overrides: [entry("ACT-004", { files: ["packages/app/src/admin/**"] }), entry("STR-005", { files: ["packages/other/**"] }), entry("KBD-001", { files: ["packages/*/legacy/**"] }), entry("FRM-004b", { files: ["**/x/**"] })] },
    "packages/app/eslint.config.js": "",
  });
  const app = join(root, "packages/app");

  it("finds the nearest file upwards and rewrites globs to the config's folder", () => {
    const { configs } = load(app);
    const byRule = Object.fromEntries(configs.slice(1).map((c) => [Object.keys(c.rules)[0], c.files]));
    assert.deepEqual(byRule["justified/submit-stays-enabled"], ["src/admin/**"]);
    assert.deepEqual(byRule["justified/focus-stays-visible"], ["legacy/**"]);
  });

  it("leaves out a glob for another package, since flat config cannot reach it", () => {
    const { configs } = load(app);
    assert.ok(!configs.slice(1).some((c) => rulesOf(c)["justified/meaningful-alt"]));
  });

  it("rebases globs", () => {
    assert.equal(rebaseGlob("packages/app/src/**", "packages/app"), "src/**");
    assert.equal(rebaseGlob("packages/app", "packages/app"), "**");
    assert.equal(rebaseGlob("packages/**/src/*.tsx", "packages/app"), "**/src/*.tsx");
    assert.equal(rebaseGlob("**/a.tsx", "packages/app"), "**/a.tsx");
    assert.equal(rebaseGlob("src/**", "packages/app"), undefined);
    assert.equal(rebaseGlob("src/**", ""), "src/**");
  });
});

describe("fromProject with ESLint", () => {
  const code = `export const A = () => <button className="rounded px-2 outline-none" onClick={go}>Search tickets</button>;\n`;
  const root = project({ "justified.json": { overrides: [entry("KBD-001", { lint_rules: ["justified/focus-stays-visible"], files: ["src/admin/**"] })] } });

  const lint = (filename, configs) => {
    const linter = new Linter({ configType: "flat", cwd: root });
    const base = { files: ["**/*.tsx"], languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } } };
    return linter.verify(code, [base, ...configs], { filename: join(root, filename) }).map((m) => m.ruleId);
  };
  const { configs } = load(root, { files: ["**/*.tsx"] });

  it("reports the rule outside the listed folder", () => {
    assert.ok(lint("src/shop/a.tsx", configs).includes("justified/focus-stays-visible"));
  });

  it("does not report it inside the listed folder", () => {
    assert.ok(!lint("src/admin/a.tsx", configs).includes("justified/focus-stays-visible"));
  });

  it("keeps other lint rules on in the listed folder", () => {
    const other = `export const A = () => <Button variant="ghost" size="icon" aria-label="Delete note" className="opacity-0 hover:opacity-100"><Trash2 /></Button>;\n`;
    const linter = new Linter({ configType: "flat", cwd: root });
    const base = { files: ["**/*.tsx"], languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } } };
    const ids = linter.verify(other, [base, ...configs], { filename: join(root, "src/admin/b.tsx") }).map((m) => m.ruleId);
    assert.ok(ids.includes("justified/hover-controls-on-focus"), JSON.stringify(ids));
  });
});
