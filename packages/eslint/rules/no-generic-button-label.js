/**
 * justified/no-generic-button-label, for ACT-001a (a rule): a button that
 * performs, confirms or commits an action starts with a verb that names
 * it, and never reads OK, Yes, No or Submit.
 *
 * Flags, on `Button`, `button`, `AlertDialogAction` and `AlertDialogCancel`:
 *   - visible text that is only "Yes", "No" or "Submit" (any case, a
 *     trailing "." or "!" ignored);
 *   - visible text that is only "OK", "Ok" or "Okay", when the button sits
 *     next to another button, and no date or time picker is in sight (the
 *     Exceptions allow OK as the lone button of a message that only
 *     informs, and to confirm a picker);
 *   - "Confirm" alone on an `AlertDialogAction`, or on a button in an
 *     `AlertDialogFooter`: the Don't names it, and no Exception covers it.
 * And `<input type="submit">` with no `value` (the browser then shows a
 * generic word such as "Submit"), or with one of the words above.
 *
 * Left alone:
 *   - Text that is more than the bare word, such as "Yes, delete", and
 *     text that is not written out: a variable, `t("...")`, or any child
 *     element such as an icon or a `<span>`.
 *   - Cancel, Close, Done, Next, Continue, Back and Undo: whether they
 *     commit something cannot be seen in the code. Nouns alone and vague
 *     verbs other than Confirm need judgement too. The review skill
 *     covers them.
 *   - Toggle buttons (`aria-pressed`) and buttons in a `ToggleGroup` or
 *     `RadioGroup`, which show a choice rather than run an action.
 *   - An OK whose neighbours are not written out as buttons beside it, for
 *     example when they come from a condition or a prop.
 */
import { ancestorInTree, visibleText } from "../lib/button-label-helpers.js";
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, getAttribute, meaningfulChildren, walk } from "../lib/jsx.js";

const BUTTONS = new Set(["Button", "button", "AlertDialogAction", "AlertDialogCancel"]);
/** Elements that are a button of their own, next to which an OK is not alone. */
const BUTTON_LIKE = new Set([
  "Button",
  "button",
  "AlertDialogAction",
  "AlertDialogCancel",
  "DialogClose",
  "SheetClose",
  "DrawerClose",
  "PopoverClose",
]);
const ALWAYS = new Set(["yes", "no", "submit"]);
const OK = new Set(["ok", "okay"]);
const INPUT_BUTTONS = new Set(["submit", "button", "reset"]);
const PICKER_INPUTS = new Set(["date", "time", "datetime-local", "month", "week"]);
/** Names that mean a date or time picker, or a popover that may hold one. */
const PICKER = /Calendar|Picker|DateField|DateInput|TimeField|TimeInput|^Popover/;
const CHOICE_GROUPS = new Set(["ToggleGroup", "RadioGroup"]);

/** The word as compared: lower case, no trailing full stop or exclamation mark. @param {string} text */
const word = (text) =>
  text
    .replace(/[.!]+$/, "")
    .trim()
    .toLowerCase();

/** @param {any} node */
function isButtonLike(node) {
  if (node.type !== "JSXElement") return false;
  const name = elementName(node.openingElement) ?? "";
  if (BUTTON_LIKE.has(name)) return true;
  if (name === "input") {
    const type = attributeValue(getAttribute(node.openingElement, "type"));
    return typeof type === "string" && INPUT_BUTTONS.has(type);
  }
  return false;
}

/**
 * Whether another button is written out next to this one. Climbs through
 * up to three wrappers that hold only this element, such as `DialogClose
 * asChild` or a footer around a single button.
 * @param {any} element
 */
function hasNeighbourButton(element) {
  let node = element;
  for (let level = 0; level < 4; level++) {
    const parent = node.parent;
    if (!parent || (parent.type !== "JSXElement" && parent.type !== "JSXFragment")) return false;
    const kids = meaningfulChildren(parent);
    if (kids.length > 1) return kids.some((k) => k !== node && isButtonLike(k));
    node = parent;
  }
  return false;
}

