/**
 * plugin.test.js: the plugin as a whole, checked against the rule files.
 *
 * For every lint rule: its id points at a rule file, its level and verdict
 * match that file (so a changed verdict fails here instead of showing an
 * old one), every message starts with the right prefix and avoids words we
 * never use, `recommended` sets "error" for a rule and "warn" for a
 * guideline, and the rule has its own test file. Also checks that
 * rules/index.js is up to date.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { messagePrefix, GUIDELINE_NOTE } from "../lib/define-rule.js";
import plugin from "../index.js";
import { renderIndex } from "../scripts/build-index.js";
import { readRule } from "./helpers.js";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

/** Claims a message never makes (see CONTENT.md). */
const NEVER = /violat|non-?compliant|\bcompliant\b|not accessible|inaccessible|certif|guarantee|approved|fails? wcag|wcag failure/i;

describe("plugin", () => {
  it("has meta from package.json", () => {
    assert.equal(plugin.meta.name, pkg.name);
    assert.equal(plugin.meta.version, pkg.version);
  });

  it("has an up-to-date rules/index.js (run `npm run index --workspace packages/eslint`)", () => {
    const current = readFileSync(new URL("../rules/index.js", import.meta.url), "utf8");
    assert.equal(current, renderIndex());
  });

  it("recommended turns on every rule and only those", () => {
    const names = Object.keys(plugin.rules).map((n) => `justified/${n}`).sort();
    assert.deepEqual(Object.keys(plugin.configs.recommended.rules).sort(), names);
    assert.equal(plugin.configs.recommended.plugins.justified, plugin);
  });
});

for (const [name, rule] of Object.entries(plugin.rules)) {
  describe(`justified/${name}`, () => {
    const docs = /** @type {any} */ (rule.meta?.docs);

    it("has a readable kebab-case name and a test file", () => {
      assert.match(name, /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/);
      const test = fileURLToPath(new URL(`./rules/${name}.test.js`, import.meta.url));
      assert.ok(existsSync(test), `missing test/rules/${name}.test.js`);
    });

    const source = readRule(docs.justifiedId);

    it(`matches ${docs.justifiedId}'s level and verdict`, () => {
      assert.equal(docs.justifiedLevel, source.level, `level in the rule file is ${source.level}`);
      assert.equal(docs.justifiedVerdict, source.verdict, `verdict in the rule file is ${source.verdict}`);
      const expected = source.level === "guideline" ? "warn" : "error";
      assert.equal(plugin.configs.recommended.rules[`justified/${name}`], expected);
    });

    it("has a row in the README's rule table", () => {
      const row = readme.split("\n").find((l) => l.startsWith(`| \`justified/${name}\` |`));
      assert.ok(row, `add a row for justified/${name} to packages/eslint/README.md`);
      assert.ok(row.includes(docs.justifiedId) && row.includes(source.level === "guideline" ? "| Guideline |" : "| Rule |"));
    });

    it("links to the rule's page", () => {
      assert.equal(docs.url, `https://blackwoodblake.com/design-system/patterns/${docs.justifiedId.toLowerCase()}/`);
      assert.ok(docs.description.length > 10);
    });

    it("words every message the Justified way", () => {
      const prefix = messagePrefix(source.meta.id, source.level, source.verdict);
      const messages = Object.entries(rule.meta?.messages ?? {});
      assert.ok(messages.length > 0);
      for (const [key, text] of messages) {
        assert.doesNotMatch(text, NEVER, `${key} uses a word we never use`);
        if (key.startsWith("suggest")) continue;
        assert.ok(text.startsWith(prefix), `${key} should start with "${prefix}"`);
        if (source.level === "guideline") assert.ok(text.endsWith(GUIDELINE_NOTE), `${key} should say it is our choice`);
      }
    });

    it("rests on a rule checked by reading the code or running it", () => {
      assert.ok(["lint", "runtime", "review"].includes(source.meta.check), `check is ${source.meta.check}`);
      assert.ok(Array.isArray(source.meta.how_to_check) && source.meta.how_to_check.length > 0);
    });
  });
}
