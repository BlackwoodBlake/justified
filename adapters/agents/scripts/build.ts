#!/usr/bin/env node
/**
 * build.ts: turns the rules into instructions for coding agents.
 *
 *   dist/AGENTS.md                         every rule sentence, grouped by
 *                                          level, with a link to the full rule
 *   dist/skills/justified/SKILL.md         a skill for Claude Code: one line
 *                                          per rule (id, short name and title,
 *                                          the rule in brief), grouped by area
 *   dist/rules/<id>.md                     one full rule per file: Why, Do,
 *   dist/skills/justified/rules/<id>.md    Don't, Exceptions and How to check
 *   dist/AGENTS-full.md                    everything in one file, for agents
 *                                          that cannot open links
 *   dist/skills/justified-review/          a skill that reviews code against
 *     SKILL.md, checks/<area>.md, rules/   the rules: how to work and report,
 *                                          and every rule's how_to_check
 *
 *   dist/ids.json                          every id with its level, verdict,
 *   dist/justified.schema.json             version and WCAG criteria, and the
 *                                          schema for a project's justified.json.
 *                                          Both are also written to
 *                                          packages/eslint, which commits them.
 *
 * With --compact, it also writes a short AGENTS.md that is not part of the
 * package yet (npm run build:compact):
 *
 *   dist/AGENTS-compact.md                 the skill's one-line list as an
 *                                          instructions file
 *
 * The one-line lists are what an agent keeps in mind; it opens a full rule
 * before it writes or reviews code that the line covers. Reads
 * packages/patterns/dist/rules.json, so run the patterns build first (the
 * root `npm run build` does). The website serves dist/ at
 * /design-system/agents/. Rule texts are CC BY 4.0; the files say so.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildIds, buildSchema, json } from "./ids.ts";

type Rule = {
  id: string;
  version: string;
  title: string;
  short: string;
  area: string;
  status: string;
  verdict: string;
  level: "rule" | "guideline";
  judges: { spoken: number; agreeing: number };
  law: { criterion: string; name: string; relation: string }[];
  check: "lint" | "runtime" | "review" | "manual";
  how_to_check: string[];
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
const ids = buildIds(rules);
const ruleVersion = (r: Rule) => String(r.version);
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

/** The section that tells an agent how to read a project's justified.json. */
const overrides = `## Your project's overrides

A project may record its own decisions to depart from a rule or guideline in \`justified.json\` at its root. If the file is there, read it before you build or change interface code. Each entry has an \`id\`, an \`action\`, a \`reason\` and sometimes \`files\`.

- **off:** do not apply that text in the files it lists, or anywhere if it lists none.
- **guideline:** treat the rule as a guideline: follow it where the project has no convention of its own, and keep the project's way where it has one.
- **note:** the text applies in full. The reason is context.

Never apply an override silently. Say once per task which override shaped the work, by id, and give the project's reason.

- Overriding a rule that WCAG requires still involves that criterion. When the work touches it, name it by number and name.
- Do not add, widen or remove an override unless the person asks. When a rule gets in the way, fix the code or ask; never write an override to make a check pass. When asked, write the reason in their words and set \`rule_version\` to the rule's current version.
- If an id does not exist, or \`rule_version\` is below the rule's current major version, tell the person and follow the current rule until they decide.
- When another rule's check refers to an id that is off, such as "as DLG-004 says", that part is off too.
- An override is the project's decision. It is not part of the rule and does not change it. A rule's own exceptions are part of the rule.`;

const intro = (
  fullRule: string,
) => `These are the behaviour rules of Justified by Blackwood & Blake: how forms, buttons, dialogs and other parts of an interface should behave in a shadcn app. Each one was tried against WCAG 2.2 and weighed by established design systems; the verdict says how strongly they agree. Following them helps you work toward WCAG 2.2 AA. It does not make a product compliant on its own and is not a certification.

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

${overrides}

Every rule and guideline, with its verdict and the sources behind it: ${SITE}/patterns/`;

const entry = (r: Rule, link: (r: Rule) => string) =>
  `- **${r.id}** ${sentence(r)} ${verdict(r)}${r.status === "decided" || r.status === "stable" ? "" : `, ${r.status}`}. [Full rule](${link(r)})`;

