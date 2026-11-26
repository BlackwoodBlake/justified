/**
 * Tests for scripts/similarity.ts, on a made-up source excerpt and rule in a
 * temporary folder.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";

const SCRIPT = join(import.meta.dirname, "..", "similarity.ts");
const TSX = join(import.meta.dirname, "..", "..", "node_modules", ".bin", "tsx");
const temps: string[] = [];
after(() => temps.forEach((t) => rmSync(t, { recursive: true, force: true })));

/** A made-up source sentence. */
const SOURCE = "Purple elephants quietly rearrange hexagonal biscuits beneath moonlit lighthouse staircases every Thursday.";
const COPIED = "Purple elephants quietly rearrange hexagonal biscuits beneath moonlit lighthouse staircases";

function rule(fields: { title?: string; how?: string; note?: string; body?: string }) {
  return `---
id: ACT-001
title: ${fields.title ?? "Start a button with a verb"}
short: Verb first
how_to_check:
  - '${fields.how ?? "A button whose text is only OK."}'
changelog:
  - version: "1.0.0"
    date: 2026-11-26
    note: ${fields.note ?? "First version."}
---

## Rule

${fields.body ?? "Start the label of an action button with a verb."}
`;
}

/** Runs the check on one file. The temporary folder is not rules/, so the frontmatter is compared only when asked. */
function run(text: string, frontmatter: string[] = ["--frontmatter", "yes"]) {
  const root = mkdtempSync(join(tmpdir(), "similarity-"));
  temps.push(root);
  mkdirSync(join(root, "rules"));
  mkdirSync(join(root, "sources"));
  writeFileSync(join(root, "rules", "ACT-001.md"), text);
  writeFileSync(join(root, "sources", "made-up.txt"), SOURCE);
  const res = spawnSync(
    TSX,
    [SCRIPT, "--rules", join(root, "rules"), "--sources", join(root, "sources"), "--allow", join(root, "none.txt"), ...frontmatter],
    { encoding: "utf8" },
  );
  return { status: res.status, out: res.stdout + res.stderr };
}

describe("similarity", () => {
  it("passes a rule in its own words", () => {
    const r = run(rule({}));
    assert.equal(r.status, 0, r.out);
  });

  for (const [field, text] of [
    ["the body", rule({ body: COPIED })],
    ["the title", rule({ title: COPIED })],
    ["how_to_check", rule({ how: COPIED })],
    ["a changelog note", rule({ note: COPIED })],
  ] as const) {
    it(`finds source text in ${field}`, () => {
      const r = run(text);
      assert.equal(r.status, 1, r.out);
      assert.match(r.out, /shared with made-up\.txt/);
    });
  }

  it("reports the line the copied field is on", () => {
    const r = run(rule({ how: COPIED }));
    assert.match(r.out, /ACT-001\.md:6\n/);
  });

  it("does not build a run across two fields", () => {
    // Four words end the title and the next three start the short name: no single text holds all seven.
    const text = rule({ title: "Purple elephants quietly rearrange" }).replace("short: Verb first", "short: hexagonal biscuits beneath");
    const r = run(text);
    assert.equal(r.status, 0, r.out);
  });

  it("compares only the body outside the published folders, such as an analysis", () => {
    assert.equal(run(rule({ title: COPIED }), []).status, 0);
    assert.equal(run(rule({ body: COPIED }), []).status, 1);
  });
});
