/**
 * Tests for scripts/check-rules.ts. Each case builds a small project in a
 * temporary folder (a rule, the source register, its examples and a stand-in
 * for the lint plugin), breaks one thing and runs the script on it.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";

const SCRIPT = join(import.meta.dirname, "..", "check-rules.ts");
const TSX = join(import.meta.dirname, "..", "..", "node_modules", ".bin", "tsx");
const temps: string[] = [];
after(() => temps.forEach((t) => rmSync(t, { recursive: true, force: true })));

const SOURCES = `
- id: material-buttons
  system: material
  role: judge
  title: Buttons
  url: https://example.com/material/buttons
  read: 2026-11-20
- id: apple-buttons
  system: apple
  role: judge
  title: Buttons
  url: https://example.com/apple/buttons
  read: 2026-11-20
  platform: web
`;

const LAW_SUPPORTS = `
  - criterion: "2.4.6"
    name: Headings and Labels
    url: https://www.w3.org/TR/WCAG22/#headings-and-labels
    relation: supports`;

type Rule = { law?: string; check?: string; extra?: string; body?: string; how?: string; note?: string; file?: string };

function ruleText(r: Rule = {}): string {
  return `---
id: ACT-001
title: Start a button with a verb
short: Verb first
area: actions
status: proposed
version: "1.0.0"
verdict: ${r.law?.includes("requires") ? "requirement" : "unanimous"}
judges: { spoken: 2, agreeing: 2 }
law:${r.law ?? LAW_SUPPORTS}
stances:
  material: { stance: supports, sources: [material-buttons] }
  apple:    { stance: supports, sources: [apple-buttons] }
  carbon:   { stance: silent }
  govuk:    { stance: silent }
  nngroup:  { stance: silent }
conflicts_checked: 2026-11-26
check: ${r.check ?? "review"}
how_to_check:
  - '${r.how ?? "A button whose text is only OK."}'
${r.extra ?? ""}changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: ${r.note ?? "First version."}
---

${r.body ?? `## Rule

Start the label of an action button with a verb.

## Why

People read the first word.

## Do

- Save draft.

## Don't

- OK.

## Exceptions

None.
`}`;
}

const EXAMPLE = `export const ACT001 = { examples: [{ kind: "do" }, { kind: "dont" }] };\n`;
const STORY = `export default { title: "Rules/Actions/ACT-001 Verb first" };\n`;

type Project = { rules?: Record<string, string>; examples?: Record<string, string>; lintIds?: string[] };

function run(p: Project = {}) {
  const root = mkdtempSync(join(tmpdir(), "check-rules-"));
  temps.push(root);
  const write = (path: string, text: string) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  write("sources.yaml", SOURCES);
  for (const [path, text] of Object.entries(p.rules ?? { "actions/ACT-001.md": ruleText() })) write(join("rules", path), text);
  const examples = p.examples ?? { "rules/ACT-001.tsx": EXAMPLE, "stories/rules/ACT-001.stories.tsx": STORY };
  for (const [path, text] of Object.entries(examples)) write(join("examples", path), text);
  mkdirSync(join(root, "examples", "rules"), { recursive: true });
  const lint = Object.fromEntries((p.lintIds ?? []).map((id, i) => [`rule-${i}`, { meta: { docs: { justifiedId: id } } }]));
  write("eslint/index.js", `export default { rules: ${JSON.stringify(lint)} };\n`);
  const res = spawnSync(
    TSX,
    [SCRIPT, "--rules", join(root, "rules"), "--sources", join(root, "sources.yaml"),
      "--examples", join(root, "examples"), "--eslint", join(root, "eslint", "index.js")],
    { encoding: "utf8" },
  );
  return { status: res.status, out: res.stdout + res.stderr };
}

const expectProblem = (p: Project, pattern: RegExp) => {
  const r = run(p);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, pattern);
};

describe("check-rules", () => {
  it("passes a well-formed rule", () => {
    const r = run();
    assert.equal(r.status, 0, r.out);
  });

  describe("law", () => {
    it("rejects a Requirement that rests on a Level AAA criterion", () => {
      const law = `
  - criterion: "2.5.5"
    name: Target Size (Enhanced)
    url: https://www.w3.org/TR/WCAG22/#target-size-enhanced
    relation: requires`;
      expectProblem({ rules: { "actions/ACT-001.md": ruleText({ law }) } }, /Level AAA/);
    });

    it("rejects a criterion that does not exist", () => {
      const law = `
  - criterion: "3.3.12"
    name: Made Up
    url: https://www.w3.org/TR/WCAG22/#made-up
    relation: requires`;
      expectProblem({ rules: { "actions/ACT-001.md": ruleText({ law }) } }, /not a WCAG 2\.2 success criterion/);
    });

    it("rejects a link that does not match the criterion", () => {
      const law = `
  - criterion: "2.4.6"
    name: Headings and Labels
    url: https://www.w3.org/TR/WCAG22/#focus-visible
    relation: requires`;
      expectProblem({ rules: { "actions/ACT-001.md": ruleText({ law }) } }, /url must be https:\/\/www\.w3\.org\/TR\/WCAG22\/#headings-and-labels/);
    });

    it("rejects a name that does not match the criterion", () => {
      const law = `
  - criterion: "2.4.6"
    name: Headings
    url: https://www.w3.org/TR/WCAG22/#headings-and-labels
    relation: supports`;
      expectProblem({ rules: { "actions/ACT-001.md": ruleText({ law }) } }, /name must be "Headings and Labels"/);
    });

    it("accepts a Level AAA criterion that only supports the rule", () => {
      const law = `
  - criterion: "2.5.5"
    name: Target Size (Enhanced)
    url: https://www.w3.org/TR/WCAG22/#target-size-enhanced
    relation: supports`;
      const r = run({ rules: { "actions/ACT-001.md": ruleText({ law }) } });
      assert.equal(r.status, 0, r.out);
    });
  });

  describe("files", () => {
    it("fails on a rule file that does not end in .md", () => {
      for (const name of ["ACT-001.MD", "ACT-001.markdown"])
        expectProblem({ rules: { "actions/ACT-001.md": ruleText(), [`actions/${name.replace("001", "002")}`]: ruleText() } }, /must end in \.md/);
    });

    it("ignores .gitkeep", () => {
      const r = run({ rules: { "actions/ACT-001.md": ruleText(), ".gitkeep": "" } });
      assert.equal(r.status, 0, r.out);
    });
  });

  describe("frontmatter and body", () => {
    it("rejects an unknown frontmatter key", () => {
      expectProblem({ rules: { "actions/ACT-001.md": ruleText({ extra: "severity: high\n" }) } }, /unknown frontmatter key "severity"/);
    });

    it("rejects a body with only the rule section", () => {
      const body = "## Rule\n\nStart the label of an action button with a verb.\n";
      expectProblem({ rules: { "actions/ACT-001.md": ruleText({ body }) } }, /"## Why" section is missing or empty/);
    });

    it("rejects an empty section", () => {
      const body = ruleText().split("---\n\n")[1].replace("People read the first word.\n", "");
      expectProblem({ rules: { "actions/ACT-001.md": ruleText({ body }) } }, /"## Why" section is missing or empty/);
    });

    it("rejects a reference to a rule that does not exist", () => {
      const body = ruleText().split("---\n\n")[1].replace("None.", "See ACT-099.");
      expectProblem({ rules: { "actions/ACT-001.md": ruleText({ body }) } }, /refers to ACT-099, which is not a rule/);
    });

    it("rejects a dead reference in the frontmatter too", () => {
      expectProblem({ rules: { "actions/ACT-001.md": ruleText({ note: "Points to FRM-404." }) } }, /refers to FRM-404/);
    });
  });

  describe("examples", () => {
    it("fails when a rule has no examples file", () => {
      expectProblem({ examples: { "stories/rules/ACT-001.stories.tsx": STORY } }, /examples\/rules\/ACT-001\.tsx is missing/);
    });

    it("fails when the examples have no Don't", () => {
      const examples = { "rules/ACT-001.tsx": `export const ACT001 = { examples: [{ kind: "do" }] };\n`, "stories/rules/ACT-001.stories.tsx": STORY };
      expectProblem({ examples }, /needs at least one Do and one Don't/);
    });

    it("fails when a rule has no stories", () => {
      expectProblem({ examples: { "rules/ACT-001.tsx": EXAMPLE } }, /ACT-001\.stories\.tsx is missing/);
    });
  });

  describe("check and the lint plugin", () => {
    it("fails on check: lint with no lint rule", () => {
      expectProblem({ rules: { "actions/ACT-001.md": ruleText({ check: "lint" }) } }, /check is lint but no lint rule/);
    });

    it("passes check: lint with a lint rule", () => {
      const r = run({ rules: { "actions/ACT-001.md": ruleText({ check: "lint" }) }, lintIds: ["ACT-001"] });
      assert.equal(r.status, 0, r.out);
    });

    it("notes a lint rule on a rule checked another way, without failing", () => {
      const r = run({ lintIds: ["ACT-001"] });
      assert.equal(r.status, 0, r.out);
      assert.match(r.out, /note: .*ACT-001.*check is review/);
    });

    it("fails on a lint rule for a rule that does not exist", () => {
      expectProblem({ lintIds: ["ACT-001", "ACT-002"] }, /lint rule rule-1 is for ACT-002, which is not a rule/);
    });
  });
});
