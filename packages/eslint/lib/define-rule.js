/**
 * define-rule.js: turns a Justified rule description into an ESLint rule.
 *
 * Every lint rule rests on one Justified text. The level and verdict are
 * written here by hand, because the published package does not ship the
 * rule texts, and the tests compare them with the rule file, so a changed
 * verdict fails the tests instead of showing an old one.
 *
 * Each message starts with "May break <ID> (<level>, <verdict>): ". A
 * guideline's messages also say that it is our choice.
 */

const SITE = "https://blackwoodblake.com/design-system";

/** What a guideline's message ends with. */
export const GUIDELINE_NOTE = "This is a guideline, our choice: if the project already does this another way, keep that.";

/**
 * The start of every message for a rule.
 * @param {string} id
 * @param {"rule" | "guideline"} level
 * @param {string} verdict
 */
export const messagePrefix = (id, level, verdict) => `May break ${id} (${level}, ${verdict}): `;

/** The rule's page on the website. @param {string} id */
export const ruleUrl = (id) => `${SITE}/patterns/${id.toLowerCase()}/`;

/**
 * @typedef {object} JustifiedRuleSpec
 * @property {string} id The Justified id, such as "FRM-002b".
 * @property {"rule" | "guideline"} level
 * @property {string} verdict As the site shows it, such as "Unanimous (2 of 2)" or "Requirement".
 * @property {string} description One line: what the lint rule flags.
 * @property {Record<string, string>} messages Plain English: what is wrong and how to fix it. The prefix is added here.
 * @property {"problem" | "suggestion" | "layout"} [type]
 * @property {"code" | "whitespace"} [fixable] Only for fixes that are certainly safe and keep the meaning.
 * @property {boolean} [hasSuggestions]
 * @property {import("eslint").JSONSchema4[] | false} [schema]
 * @property {(context: import("eslint").Rule.RuleContext) => import("eslint").Rule.RuleListener} create
 */

/**
 * @param {JustifiedRuleSpec} spec
 * @returns {import("eslint").Rule.RuleModule}
 */
export function defineRule(spec) {
  const { id, level, verdict, description, messages, type = "problem", fixable, hasSuggestions, schema = [], create } = spec;
  const prefix = messagePrefix(id, level, verdict);
  const full = Object.fromEntries(
    Object.entries(messages).map(([key, text]) => [
      key,
      // Suggestion texts are labels in the editor, not findings, so they keep their own words.
      key.startsWith("suggest") ? text : `${prefix}${text}${level === "guideline" ? ` ${GUIDELINE_NOTE}` : ""}`,
    ]),
  );
  return {
    meta: {
      type,
      docs: {
        description,
        url: ruleUrl(id),
        // Custom fields: the tests check them against the rule file.
        justifiedId: id,
        justifiedLevel: level,
        justifiedVerdict: verdict,
      },
      messages: full,
      schema,
      ...(fixable ? { fixable } : {}),
      ...(hasSuggestions ? { hasSuggestions } : {}),
    },
    create,
  };
}
