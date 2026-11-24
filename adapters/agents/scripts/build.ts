#!/usr/bin/env node
/**
 * build.ts: turns the rules into instructions for coding agents.
 *
 *   dist/AGENTS.md                         every rule sentence, grouped by
 *                                          level, with a link to the full rule
 *   dist/skills/justified/SKILL.md         the same as a skill for Claude Code
 *   dist/rules/<id>.md                     one full rule per file: Why, Do,
 *   dist/skills/justified/rules/<id>.md    Don't and Exceptions
 *   dist/AGENTS-full.md                    everything in one file, for agents
 *                                          that cannot open links
 *
 * The short files are what an agent keeps in mind; it opens a full rule
 * only when its work touches that rule. Reads
 * packages/patterns/dist/rules.json, so run the patterns build first (the
 * root `npm run build` does). The website serves dist/ at
 * /design-system/agents/. Rule texts are CC BY 4.0; the files say so.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

type Rule = {
  id: string;
  title: string;
  area: string;
  status: string;
  verdict: string;
  level: "rule" | "guideline";
  judges: { spoken: number; agreeing: number };
  body: string;
};

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const rulesFile = here("../../../packages/patterns/dist/rules.json");
const out = here("../dist/");
const SITE = "https://blackwoodblake.com/design-system";

if (!existsSync(rulesFile)) {
  console.error("agents: packages/patterns/dist/rules.json is missing; run the patterns build first");
  process.exit(2);
}
const rules = JSON.parse(readFileSync(rulesFile, "utf8")) as Rule[];

const VERDICT: Record<string, string> = {
  requirement: "Requirement",
  unanimous: "Unanimous",
  majority: "Majority",
  split: "Split",
  "insufficient-evidence": "Insufficient evidence",
};
// Insufficient evidence says how many of the three judges spoke; the others say how many agreed of those who spoke.
const verdict = (r: Rule) =>
  r.verdict === "requirement"
    ? VERDICT[r.verdict]
    : r.verdict === "insufficient-evidence"
      ? `${VERDICT[r.verdict]} (${r.judges.spoken} of 3 judges spoke)`
      : `${VERDICT[r.verdict]} (${r.judges.agreeing} of ${r.judges.spoken})`;
const levelName = (r: Rule) => (r.level === "guideline" ? "Guideline, our choice" : "Rule");
const file = (r: Rule) => `${r.id.toLowerCase()}.md`;
const page = (r: Rule) => `${SITE}/patterns/${r.id.toLowerCase()}/`;

/** The "## Rule" section as one paragraph. */
function sentence(r: Rule): string {
  const m = r.body.match(/## Rule\s+([\s\S]*?)(?:\n## |$)/);
  return (m?.[1] ?? "").replace(/\s*\n\s*/g, " ").trim();
}

/** Section headings inside a rule move down one level, under the rule's own heading. */
const demote = (body: string) => body.replace(/^(#{2,4}) /gm, (_m, h: string) => `${h}# `);

const GROUPS: { heading: string; note: string; has: (r: Rule) => boolean }[] = [
  {
    heading: "Rules that WCAG 2.2 AA requires",
    note: "A WCAG 2.2 Level AA criterion requires the behaviour. Where a rule adds advice of our own, the rule says so.",
    has: (r) => r.verdict === "requirement",
  },
  {
    heading: "Rules the judges decide",
    note: "No WCAG criterion requires these. Most or all of the design systems that addressed the question support them.",
    has: (r) => r.level === "rule" && r.verdict !== "requirement",
  },
  {
    heading: "Guidelines, our choice",
    note: "The design systems are divided, or fewer than two have addressed the question. We chose, and each guideline gives our reasons. A product that chooses otherwise is not wrong.",
    has: (r) => r.level === "guideline",
  },
];

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const nRules = rules.filter((r) => r.level === "rule").length;
const nGuidelines = rules.length - nRules;
const total = `${count(nRules, "rule", "rules")} and ${count(nGuidelines, "guideline", "guidelines")}`;

const intro = (fullRule: string) => `These are the behaviour rules of Justified by Blackwood & Blake: how forms, buttons, dialogs and other parts of an interface should behave in a shadcn app. Each one was tried against WCAG 2.2 and weighed by established design systems; the verdict says how strongly they agree. Following them helps you work toward WCAG 2.2 AA. It does not make a product compliant on its own and is not a certification.

## How to use this file

- This file holds ${total}, each as one short statement. Keep them in mind whenever you build, change or review interface code.
- ${fullRule}
- Prefer Justified's components where they exist. They already follow the rules. Install them with the shadcn CLI, for example \`npx shadcn@latest add ${SITE}/r/field.json\`, and the theme with \`npx shadcn@latest add ${SITE}/r/justified-theme.json\`.
- When you review code, name each rule by its id, for example "FRM-002a".
- Entries marked "proposed" are complete but may still change. The others are decided: what they ask is not expected to change, though their wording may still be made clearer.

## Rules and guidelines

- **A rule that WCAG requires:** follow it. If the person you work for asks for something else, do what they ask, and tell them that a WCAG 2.2 Level AA criterion is involved, by number and name.
- **Any other rule:** follow it. If the person you work for asks for something else, do what they ask, and tell them which rule it departs from and why the rule exists.
- **A guideline:** follow it where the project has no convention of its own. Where the project already does it another way, keep the project's way and say nothing.
- **When two apply:** a rule that WCAG requires comes before other rules, a narrower rule before a wider one, and any rule before a guideline.

Every rule and guideline, with its verdict and the sources behind it: ${SITE}/patterns/`;

const entry = (r: Rule, link: (r: Rule) => string) =>
  `- **${r.id}** ${sentence(r)} ${verdict(r)}${r.status === "decided" || r.status === "stable" ? "" : `, ${r.status}`}. [Full rule](${link(r)})`;

const list = (link: (r: Rule) => string) =>
  GROUPS.filter((g) => rules.some(g.has))
    .map((g) => `## ${g.heading}\n\n${g.note}\n\n${rules.filter(g.has).map((r) => entry(r, link)).join("\n")}`)
    .join("\n\n");

const licence = `---

Rule texts © Carl Magnus Swahn and Justified contributors, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Generated from ${total}.`;

const one = (r: Rule) => `# ${r.id} ${r.title}

${levelName(r)}. Verdict: ${verdict(r)}. Status: ${r.status}. ${page(r)}

${r.body}

${licence}
`;

const skill = `---
name: justified
description: Behaviour rules from Justified by Blackwood & Blake for shadcn apps. Use when building, changing or reviewing interface code with forms, fields, labels, validation, buttons, dialogs, toasts, error messages, loading states, tooltips, links, keyboard focus or layout.
---

# Justified behaviour rules

${intro(`Before you write or review code that an entry covers, read its full rule: Why, Do, Don't and Exceptions. It is in \`rules/<id>.md\` next to this file if that folder was installed, and otherwise at the link after the entry. Apply the exceptions only as written.`)}

${list((r) => `${SITE}/agents/rules/${file(r)}`)}

${licence}
`;

const agents = `# Justified behaviour rules

${intro(`Before you write or review code that an entry covers, read its full rule at the link after it: Why, Do, Don't and Exceptions. Apply the exceptions only as written.`)}

${list((r) => `${SITE}/agents/rules/${file(r)}`)}

${licence}
`;

const full = `# Justified behaviour rules

${intro("Each entry is followed further down by its full rule: Why, Do, Don't and Exceptions. Apply the exceptions only as written.")}

${list((r) => `#${r.id.toLowerCase()}`)}

${rules.map((r) => `<a id="${r.id.toLowerCase()}"></a>\n\n## ${r.id} ${r.title}\n\n${levelName(r)}. Verdict: ${verdict(r)}. Status: ${r.status}. ${page(r)}\n\n${demote(r.body)}`).join("\n\n")}

${licence}
`;

rmSync(out, { recursive: true, force: true });
for (const dir of [join(out, "rules"), join(out, "skills", "justified", "rules")]) {
  mkdirSync(dir, { recursive: true });
  for (const r of rules) writeFileSync(join(dir, file(r)), one(r));
}
writeFileSync(join(out, "skills", "justified", "SKILL.md"), skill);
writeFileSync(join(out, "AGENTS.md"), agents);
writeFileSync(join(out, "AGENTS-full.md"), full);
console.log(`agents: wrote SKILL.md, AGENTS.md, AGENTS-full.md and ${rules.length} rule file(s) (${total})`);
