#!/usr/bin/env node
/**
 * check-rules.ts: checks the source register and every rule's frontmatter,
 * and works out each verdict from the recorded stances.
 *
 * Usage:
 *   npx tsx scripts/check-rules.ts [--rules rules] [--sources sources/sources.yaml]
 *
 * A verdict is never set by hand. This script derives it from the stances
 * and fails if the rule file says something else:
 *
 *   - Requirement: a WCAG criterion in `law` has the relation "requires".
 *   - Only the judges (Material, Apple, Carbon) count. Expert witnesses are
 *     recorded and shown, but they do not change the verdict.
 *   - Fewer than 2 judges have spoken: Insufficient evidence.
 *   - All judges who spoke support the rule: Unanimous.
 *   - More support than oppose: Majority.
 *   - As many support as oppose: Split.
 *   - More oppose than support: the rule is rejected and cannot be
 *     published. Try the judges' shared position instead (reverse trial).
 *
 * The level follows from the verdict (scripts/level.ts): Split and
 * Insufficient evidence give a guideline, every other verdict a rule. A
 * guideline needs an "Our reasons" section, and one with Insufficient
 * evidence needs at least one judge or witness who supports it.
 *
 * "partial" is allowed in an analysis, never in a rule file: narrow the
 * rule until each judge either supports or opposes it.
 *
 * Exit code: 0 = all good, 1 = problems found, 2 = setup error.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative } from "node:path";
import { parse } from "yaml";

import { deriveLevel, RULE_WORD_LIMIT, ruleWords } from "./level.ts";

// ---------------------------------------------------------------- fixed terms

export const AREAS: Record<string, string> = {
  ACT: "actions",
  DLG: "dialogs",
  DST: "destructive",
  FBK: "feedback",
  FRM: "forms",
  KBD: "keyboard",
  LAY: "layout",
  NAV: "navigation",
  STA: "states",
  STR: "structure",
  TBL: "tables",
  TXT: "text",
  VIS: "visual",
};

/** How each area is named in Storybook's menu: Rules/<label>/<id> <short>. */
const AREA_LABELS: Record<string, string> = {
  actions: "Actions",
  destructive: "Destructive actions",
  dialogs: "Dialogs",
  feedback: "Feedback",
  forms: "Forms",
  keyboard: "Keyboard",
  layout: "Layout",
  navigation: "Navigation",
  states: "States",
  structure: "Page structure",
  tables: "Tables",
  text: "Text",
  visual: "Colour and motion",
};
const SHORT_MAX = 30;
const shorts = new Map<string, string>();

const SYSTEMS = {
  wcag: "law",
  material: "judge",
  apple: "judge",
  carbon: "judge",
  govuk: "witness",
  nngroup: "witness",
} as const;
type System = keyof typeof SYSTEMS;

const JUDGES: System[] = ["material", "apple", "carbon"];
const STANCE_SYSTEMS: System[] = ["material", "apple", "carbon", "govuk", "nngroup"];
const STANCES = ["supports", "opposes", "silent"];
const STATUSES = ["proposed", "decided", "stable"];
const VERDICTS = ["requirement", "unanimous", "majority", "split", "insufficient-evidence"];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SEMVER = /^\d+\.\d+\.\d+$/;
const RULE_ID = /^([A-Z]{3})-\d{3}[a-z]?$/;
const SOURCE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CRITERION = /^\d\.\d\.\d{1,2}$/;

// ---------------------------------------------------------------- options

type Options = { rules: string; sources: string };

function parseArgs(argv: string[]): Options {
  const opts: Options = { rules: "rules", sources: "sources/sources.yaml" };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (value === undefined) fail(`Missing value for ${flag}`);
    switch (flag) {
      case "--rules": opts.rules = value; break;
      case "--sources": opts.sources = value; break;
      default: fail(`Unknown option ${flag}`);
    }
    i++;
  }
  return opts;
}

function fail(message: string): never {
  console.error(`check-rules: ${message}`);
  process.exit(2);
}

// ---------------------------------------------------------------- helpers

type Problems = string[];
type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";
const isCount = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;