const list = (link: (r: Rule) => string) =>
  GROUPS.filter((g) => rules.some(g.has))
    .map(
      (g) =>
        `## ${g.heading}\n\n${g.note}\n\n${rules
          .filter(g.has)
          .map((r) => entry(r, link))
          .join("\n")}`,
    )
    .join("\n\n");

const licence = `---

Rule texts © Carl Magnus Swahn and Justified contributors, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Generated from ${total}.`;

const CHECK: Record<Rule["check"], string> = {
  lint: "reading the code: the break shows for certain in it",
  runtime: "running the page: the break shows only when it runs",
  review: "judgement: someone has to weigh what the code does",
  manual: "hand: it takes a person or assistive technology",
};

/** The frontmatter's how_to_check as a section, so an agent that opens a full rule sees what to look for. */
const howToCheck = (r: Rule, h = "##") =>
  `${h} How to check\n\nChecked by ${CHECK[r.check]}. Each item is a sign the rule may be broken; code that follows the rule never matches.\n\n${r.how_to_check.map((i) => `- ${i}`).join("\n")}`;

const one = (r: Rule) => `# ${r.id} ${r.title}

${levelName(r)}. Verdict: ${verdict(r)}. Status: ${r.status}. Version: ${ruleVersion(r)}. ${page(r)}

${r.body}

${howToCheck(r)}

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

${rules.map((r) => `<a id="${r.id.toLowerCase()}"></a>\n\n## ${r.id} ${r.title}\n\n${levelName(r)}. Verdict: ${verdict(r)}. Status: ${r.status}. Version: ${ruleVersion(r)}. ${page(r)}\n\n${demote(r.body)}\n\n${howToCheck(r, "###")}`).join("\n\n")}

${licence}
`;

// The review skill: how to review and report in SKILL.md, every rule's how_to_check in checks/<area>.md.

const proposed = (r: Rule) => (r.status === "decided" || r.status === "stable" ? "" : ", proposed");

/** The level and verdict as a review hit shows them; for a rule WCAG requires, with the criteria that require it. */
const hitVerdict = (r: Rule) => {
  if (r.verdict !== "requirement") return `${levelName(r)}, ${verdict(r)}${proposed(r)}`;
  const req = r.law.filter((l) => l.relation === "requires").map((l) => `${l.criterion} ${l.name}`);
  return `Rule, Requirement: WCAG 2.2 ${req.join(", ")}${proposed(r)}`;
};

/** Areas in the order a review meets them, with the code each one covers. */
const AREAS: { area: string; label: string; covers: string }[] = [
  { area: "forms", label: "Forms", covers: "fields, labels, validation, error messages, autocomplete, sign-in" },
  { area: "actions", label: "Actions", covers: "buttons and links that act: labels, emphasis, order, place and size" },
  { area: "dialogs", label: "Dialogs", covers: "Dialog, AlertDialog, Sheet, Drawer: closing, focus, buttons" },
  {
    area: "destructive",
    label: "Destructive actions",
    covers: "delete, remove, archive, discard and other actions that lose work",
  },
  { area: "feedback", label: "Feedback", covers: "toasts, status messages, success and error messages" },
  { area: "states", label: "States", covers: "loading, empty lists and views, timeouts, actions under way" },
  { area: "text", label: "Text", covers: "tooltips, hover cards, help text, wording of messages" },
  { area: "keyboard", label: "Keyboard", covers: "focus styles, keyboard access, focus hidden behind other parts" },
  { area: "layout", label: "Layout", covers: "where parts sit, their order, narrow screens" },
  { area: "navigation", label: "Navigation", covers: "menus, sidebars, the current page, skip links" },
  { area: "structure", label: "Page structure", covers: "titles, headings, landmarks, language, images" },
  { area: "tables", label: "Tables", covers: "data tables, header cells, sorting" },
  {
    area: "visual",
    label: "Colour and motion",
    covers: "contrast, colour as the only signal, animation, reduced motion",
  },
];
const known = new Set(AREAS.map((a) => a.area));
const strays = rules.filter((r) => !known.has(r.area)).map((r) => r.id);
if (strays.length) {
  console.error(`agents: no review area for ${strays.join(", ")}; add the area to AREAS in build.ts`);
  process.exit(1);
}
const areas = AREAS.filter((a) => rules.some((r) => r.area === a.area));
const inArea = (a: string) => rules.filter((r) => r.area === a);

const checkEntry = (r: Rule) => `## ${r.id} ${r.short}

