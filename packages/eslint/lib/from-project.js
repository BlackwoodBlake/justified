/**
 * from-project.js: reads a project's justified.json and turns it into flat
 * config objects.
 *
 * A project writes down where it departs from a Justified rule, with a
 * reason. `off` and `guideline` change the severity of the id's lint rules;
 * `note` changes nothing in ESLint. `review_by` is ignored here, so lint
 * results never change with the calendar. Everything is validated by hand,
 * so the plugin needs no extra dependency.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ids = JSON.parse(readFileSync(new URL("../ids.json", import.meta.url), "utf8"));

const ID = /^[A-Z]{3}-\d{3}[a-z]?$/;
const VERSION_START = /^\d+\.\d+\.\d+/;
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;
const ACTIONS = ["off", "guideline", "note"];
const TOP_KEYS = ["$schema", "justified", "overrides"];
const ENTRY_KEYS = ["id", "action", "reason", "files", "rule_version", "review_by", "owner", "lint_rules"];
const MIN_REASON = 20;

const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);

/** An ISO date such as 2027-06-01 that exists on the calendar. @param {string} text */
function isDate(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const d = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === text;
}

/** Whether the path is a regular file; a folder with the same name does not count. @param {string} candidate */
function isFile(candidate) {
  try {
    return existsSync(candidate) && statSync(candidate).isFile();
  } catch {
    return false;
  }
}

/** The nearest file with this name, from `dir` upwards. @param {string} dir @param {string} name */
function findFile(dir, name) {
  if (path.isAbsolute(name)) return isFile(name) ? name : undefined;
  for (let current = path.resolve(dir); ; current = path.dirname(current)) {
    const candidate = path.join(current, name);
    if (isFile(candidate)) return candidate;
    if (path.dirname(current) === current) return undefined;
  }
}

/** A glob in one spelling, so `./src/**` and `src\\**` compare equal to `src/**`. @param {string} glob */
const normalizeGlob = (glob) => glob.replace(/\\/g, "/").replace(/^(\.\/)+/, "");

const posix = (p) => p.split(path.sep).join("/");
const hasGlob = (s) => /[*?[\]{}()!]/.test(s);
const segmentPattern = (s) => new RegExp(`^${s.replace(/[.+^$|\\]/g, "\\$&").replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]")}$`);

/**
 * Rewrites a glob that is relative to the folder of justified.json so it is
 * relative to the folder of the ESLint config (`prefix`, such as
 * "packages/app"). Returns undefined when the glob cannot match anything in
 * that folder, because flat config cannot match files outside its own
 * folder. Braces and brackets in the part of a glob that names a folder
 * above the config are not understood and count as no match.
 * @param {string} glob @param {string} prefix
 */
