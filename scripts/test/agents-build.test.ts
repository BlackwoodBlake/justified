/**
 * Tests on what adapters/agents/scripts/build.ts wrote: every file that tells
 * an agent how to work carries the override text. They read dist/, so they
 * skip when the build has not run (the build itself checks the same in CI).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const dist = join(import.meta.dirname, "..", "..", "adapters", "agents", "dist");
const read = (f: string) => readFileSync(join(dist, f), "utf8");
const built = existsSync(join(dist, "AGENTS.md"));

describe("agent files read justified.json", { skip: !built && "run npm run build first" }, () => {
  for (const f of ["skills/justified/SKILL.md", "AGENTS.md", "AGENTS-full.md"]) {
    it(`${f} has the overrides section after Rules and guidelines`, () => {
      const t = read(f);
      const at = t.indexOf("## Your project's overrides");
      assert.ok(at > t.indexOf("## Rules and guidelines"), "section missing or out of place");
      for (const word of ["justified.json", "**off:**", "**guideline:**", "**note:**", "rule_version", "silently"]) {
        assert.ok(t.includes(word), `${word} missing`);
      }
    });
  }

  it("the review skill reports overrides before Rules", () => {
    const t = read("skills/justified-review/SKILL.md");
    const over = t.indexOf("### Overridden by the project");
    assert.ok(over > 0 && over < t.indexOf("### Rules\n"));
    assert.ok(t.includes("### Overrides to look at"));
    assert.ok(t.includes("No problems found against the rules the project follows."));
    assert.ok(t.includes("No problems found against Justified's rules."));
  });

  it("no file calls an overridden id passed, fine or resolved", () => {
    for (const f of ["skills/justified/SKILL.md", "skills/justified-review/SKILL.md"]) {
      assert.doesNotMatch(read(f), /\b(waiver|exemption|allowed by Justified)\b/i);
    }
  });
});