/** The outermost JSX around a node, without crossing into other functions. @param {any} node */
function outermostJsx(node) {
  let top = node;
  for (let n = node.parent; n; n = n.parent) {
    if (n.type === "JSXElement" || n.type === "JSXFragment") top = n;
    else if (
      ![
        "JSXExpressionContainer",
        "JSXAttribute",
        "JSXOpeningElement",
        "LogicalExpression",
        "ConditionalExpression",
      ].includes(n.type)
    )
      break;
  }
  return top;
}

/**
 * Whether a date or time picker is around the button or in the same JSX.
 * @param {any} element
 * @param {Record<string, readonly string[]>} keys
 */
function nearPicker(element, keys) {
  let found = false;
  walk(outermostJsx(element), keys, (n) => {
    if (found) return false;
    if (n.type !== "JSXOpeningElement") return undefined;
    const name = elementName(n) ?? "";
    if (PICKER.test(name)) found = true;
    if (name === "input") {
      const type = attributeValue(getAttribute(n, "type"));
      if (typeof type === "string" && PICKER_INPUTS.has(type)) found = true;
    }
    return undefined;
  });
  return found;
}

export default defineRule({
  id: "ACT-001a",
  level: "rule",
  verdict: "Unanimous (3 of 3)",
  description:
    'A button whose whole label is "OK", "Yes", "No" or "Submit", or "Confirm" in an alert dialog, and a submit input with no value.',
  type: "suggestion",
  messages: {
    generic:
      'the button reads only "{{text}}", which does not say what pressing it does. Start the label with a verb that names the action, such as "Book appointment" or "Delete invoice". To back out, use "Cancel".',
    genericOk:
      'the button reads only "{{text}}" next to another button, so it does not say what pressing it does. Start the label with a verb that names the action, such as "Save changes". OK is fine only as the lone button of a message that only informs, or to confirm a date or time picker.',
    confirm:
      'the alert dialog\'s action reads only "Confirm", which does not say what it confirms. Name the action with the same verb as the dialog\'s title, such as "Delete project" or "Place order".',
    inputNoValue:
      'this submit input has no value, so the browser shows a generic word such as "Submit". Give it a value that starts with a verb naming the action, such as value="Create invoice".',
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;

    /** @param {any} element @param {string} text @param {any} reportNode @param {boolean} alertAction */
    const check = (element, text, reportNode, alertAction) => {
      const w = word(text);
      if (ALWAYS.has(w)) {
        context.report({ node: reportNode, messageId: "generic", data: { text } });
      } else if (OK.has(w)) {
        if (hasNeighbourButton(element) && !nearPicker(element, keys))
          context.report({ node: reportNode, messageId: "genericOk", data: { text } });
      } else if (w === "confirm" && alertAction) {
        context.report({ node: reportNode, messageId: "confirm" });
      }
    };

    return {
      JSXElement(element) {
        const opening = element.openingElement;
        const name = elementName(opening);
        if (!name) return;
        const choice = getAttribute(opening, "aria-pressed") || ancestorInTree(element, (n) => CHOICE_GROUPS.has(n));

        if (name === "input") {
          const type = attributeValue(getAttribute(opening, "type"));
          if (!(typeof type === "string" && INPUT_BUTTONS.has(type)) || choice) return;
          const valueAttribute = getAttribute(opening, "value");
          if (!valueAttribute) {
            if (
              type === "submit" &&
              !opening.attributes.some((/** @type {any} */ a) => a.type === "JSXSpreadAttribute")
            ) {
              context.report({ node: opening, messageId: "inputNoValue" });
            }
            return;
          }
          const value = attributeValue(valueAttribute);
          if (typeof value === "string") check(element, value.trim(), valueAttribute, false);
          return;
        }

        if (!BUTTONS.has(name) || choice || getAttribute(opening, "asChild")) return;
        const text = visibleText(element);
        if (!text) return;
        const alertAction =
          name === "AlertDialogAction" ||
          (name !== "AlertDialogCancel" && Boolean(ancestorInTree(element, (n) => n === "AlertDialogFooter")));
        check(element, text, opening, alertAction);
      },
    };
  },
});