/** YAML turns unquoted dates into Date objects; accept both forms. */
function isoDate(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  if (typeof v === "string" && ISO_DATE.test(v)) return v;
  return null;
}

function isHttps(v: unknown): boolean {
  if (!isText(v)) return false;
  try {
    return new URL(v).protocol === "https:";
  } catch {
    return false;
  }
}

function listMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...listMarkdown(path));
    else if (extname(path) === ".md") out.push(path);
  }
  return out.sort();
}

// ---------------------------------------------------------------- sources

type Source = { id: string; system: System };

function checkSources(path: string, problems: Problems): Map<string, Source> {
  const sources = new Map<string, Source>();
  let data: unknown;
  try {
    data = parse(readFileSync(path, "utf8"));
  } catch (e) {
    problems.push(`${path}: not valid YAML (${(e as Error).message.split("\n")[0]})`);
    return sources;
  }
  if (data === null || data === undefined) return sources; // empty register
  if (!Array.isArray(data)) {
    problems.push(`${path}: must be a list of sources`);
    return sources;
  }

  data.forEach((entry, i) => {
    const where = `${path} [${i}]`;
    if (!isObj(entry)) return problems.push(`${where}: must be a mapping`);
    const id = entry.id;
    const label = isText(id) ? `${path} (${id})` : where;

    if (!isText(id) || !SOURCE_ID.test(id)) problems.push(`${label}: id must be lowercase words joined by hyphens`);
    else if (sources.has(id)) problems.push(`${label}: id is used twice`);

    const system = entry.system as System;
    if (!(system in SYSTEMS)) problems.push(`${label}: system must be one of ${Object.keys(SYSTEMS).join(", ")}`);
    else if (entry.role !== SYSTEMS[system]) problems.push(`${label}: role for ${system} must be "${SYSTEMS[system]}"`);

    if (!isText(entry.title)) problems.push(`${label}: title is missing`);
    if (!isHttps(entry.url)) problems.push(`${label}: url must be an https link to the current official page`);
    if (!isoDate(entry.read)) problems.push(`${label}: read must be the date the page was read (YYYY-MM-DD)`);
    if (entry.page_updated != null && !isoDate(entry.page_updated)) problems.push(`${label}: page_updated must be YYYY-MM-DD or null`);
    if (system === "nngroup" && !isText(entry.author)) problems.push(`${label}: NN/g sources need the article's author`);
    if (system === "apple" && !isText(entry.platform)) problems.push(`${label}: Apple sources need a platform (web, ios, macos ...)`);

    if (isText(id) && system in SYSTEMS && !sources.has(id)) sources.set(id, { id, system });
  });
  return sources;
}

// ---------------------------------------------------------------- verdicts

type Stance = "supports" | "opposes" | "silent";

export type Derived =
  | { ok: true; verdict: string; spoken: number; agreeing: number }
  | { ok: false; reason: string };

/** Works out the verdict from the law and the judges' stances. */
export function deriveVerdict(requiredByLaw: boolean, judgeStances: Stance[]): Derived {
  const supports = judgeStances.filter((s) => s === "supports").length;
  const opposes = judgeStances.filter((s) => s === "opposes").length;
  const spoken = supports + opposes;

  if (requiredByLaw) return { ok: true, verdict: "requirement", spoken, agreeing: supports };
  if (spoken < 2) return { ok: true, verdict: "insufficient-evidence", spoken, agreeing: supports };
  if (opposes === 0) return { ok: true, verdict: "unanimous", spoken, agreeing: supports };
  if (supports > opposes) return { ok: true, verdict: "majority", spoken, agreeing: supports };
  if (supports === opposes) return { ok: true, verdict: "split", spoken, agreeing: supports };
  return {
    ok: false,
    reason: `rejected by the judges (${opposes} of ${spoken} oppose); try their shared position instead`,
  };
}

// ---------------------------------------------------------------- rules

function frontmatter(text: string): unknown {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  return m ? parse(m[1]) : undefined;
}