${hitVerdict(r)}. Checked by: ${r.check}. Full rule: \`../rules/${file(r)}\`, ${page(r)}

**Rule:** ${sentence(r)}

Look for:

${r.how_to_check.map((i) => `- ${i}`).join("\n")}`;

const checkFile = (a: (typeof AREAS)[number]) => `# Justified checks: ${a.label}

Covers ${a.covers}. Read \`../SKILL.md\` first: it says how to use these checks and how to report.

${inArea(a.area).map(checkEntry).join("\n\n")}

${licence}
`;

const areaTable = areas
  .map(
    (a) =>
      `| \`checks/${a.area}.md\` | ${a.covers} | ${inArea(a.area)
        .map((r) => r.id)
        .join(", ")} |`,
  )
  .join("\n");

const review = `---
name: justified-review
description: Review interface code in a shadcn or React app against the behaviour rules of Justified by Blackwood & Blake, and report each place that may break one, by file, line and rule id. Use when asked to review, check or audit UI code, a diff, a branch, a pull request or a folder against Justified, or before merging interface changes.
argument-hint: "[files, folder, branch or pull request]"
---

# Review code against Justified

This skill reviews interface code against the ${total} of Justified by Blackwood & Blake. It reports each place where the code may break one, with the rule's id, its verdict, what is wrong and how to fix it. A review finds some problems, not all. It does not make a product compliant and is not a certification.

## What to review

- If the request names files, a folder, a branch or a pull request, review those in full.
- Otherwise review what has changed. Run \`git status --porcelain\`: every file it lists is in the review, a changed one (\`M\`) by its \`git diff HEAD\`, and a new or untracked one (\`A\` or \`??\`) in full. An untracked folder (\`?? src/foo/\`) means every file in it. If it lists nothing, review the current branch against the branch it came from, such as \`git diff main...HEAD\`. Say which files you reviewed.
- Review interface code: components, pages, layouts, forms, the hooks and schemas that drive them, and styles, in files such as .tsx, .jsx, .ts, .js, .vue, .svelte, .astro, .html and .css. Skip tests, stories, generated files, lock files and \`node_modules\`.
- Read the rest of each file, and the files it uses, to judge the change. Leave problems that were already there, unless the change depends on them: a new page in a layout whose title is a starter title, or a new menu item in a menu that marks the current page only by colour.
- If you leave out clear problems next to the change, say so in one line after *Reviewed*, such as "Unchanged files nearby may break other rules; review \`src/invoices/\` to see them."
- A shared component, such as one in a component library, is reviewed for what it does wherever it is used. Leave out what depends on how an app uses it.
- Read \`justified.json\` at the project's root first, if there is one. It lists the project's own decisions to depart from a rule or guideline (see step 2 under *How to check*). After *Reviewed*, say how many overrides applied to the reviewed files.

## How to check

1. Read the check files for every area the reviewed code touches, one file at a time. Each holds its rules with their rule sentences and what to look for. When unsure whether an area is touched, read it. For code that renders a page or a part of one, always read \`checks/structure.md\`, \`checks/keyboard.md\`, \`checks/visual.md\` and \`checks/layout.md\`. For code with fields, also read \`checks/forms.md\`. For code that sends, loads, changes or removes data, also read \`checks/feedback.md\`, \`checks/states.md\` and \`checks/destructive.md\`.

   | File | Covers | Rules |
   | --- | --- | --- |
${areaTable
  .split("\n")
  .map((l) => `   ${l}`)
  .join("\n")}

2. Before you try a rule on a file, see whether an override covers it: an entry for that id whose \`files\` globs match the file, or that has none. An id that does not exist in the rules covers nothing.
   - **off:** do not check the rule on that file, and report nothing about it under *Rules* or *Guidelines*. Skip the parts of other rules that refer to it too, such as "as DLG-004 says".
   - **guideline:** check it as a guideline, so report it only where the project has no convention of its own.
   - **note:** check as usual and read the reason as context. A reason such as "voiding is reversible" can settle whether a deletion rule applies at all; say so when it does.
   - Never count an override as passed, and never write that the code is fine or resolved because of one.

   Then, for each rule, decide whether it applies. Many rules open with their situation, such as "When a menu shows the current page" or "In a dialog that …". If the reviewed code has no such situation, the rule does not apply: skip it and do not mention it.
3. Before you report a rule, open its full rule in \`rules/<id>.md\` and read the Exceptions. A case they cover is not a break.
4. Then look for the items under *Look for*. Each is a sign that the rule may be broken. Report a hit only when the code clearly shows it. Advice that the rule's Do marks as our own, and that the rule sentence does not state, is never a hit.
5. Read what the code uses before you report it. A Justified or shadcn component, or the project's own wrapper, may already do what the rule asks, as React Router's \`NavLink\` sets \`aria-current\`. Read the project's own copy of a component, such as \`components/ui/\`, where there is one; where there is none, assume the stock shadcn component.
6. What the reviewed code gets from elsewhere, such as a handler passed in as a prop or data from an API, is not a hit unless you have read it and it shows the break.

How each rule is checked, from *Checked by* in the check files:

- **lint** and **review:** read the code. For \`review\`, weigh what the code does, and report only a call you could defend to the person who wrote it.
- **runtime:** check the items that name code forms in the code; a clear match is a hit under *Rules* or *Guidelines* like any other. The others show only when the page runs, such as where focus goes or what is announced. If you can run the app and drive it, for example with Playwright or a browser tool, check them there. Otherwise list them under *Check in the running app*, with "guideline" after the id of a guideline, only where the reviewed code gives a concrete reason, such as a dialog it adds or a colour it sets, and say what in the code raised it. Give each such rule one line, however many apply; leave one out only when the code gives no reason for it.
- **manual:** list under *Check by hand*, only for rules that apply.

When you cannot tell from the code whether something breaks a rule, put it under *Check in the running app* or ask. Never present a guess as a hit.

Before you write the report, go through every rule in the check files you read once more. Each one is either left out because its situation is not in the code, reported under *Rules* or *Guidelines*, listed under one of the *Check* sections, or checked and found fine. Look again at any rule you passed over without deciding which.

## Report

Use this format and order, and leave out a section with nothing in it:

\`\`\`markdown
## Justified review

Reviewed: uncommitted changes in 3 files.

### Overridden by the project

- **ACT-006** Target size, in \`src/admin/**\`: overridden by the project (off). "The admin table is a dense tool used with a keyboard." Not checked in 4 reviewed files. Review by 2027-03-01.
  This rule is a WCAG requirement: WCAG 2.2 2.5.8 Target Size (Minimum).
  Would otherwise be reported at \`src/admin/users-table.tsx:22\`.
  ${SITE}/patterns/act-006/
- **ACT-001a** Verb first, everywhere: overridden by the project (guideline). "Our forms use Save and Submit throughout."
  ${SITE}/patterns/act-001a/

#### Overrides to look at

- **FRM-099**: no rule has this id. The override covers nothing.
- **FRM-007** Autocomplete: \`rule_version\` 0.9.0 is below the current major version, and \`review_by\` 2026-06-01 has passed. The override still applies.

### Rules

- \`src/settings/delete-account.tsx:58\` may break **DLG-003** Named destructive button, and also ACT-001a Verb first. Rule, Unanimous (3 of 3).
  The button that deletes the account says "OK", which does not name what will happen.
  Fix: label it "Delete account".
  ${SITE}/patterns/dlg-003/
- \`src/settings/profile-form.tsx:41\` may break **FRM-007** Autocomplete. Rule, Requirement: WCAG 2.2 1.3.5 Identify Input Purpose.
  The *Email* field asks for the person's own email and has no \`autoComplete\`.
  Fix: add \`autoComplete="email"\`.
  ${SITE}/patterns/frm-007/

### Guidelines, our choice

- (same form, with "Guideline, our choice" and the verdict)

### Check in the running app

- **DLG-006** Focus in and back: open the delete dialog, close it with Cancel, Escape and the close icon, and see that focus is back on *Delete account* each time.
  ${SITE}/patterns/dlg-006/

### Check by hand

- (same form as above)

Automated checks find some problems, not all. Test with real people and assistive technology.
\`\`\`

- *Overridden by the project* comes before *Rules*. Give one bullet for each override that applied to a reviewed file, in this order: requirements, then rules, then guidelines. Each bullet has the id and short name, the scope (\`in src/admin/**\` or \`everywhere\`), "overridden by the project" with the action (off or guideline), the reason quoted as written, "Not checked in N reviewed files." for off, \`review_by\` if the entry has one, and the rule's link. For a requirement, add the criterion on its own line: "This rule is a WCAG requirement: WCAG 2.2 2.5.8 Target Size (Minimum)." Leave out \`note\` entries and overrides that touched no reviewed file.
- For an overridden requirement only, you may add "Would otherwise be reported at \`file:line\`." It is never a finding. Never add it for a rule or guideline that WCAG does not require.
- Under *Overrides to look at*, list an override whose \`review_by\` date has passed, whose \`rule_version\` is below the rule's current major version (the check file's rule page and \`rules/<id>.md\` give the version), or whose id does not exist. \`review_by\` is only a reminder: the override still applies.
- Under *Rules*, put the rules WCAG requires first and then the rules the judges decide. Within each, and under *Guidelines*, order by file and line. Under the two *Check* sections, keep the order of the check files.
- Write the level and verdict exactly as the check file gives them, such as "Rule, Requirement: WCAG 2.2 1.3.5 Identify Input Purpose" or "Rule, Unanimous (2 of 2), proposed". A *proposed* rule may still change.
- Every hit says "may break" and names the rule by id and short name. Never call a hit a WCAG failure or a violation, and never say the code is accessible, compliant or meets WCAG.
- Say what is wrong in the reader's terms, from the rule sentence, in one or two sentences. Base the fix on the rule's Do, keep it short and fit it to the project's code.
- When one place may break several rules for the same reason, report it once: lead with the narrowest rule, as in the example, and name the others after it with "and also". Place it by its lead rule.
- When the same pattern repeats, report it once and list the other lines.
- When fixes for two hits work on each other, such as a submit button kept off until the form is valid and the form's validation mode, give one fix that settles both and say so in each.
- A guideline is our own choice. Report it only where the project has no convention of its own; where the project already does it another way, leave it out.
- List hits and what to check only. Never list rules that were checked and found fine.
- With no hits and no overrides in effect, write "No problems found against Justified's rules." With no hits but overrides in effect, write "No problems found against the rules the project follows." Either way still list what to check in the running app. End every report with the last line above.

## Fixing

Change no code unless the person asks. When they do, fix what the report lists, following each rule's Do and the project's own conventions. Where a fix needs a choice, such as the words on a button or which heading level a part gets, propose it and let the person choose.

${licence}
`;

