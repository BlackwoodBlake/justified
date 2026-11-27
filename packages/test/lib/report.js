/**
 * report.js: how a helper says that a page may break a rule.
 *
 * Every helper rests on one Justified rule. The level and verdict are
 * written here by hand, because the package does not ship the rule texts;
 * the tests compare them with the rule files, so a changed verdict fails
 * the tests instead of showing an old one.
 *
 * A finding reads "May break <ID> (<level>, <verdict>): <what happened>.
 * <how to fix it>." and ends with the rule's page. It never says that the
 * page fails WCAG or that a page without findings is accessible.
 */

const SITE = "https://blackwoodblake.com/design-system";

/** The rules the helpers check, as the site shows them. */
export const RULES = {
  "DLG-001": { level: "rule", verdict: "Unanimous (3 of 3)" },
  "DLG-006": { level: "rule", verdict: "Requirement" },
  "DLG-007": { level: "rule", verdict: "Unanimous (2 of 2)" },
  "FBK-004": { level: "rule", verdict: "Requirement" },
  "FRM-012a": { level: "rule", verdict: "Requirement" },
  "STR-001": { level: "rule", verdict: "Requirement" },
  "VIS-006": { level: "rule", verdict: "Unanimous (3 of 3)" },
};

/** What a guideline's finding ends with. No helper checks a guideline yet. */
export const GUIDELINE_NOTE = "This is a guideline, our choice: if the project already does this another way, keep that.";

/** The rule's page on the website. @param {string} id */
export const ruleUrl = (id) => `${SITE}/patterns/${id.toLowerCase()}/`;

/** @param {string} id */
export const messagePrefix = (id) => {
  const rule = RULES[/** @type {keyof typeof RULES} */ (id)];
  if (!rule) throw new Error(`justified-test: no rule ${id}`);
  return `May break ${id} (${rule.level}, ${rule.verdict}): `;
};

/** A finding: the page may break a Justified rule. */
export class JustifiedFinding extends Error {
  /**
   * @param {string} id
   * @param {string} text What happened and how to fix it, lower case after the colon.
   */
  constructor(id, text) {
    const rule = RULES[/** @type {keyof typeof RULES} */ (id)];
    const note = rule?.level === "guideline" ? ` ${GUIDELINE_NOTE}` : "";
    super(`${messagePrefix(id)}${text}${note} ${ruleUrl(id)}`);
    this.name = "JustifiedFinding";
    this.ruleId = id;
    this.url = ruleUrl(id);
  }
}

/** A helper was used in a way it cannot check, such as a dialog that never opened. Not a finding. */
export class JustifiedUsageError extends Error {
  /** @param {string} text */
  constructor(text) {
    super(`justified-test: ${text}`);
    this.name = "JustifiedUsageError";
  }
}

/** Shortens a text for a message. @param {string} text */
export const quote = (text, max = 60) => {
  const t = text.replace(/\s+/g, " ").trim();
  return `"${t.length > max ? `${t.slice(0, max - 1)}…` : t}"`;
};
