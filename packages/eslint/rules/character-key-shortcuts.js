/**
 * justified/character-key-shortcuts, for KBD-003 (a requirement): a page-wide
 * shortcut made only of character keys can be turned off or changed, unless
 * it works only while its own control has focus.
 *
 * Flags a page-wide binding of a character key, with or without Shift, that
 * nothing in the code around it can turn off: `useHotkeys("e", …)` with no
 * kept ref and no `enabled` option, `tinykeys(window, { "Shift+D": … })`,
 * `Mousetrap.bind("?", …)`, and a `keydown` listener on `document` or
 * `window` that acts on `e.key === "/"`, `e.key === "D"` or
 * `e.key.length === 1` without requiring `e.ctrlKey`, `e.altKey` or
 * `e.metaKey`. Requiring `e.shiftKey` alone does not count, and a guard that
 * only skips typing in text fields is not a way out. See
 * `lib/shortcut-helpers.js` for how page-wide and "a way out" are read.
 *
 * Left alone:
 *   - Keys on a component's own `onKeyDown`, a `useHotkeys` whose ref is
 *     kept, and `tinykeys` or `Mousetrap` bound to an element: they are
 *     focus-bound (the rule's exception).
 *   - Escape, the arrows, Enter, Space, Tab, Delete and the function keys,
 *     and every binding with Ctrl, Alt or Cmd (`mod`, `$mod`, `meta` …).
 *     A key whose action runs only while Ctrl, Alt or Cmd is held, as in
 *     `if (e.key === "k") { if (e.metaKey) open(); }`, counts as one with a
 *     modifier. A branch that returns when a modifier is held, or picks one
 *     action with the modifier and another without, still acts on the key
 *     alone and is reported.
 *   - Any binding under a condition that reads something besides the event,
 *     which may be the setting, and event checks through a function the rule
 *     cannot read.
 *   - A setting that mounts or unmounts the component, or a remap screen
 *     elsewhere: lint cannot see them. The review skill covers them.
 */
import { defineRule } from "../lib/define-rule.js";
import { shortcutVisitor } from "../lib/shortcut-helpers.js";

export default defineRule({
  id: "KBD-003",
  level: "rule",
  verdict: "Requirement",
  description:
    "A page-wide useHotkeys, tinykeys, Mousetrap or document/window keydown shortcut on a character key, with or without Shift, that nothing in the code can turn off.",
  messages: {
    plain:
      "{{key}} ({{via}}) is a page-wide shortcut made only of a character key, and nothing here turns it off, so a stray key press or a word from speech input can set it off. Add Ctrl, Alt or Cmd, handle it on its own control's onKeyDown or a hook ref, or let people turn it off in a setting. Skipping text fields is not enough.",
    shift:
      "{{key}} ({{via}}) is a page-wide shortcut that adds only Shift, which still types a character, and nothing here turns it off. Add Ctrl, Alt or Cmd, handle it on its own control's onKeyDown or a hook ref, or let people turn it off in a setting.",
  },
  create(context) {
    return shortcutVisitor(context, ({ node, kind, key, via }) => {
      context.report({ node, messageId: kind, data: { key, via } });
    });
  },
});