// The skill: one line per rule, the title as the rule in brief, and the full
// rule opened on demand. AGENTS-compact.md, the same list as an instructions
// file, stays behind --compact while it is measured.

const mark = (r: Rule) => (r.verdict === "requirement" ? " [WCAG]" : r.level === "guideline" ? " [guideline]" : "");
const brief = (r: Rule) => `- **${r.id}** ${r.short}: ${r.title}.${mark(r)}`;
const byArea = areas.map((a) => `## ${a.label}\n\n${inArea(a.area).map(brief).join("\n")}`).join("\n\n");

const compactIntro = (where: string, tail = "") => `These are the behaviour rules of Justified by Blackwood & Blake for shadcn apps: ${total}, one line each, grouped by area. Following them helps you work toward WCAG 2.2 AA. It does not make a product compliant and is not a certification.

## How to use this file

- Use it whenever you build, change or review interface code.
- Each line gives a rule's id, its short name and the rule in brief. Many say first which situation they cover; where the code has no such situation, the rule does not apply.
- A line is not enough to follow its rule. Before you write or review code that a line covers, read the full rule: ${where} It holds the rule in full, Why, Do, Don't, Exceptions and How to check. Apply the exceptions only as written.
- Prefer Justified's components where they exist; they already follow the rules. Install them with the shadcn CLI, for example \`npx shadcn@latest add ${SITE}/r/field.json\`.
- When you review code, name each rule by its id, for example "FRM-002a".

## Rules and guidelines

A line marked [WCAG] is a rule that WCAG 2.2 Level AA requires. An unmarked line is a rule that most or all of the design systems behind Justified support. A line marked [guideline] is our own choice. Each full rule gives its verdict: how strongly WCAG and those design systems agree.

- **A rule that WCAG requires:** follow it. If the person you work for asks for something else, do what they ask, and tell them which WCAG 2.2 criterion is involved, by number and name, as the full rule gives it.
- **Any other rule:** follow it. If the person you work for asks for something else, do what they ask, and tell them which rule it departs from and why the rule exists.
- **A guideline:** follow it where the project has no convention of its own. Where the project already does it another way, keep the project's way and say nothing.
- **When two apply:** a rule that WCAG requires comes before other rules, a narrower rule before a wider one, and any rule before a guideline.
${tail}
${overrides}`;