function checkRule(file: string, rulesDir: string, sources: Map<string, Source>, ids: Map<string, string>, problems: Problems, warnings: Problems) {
  let fm: unknown;
  const text = readFileSync(file, "utf8");
  try {
    fm = frontmatter(text);
  } catch (e) {
    problems.push(`${file}: frontmatter is not valid YAML (${(e as Error).message.split("\n")[0]})`);
    return;
  }
  if (!isObj(fm)) return problems.push(`${file}: frontmatter is missing`);
  const p = (msg: string) => problems.push(`${file}: ${msg}`);

  // id, file name and area
  const id = fm.id;
  const m = isText(id) ? id.match(RULE_ID) : null;
  if (!m) p("id must look like ACT-001 (three capital letters, a hyphen, three digits)");
  else {
    if (ids.has(id as string)) p(`id ${id} is also used in ${ids.get(id as string)}`);
    ids.set(id as string, file);
    if (basename(file, ".md") !== id) p(`file name must be ${id}.md`);
    const area = AREAS[m[1]];
    if (!area) p(`unknown area prefix ${m[1]} (known: ${Object.keys(AREAS).join(", ")})`);
    else {
      if (fm.area !== area) p(`area must be "${area}" for ${m[1]} rules`);
      const folder = relative(rulesDir, dirname(file));
      if (folder !== area) p(`must live in ${join(rulesDir, area)}/`);
    }
  }

  if (!isText(fm.title)) p("title is missing");
  // The short name labels the rule where the title is too long, such as Storybook's menu.
  if (!isText(fm.short)) p("short is missing (a name of a few words for menus)");
  else {
    if (fm.short.length > SHORT_MAX) p(`short must be ${SHORT_MAX} characters at most`);
    if (shorts.has(fm.short)) p(`short "${fm.short}" is also used by ${shorts.get(fm.short)}`);
    shorts.set(fm.short, file);
    // A rule's stories sit in the menu under its area and short name.
    const stories = join("examples/stories/rules", `${fm.id}.stories.tsx`);
    if (rulesDir === "rules" && existsSync(stories) && isText(fm.area)) {
      const want = `title: "Rules/${AREA_LABELS[fm.area] ?? fm.area}/${fm.id} ${fm.short}"`;
      if (!readFileSync(stories, "utf8").includes(want)) p(`${stories} must have ${want}`);
    }
  }
  if (!STATUSES.includes(fm.status as string)) p(`status must be one of ${STATUSES.join(", ")}`);
  if (!isText(fm.version) || !SEMVER.test(fm.version)) p('version must be semver in quotes, for example "1.0.0"');
  // The changelog is newest first and starts at the rule's own version; the website reads its dates that way.
  if (!Array.isArray(fm.changelog) || fm.changelog.length === 0) p("changelog must list at least one version");
  else {
    const versions = fm.changelog.map((c) => (isObj(c) && isText(c.version) ? c.version : ""));
    const rank = (v: string) => v.split(".").map(Number);
    const newer = (x: string, y: string) => {
      const [a, b] = [rank(x), rank(y)];
      for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return (a[i] ?? 0) > (b[i] ?? 0);
      return false;
    };
    if (versions.some((v) => !SEMVER.test(v))) p("every changelog entry needs a semver version in quotes");
    else {
      if (versions[0] !== fm.version) p("the first changelog entry must be the rule's own version");
      if (versions.some((v, i) => i > 0 && !newer(versions[i - 1], v))) p("changelog must be newest first");
    }
  }
  if (!isoDate(fm.conflicts_checked)) p("conflicts_checked must be the date of the last conflict check (YYYY-MM-DD)");

  // law
  let requiredByLaw = false;
  const law = fm.law ?? [];
  if (!Array.isArray(law)) p("law must be a list (use [] when no criterion applies)");
  else
    law.forEach((c, i) => {
      if (!isObj(c)) return p(`law[${i}] must be a mapping`);
      if (!isText(c.criterion) || !CRITERION.test(c.criterion)) p(`law[${i}].criterion must be a quoted number such as "3.3.1"`);
      if (!isText(c.name)) p(`law[${i}].name is missing`);
      if (!isHttps(c.url) || !String(c.url).startsWith("https://www.w3.org/")) p(`law[${i}].url must link to the criterion on w3.org`);
      if (c.relation === "requires") requiredByLaw = true;
      else if (c.relation !== "supports") p(`law[${i}].relation must be "requires" or "supports"`);
    });

  // stances
  const stances = fm.stances;
  const judgeStances: Stance[] = [];
  let stancesOk = isObj(stances);
  if (!isObj(stances)) p("stances must list every judge and witness");
  else {
    for (const key of Object.keys(stances))
      if (!STANCE_SYSTEMS.includes(key as System)) p(`stances.${key} is not a judge or witness`);
    for (const system of STANCE_SYSTEMS) {
      const s = stances[system];
      if (!isObj(s)) {
        p(`stances.${system} is missing (use { stance: silent } when the source does not address the rule)`);
        stancesOk = false;
        continue;
      }
      const stance = s.stance as string;
      if (stance === "partial") {
        p(`stances.${system} is partial; narrow the rule until the source supports or opposes it`);
        stancesOk = false;
        continue;
      }
      if (!STANCES.includes(stance)) {
        p(`stances.${system}.stance must be one of ${STANCES.join(", ")}`);
        stancesOk = false;
        continue;
      }
      const refs = s.sources ?? [];
      if (!Array.isArray(refs)) p(`stances.${system}.sources must be a list`);
      else {
        if (stance !== "silent" && refs.length === 0) p(`stances.${system} needs at least one source to link to`);
        for (const ref of refs) {
          const src = sources.get(ref as string);
          if (!src) p(`stances.${system} cites ${ref}, which is not in the source register`);
          else if (src.system !== system) p(`stances.${system} cites ${ref}, which belongs to ${src.system}`);
        }
      }
      if (JUDGES.includes(system)) judgeStances.push(stance as Stance);
    }
  }

  // verdict
  if (!VERDICTS.includes(fm.verdict as string)) p(`verdict must be one of ${VERDICTS.join(", ")}`);
  const judges = fm.judges;
  if (!isObj(judges) || !isCount(judges.spoken) || !isCount(judges.agreeing)) p("judges must be { spoken: <number>, agreeing: <number> }");
  if (!stancesOk) return;

  const derived = deriveVerdict(requiredByLaw, judgeStances);
  if (!derived.ok) return p(derived.reason);
  if (fm.verdict !== derived.verdict) p(`verdict is "${fm.verdict}" but the stances give "${derived.verdict}"`);
  if (isObj(judges) && (judges.spoken !== derived.spoken || judges.agreeing !== derived.agreeing))
    p(`judges must be { spoken: ${derived.spoken}, agreeing: ${derived.agreeing} } to match the stances`);

  // level
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, "");
  if (deriveLevel(derived.verdict) === "guideline") {
    if (!/^## Our reasons$/m.test(body)) p('a guideline (Split or Insufficient evidence) needs an "Our reasons" section');
    const supporters = STANCE_SYSTEMS.filter((s) => (stances as Record<string, { stance?: string }>)[s]?.stance === "supports").length;
    if (derived.verdict === "insufficient-evidence" && supporters === 0)
      p("a guideline needs at least one judge or witness who supports it");
  }
  const words = ruleWords(body);
  if (words === 0) p('the "## Rule" section is missing or empty');
  else if (words > RULE_WORD_LIMIT) warnings.push(`${file}: the rule is ${words} words; aim for ${RULE_WORD_LIMIT} or fewer`);
}

// ---------------------------------------------------------------- main

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!existsSync(opts.rules)) fail(`Rules folder not found: ${opts.rules}`);
  if (!existsSync(opts.sources)) fail(`Source register not found: ${opts.sources}`);

  const problems: Problems = [];
  const sources = checkSources(opts.sources, problems);
  const ruleFiles = listMarkdown(opts.rules);
  const ids = new Map<string, string>();
  const warnings: Problems = [];
  for (const file of ruleFiles) checkRule(file, opts.rules, sources, ids, problems, warnings);
  for (const warning of warnings) console.log(`warning: ${warning}`);

  if (problems.length === 0) {
    console.log(`check-rules: all good (${ruleFiles.length} rules, ${sources.size} sources)`);
    return;
  }
  for (const problem of problems) console.log(problem);
  console.log(`\ncheck-rules: ${problems.length} problem(s). Fix them before committing.`);
  process.exit(1);
}

main();