export function rebaseGlob(glob, prefix) {
  const clean = glob.replace(/^\.\//, "");
  if (!prefix || clean.startsWith("**")) return clean;
  const g = clean.split("/");
  const p = prefix.split("/");
  for (let i = 0; i < p.length; i++) {
    const seg = g[i];
    if (seg === undefined) return undefined;
    if (seg === "**") return g.slice(i).join("/");
    if (seg === p[i]) continue;
    if (hasGlob(seg) && !/[[\]{}()!]/.test(seg) && segmentPattern(seg).test(p[i])) continue;
    return undefined;
  }
  const rest = g.slice(p.length).join("/");
  return rest === "" ? "**" : rest;
}

/** The major number of a version such as "1.0.2". @param {string} v */
const major = (v) => Number(v.split(".")[0]);

/**
 * @param {import("../index.d.ts").JustifiedPlugin} plugin
 */
export function createFromProject(plugin) {
  /** @type {Map<string, string[]>} */
  const lintRulesById = new Map();
  for (const [name, rule] of Object.entries(plugin.rules)) {
    const id = /** @type {any} */ (rule.meta?.docs)?.justifiedId;
    if (!id) continue;
    lintRulesById.set(id, [...(lintRulesById.get(id) ?? []), `justified/${name}`]);
  }
  const known = new Map(ids.map((entry) => [entry.id, entry]));

  /**
   * @param {string} dir The folder of the ESLint config, usually `import.meta.dirname`.
   * @param {import("../index.d.ts").FromProjectOptions} [options]
   */
  return function fromProject(dir, options = {}) {
    const { files, file = "justified.json", strict = false, onWarning = (message) => console.warn(message) } = options;
    const warn = (message) => onWarning(`justified: ${message}`);

    const recommended = files ? { ...plugin.configs.recommended, files } : plugin.configs.recommended;
    const found = findFile(dir, file);
    if (!found) return [recommended];
    const relative = path.relative(process.cwd(), found);
    const label = relative.startsWith("..") ? found : relative;
    const fail = (where, message) => {
      throw new Error(`${label}: ${where ? `${where}: ` : ""}${message}`);
    };

    let data;
    try {
      data = JSON.parse(readFileSync(found, "utf8").replace(/^\uFEFF/, ""));
    } catch (error) {
      return fail("", `cannot read the file as JSON (${/** @type {Error} */ (error).message})`);
    }
    if (!isObject(data)) fail("", "the file must hold a JSON object");
    for (const key of Object.keys(data)) if (!TOP_KEYS.includes(key)) fail("", `unknown field "${key}"`);
    if (data.justified !== undefined && typeof data.justified !== "string") fail("", `"justified" must be a version string`);
    if (typeof data.justified === "string" && !VERSION_START.test(data.justified)) {
      warn(`${label}: "justified" should be a version such as "0.5.0", not "${data.justified}"; it is informational only.`);
    }
    if (data.$schema !== undefined && typeof data.$schema !== "string") warn(`${label}: "$schema" should be text (the address of the schema); it is ignored.`);
    if (!Array.isArray(data.overrides)) fail("", `"overrides" must be a list`);

    // The folder of the config, seen from the folder of justified.json.
    const prefix = posix(path.relative(path.dirname(found), path.resolve(dir)));
    const seen = [];
    const requirementsOff = new Map();
    const shared = {};
    /** @type {{ globs: string[], rules: Record<string, string> }[]} */
    const scoped = [];

    data.overrides.forEach((entry, index) => {
      const where = `overrides[${index}]${isObject(entry) && typeof entry.id === "string" ? ` (${entry.id})` : ""}`;
      if (!isObject(entry)) return fail(where, "must be an object");
      for (const key of Object.keys(entry)) if (!ENTRY_KEYS.includes(key)) fail(where, `unknown field "${key}"`);
      if (typeof entry.id !== "string" || !ID.test(entry.id)) fail(where, `"id" must be one exact id such as "FRM-004", with no wildcard or family`);
      if (!ACTIONS.includes(entry.action)) fail(where, `"action" must be one of ${ACTIONS.map((a) => `"${a}"`).join(", ")}`);
      if (typeof entry.reason !== "string" || entry.reason.trim().length < MIN_REASON) {
        fail(where, `"reason" is required and must be at least ${MIN_REASON} characters, in the project's own words`);
      }
      if (entry.files !== undefined) {
        if (!Array.isArray(entry.files) || entry.files.length === 0 || entry.files.some((g) => typeof g !== "string" || g === "")) {
          fail(where, `"files" must be a list of one or more globs`);
        }
        if (entry.files.some((g) => g.startsWith("!"))) fail(where, `"files" takes positive globs only; remove the one that starts with "!"`);
      }
      if (entry.rule_version !== undefined && (typeof entry.rule_version !== "string" || !SEMVER.test(entry.rule_version))) {
        fail(where, `"rule_version" must be a version such as "1.0.2"`);
      }
      if (entry.review_by !== undefined && (typeof entry.review_by !== "string" || !isDate(entry.review_by))) {
        fail(where, `"review_by" must be a date such as "2027-06-01"`);
      }
      if (entry.owner !== undefined && typeof entry.owner !== "string") fail(where, `"owner" must be text`);
      if (entry.lint_rules !== undefined) {
        if (!Array.isArray(entry.lint_rules) || entry.lint_rules.length === 0 || entry.lint_rules.some((n) => typeof n !== "string" || !n.startsWith("justified/"))) {
          fail(where, `"lint_rules" must be a list of one or more names that start with "justified/"`);
        }
      }

      const clash = seen.find((other) => other.id === entry.id && (!other.files || !entry.files || other.files.some((g) => entry.files.some((h) => normalizeGlob(g) === normalizeGlob(h)))));
      if (clash) fail(where, `the id is listed twice for the same files (see overrides[${clash.index}]); keep one entry`);
      seen.push({ id: entry.id, files: entry.files, index });

      const info = known.get(entry.id);
      if (!info) {
        const message = `${label}: ${where}: "${entry.id}" is not a Justified id`;
        if (strict) throw new Error(message);
        return warn(`${message}; it is ignored.`);
      }

      const isRequirement = info.verdict === "Requirement";
      if (entry.action === "guideline" && isRequirement) {
        fail(where, `"guideline" cannot be used on a WCAG requirement; use "off" or "note"`);
      }
      if (entry.rule_version !== undefined && major(entry.rule_version) < major(info.version)) {
        warn(`${label}: ${where}: ${entry.id} has changed since this override was written (version ${entry.rule_version}, now ${info.version}). The override still applies; read the rule again.`);
      }

      const lintRules = lintRulesById.get(entry.id) ?? [];
      if (entry.lint_rules) {
        const wrong = entry.lint_rules.find((n) => !lintRules.includes(n));
        if (wrong) fail(where, `"${wrong}" is not a lint rule of ${entry.id}${lintRules.length ? ` (its lint rules: ${lintRules.join(", ")})` : " (it has no lint rule)"}`);
      }

      if (entry.action === "note") return;
      if (entry.action === "guideline" && info.level === "guideline") {
        return warn(`${label}: ${where}: ${entry.id} is already a guideline, so "guideline" changes nothing.`);
      }
      if (entry.action === "off" && isRequirement && !requirementsOff.has(entry.id)) {
        const criteria = (info.wcag ?? []).map((c) => `WCAG 2.2 ${c.criterion} ${c.name}`).join(", ");
        requirementsOff.set(entry.id, criteria);
        warn(`${entry.id} is turned off in ${label}. That is your project's decision, and ${criteria || "the WCAG criterion it rests on"} is still involved.`);
      }

      const severity = entry.action === "off" ? "off" : "warn";
      const rules = Object.fromEntries((entry.lint_rules ?? lintRules).map((name) => [name, severity]));
      if (Object.keys(rules).length === 0) return;
      if (!entry.files) return void Object.assign(shared, rules);
      const globs = entry.files.map((g) => rebaseGlob(g, prefix)).filter((g) => g !== undefined);
      if (globs.length > 0) scoped.push({ globs, rules });
    });

    const configs = [recommended];
    const plugins = { justified: plugin };
    if (Object.keys(shared).length > 0) {
      configs.push({ name: "justified/project-overrides", ...(files ? { files } : {}), plugins, rules: shared });
    }
    for (const { globs, rules } of scoped) {
      // A list inside `files` means every glob in it must match, so a scoped override never reaches past `files`.
      configs.push({ name: "justified/project-overrides/files", files: files ? globs.flatMap((g) => files.map((f) => [g, ...(Array.isArray(f) ? f : [f])])) : globs, plugins, rules });
    }
    return configs;
  };
}
