/**
 * rules.test.js: the helpers checked against the rule files, without a
 * browser. Part of `npm test`.
 *
 * For every rule a helper checks: the rule file exists and says
 * `check: runtime`, its level and verdict match RULES (so a changed verdict
 * fails here instead of showing an old one), a finding starts with the
 * right prefix, links the rule's page and avoids words we never use, and
 * the README's table has a row for it.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

import { deriveLevel } from "../../../scripts/level.ts";
import * as api from "../index.js";
import { JustifiedFinding, RULES, ruleUrl } from "../lib/report.js";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const sources = ["dialogs.js", "title.js", "announce.js", "input.js", "motion.js"].map((f) =>
  readFileSync(new URL(`../lib/${f}`, import.meta.url), "utf8"),
);

/** Claims a finding never makes (see CONTENT.md). */
const NEVER = /violat|non-?compliant|\bcompliant\b|not accessible|inaccessible|certif|guarantee|approved|fails? wcag|wcag failure/i;

/**
 * Rules whose file says `check: review`, because most of the rule takes
 * judgement, but whose helper checks the part that shows only when the page
 * runs. If such a file changes to `check: runtime`, take it off this list.
 */
const ALSO_REVIEW = {
  "FRM-012a":
    "FRM-012a is check: review, since whether a notice tells people enough takes judgement; the helper checks the context change in the running page.",
};

const VERDICT = { requirement: "Requirement", unanimous: "Unanimous", majority: "Majority", split: "Split" };

/** @param {string} dir @returns {string[]} */
const markdown = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return markdown(path);
    return path.endsWith(".md") ? [path] : [];
  });

/** @param {string} id */
function readRule(id) {
  const file = markdown(join(root, "rules")).find((f) => f.endsWith(`/${id}.md`));
  assert.ok(file, `no rule file for ${id}`);
  const meta = parse(readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "");
  const verdict =
    meta.verdict === "requirement"
      ? "Requirement"
      : meta.verdict === "insufficient-evidence"
        ? `Insufficient evidence (${meta.judges.spoken} of 3 judges spoke)`
        : `${VERDICT[meta.verdict]} (${meta.judges.agreeing} of ${meta.judges.spoken})`;
  return { meta, level: deriveLevel(String(meta.verdict)), verdict };
}

describe("package", () => {
  it("exports the seven helpers", () => {
    for (const name of [
      "expectFocusReturns",
      "expectFocusInside",
      "expectTitleChangesOnNavigate",
      "expectEscapeCloses",
      "expectAnnounced",
      "expectNoContextChangeOnInput",
      "expectReducedMotion",
    ]) {
      assert.equal(typeof api[name], "function", name);
    }
  });

  it("never claims what CONTENT.md rules out, in any finding", () => {
    for (const source of sources) {
      for (const [, text] of source.matchAll(/new JustifiedFinding\(\s*"[^"]+",\s*`([^`]+)`/g)) assert.doesNotMatch(text, NEVER);
    }
  });

  it("ends the README with the closing line", () => {
    assert.match(readme, /Automated checks find some problems, not all\. Test with real people and assistive technology\./);
  });
});

for (const [id, rule] of Object.entries(RULES)) {
  describe(id, () => {
    const source = readRule(id);

    it("is a rule checked at runtime", () => {
      assert.equal(source.meta.check, ALSO_REVIEW[id] ? "review" : "runtime", ALSO_REVIEW[id]);
    });

    it("has the rule file's level and verdict", () => {
      assert.equal(rule.level, source.level);
      assert.equal(rule.verdict, source.verdict);
    });

    it("says may break, with the level, the verdict and the page", () => {
      const finding = new JustifiedFinding(id, "what happened. How to fix it.");
      assert.ok(finding.message.startsWith(`May break ${id} (${rule.level}, ${rule.verdict}): `));
      assert.ok(finding.message.endsWith(ruleUrl(id)));
      assert.equal(ruleUrl(id), `https://blackwoodblake.com/design-system/patterns/${id.toLowerCase()}/`);
    });

    it("has a row in the README", () => {
      assert.ok(readme.includes(`[${id}](${ruleUrl(id)})`), `no README row links ${id}`);
    });
  });
}
