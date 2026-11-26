/**
 * justified/modifier-by-default, for KBD-003b (a rule): a shortcut the
 * product adds includes Ctrl, Alt, Cmd or Shift by default; a single key
 * works only after the person turns such shortcuts on, or only while its own
 * control has focus.
 *
 * Flags a setting for single-key shortcuts that starts on: `useState(true)`
 * for state named like `singleKeyShortcuts`, or a storage hook such as
 * `useLocalStorage("single-key-shortcuts", true)`.
 *
 * A page-wide binding of a single key with no modifier and nothing in the
 * code to turn it on or off, such as `useHotkeys("n", …)`, also goes against
 * this rule, but `character-key-shortcuts` (KBD-003, the law) reports it, and
 * this rule does not repeat that report. Fixing it there (a modifier, or a
 * setting) also meets this rule, as long as such a setting starts off.
 *
 * Left alone:
 *   - Every binding itself, including Shift-only and focus-bound ones:
 *     `character-key-shortcuts` reads them.
 *   - A setting whose name does not say single-key or character-key, and a
 *     starting value set in another file.
 *   - Whether a Ctrl or Cmd shortcut takes a browser key, and Cmd-only
 *     bindings (the Don'ts on Ctrl+F and `e.metaKey`): the rule sentence
 *     does not cover them, and the review skill reads them.
 */
import { defineRule } from "../lib/define-rule.js";
import { unwrap } from "../lib/jsx.js";

const SETTING_NAME = /single[-_ ]?(key|char(acter)?)|char(acter)?[-_ ]?key/i;
const STORAGE_HOOKS = /^use(Local|Session)?Storage(State)?$|^usePersisted(State)?$|^useCookie(State)?$/;

export default defineRule({
  id: "KBD-003b",
  level: "rule",
  verdict: "Unanimous (2 of 2)",
  description:
    "A single-key shortcut setting whose starting value is on. Page-wide single-key bindings with no way to turn them off are left to character-key-shortcuts.",
  messages: {
    startsOn:
      "the single-key shortcut setting {{name}} starts on, so single keys work before anyone chose them. Start it off; the person can turn it on, and off again.",
  },
  create(context) {
    return {
      /** @param {any} node */
      CallExpression(node) {
        const callee = unwrap(node.callee);
        const name = callee?.type === "Identifier" ? callee.name : callee?.type === "MemberExpression" ? callee.property.name : undefined;
        if (!name) return;
        const startsTrue = (/** @type {any} */ arg) => {
          const v = unwrap(arg);
          return v?.type === "Literal" && v.value === true;
        };
        if (name === "useState" && startsTrue(node.arguments[0])) {
          const id = node.parent?.type === "VariableDeclarator" ? node.parent.id : undefined;
          const first = id?.type === "ArrayPattern" ? id.elements[0] : undefined;
          if (first?.type === "Identifier" && SETTING_NAME.test(first.name))
            context.report({ node, messageId: "startsOn", data: { name: first.name } });
          return;
        }
        if (STORAGE_HOOKS.test(name) && startsTrue(node.arguments[1])) {
          const key = unwrap(node.arguments[0]);
          if (key?.type === "Literal" && typeof key.value === "string" && SETTING_NAME.test(key.value))
            context.report({ node, messageId: "startsOn", data: { name: `"${key.value}"` } });
        }
      },
    };
  },
});