const skill = `---
name: justified
description: Behaviour rules from Justified by Blackwood & Blake for shadcn apps. Use when building, changing or reviewing interface code with forms, fields, labels, validation, input types, paste, buttons, links, dialogs, toasts, error messages, loading states, tooltips, hover and pressed states, keyboard focus, shortcuts, page language, zoom or layout.
---

# Justified behaviour rules

${compactIntro(`\`rules/<id>.md\` next to this file, with the id in lower case, such as \`rules/frm-002a.md\` for FRM-002a, or, if that folder was not installed, ${SITE}/agents/rules/frm-002a.md.`, "- To review a change or a folder against every rule, use the `justified-review` skill if it is installed.\n")}

${byArea}

${licence}
`;

const compactAgents = `# Justified behaviour rules

${compactIntro(`${SITE}/agents/rules/<id>.md, with the id in lower case, such as ${SITE}/agents/rules/frm-002a.md for FRM-002a.`)}

${byArea}

${licence}
`;

rmSync(out, { recursive: true, force: true });
const ruleDirs = [join(out, "rules"), ...["justified", "justified-review"].map((s) => join(out, "skills", s, "rules"))];
for (const dir of ruleDirs) {
  mkdirSync(dir, { recursive: true });
  for (const r of rules) writeFileSync(join(dir, file(r)), one(r));
}
writeFileSync(join(out, "skills", "justified", "SKILL.md"), skill);
const reviewDir = join(out, "skills", "justified-review");
mkdirSync(join(reviewDir, "checks"), { recursive: true });
writeFileSync(join(reviewDir, "SKILL.md"), review);
for (const a of areas) writeFileSync(join(reviewDir, "checks", `${a.area}.md`), checkFile(a));
writeFileSync(join(out, "AGENTS.md"), agents);
writeFileSync(join(out, "AGENTS-full.md"), full);
// Rule data and the schema for justified.json, for the agents and the lint plugin.
for (const dir of [out, here("../../../packages/eslint/")]) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "ids.json"), json(ids));
  writeFileSync(join(dir, "justified.schema.json"), json(buildSchema(ids)));
}
// The override sections must reach every file that tells an agent how to work.
const missing = [
  ["skills/justified/SKILL.md", "## Your project's overrides"],
  ["AGENTS.md", "## Your project's overrides"],
  ["AGENTS-full.md", "## Your project's overrides"],
  ["skills/justified-review/SKILL.md", "### Overridden by the project"],
  ["skills/justified-review/SKILL.md", "#### Overrides to look at"],
  ["skills/justified-review/SKILL.md", "No problems found against the rules the project follows."],
].filter(([f, text]) => !readFileSync(join(out, f), "utf8").includes(text));
if (missing.length) {
  console.error(`agents: missing in the output: ${missing.map(([f, t]) => `${f} (${t})`).join("; ")}`);
  process.exit(1);
}
const compact = process.argv.includes("--compact");
if (compact) writeFileSync(join(out, "AGENTS-compact.md"), compactAgents);
console.log(
  `agents: wrote SKILL.md, justified-review (SKILL.md and ${areas.length} check files), AGENTS.md, AGENTS-full.md${compact ? ", AGENTS-compact.md" : ""} and ${rules.length} rule file(s) (${total})`,
);
