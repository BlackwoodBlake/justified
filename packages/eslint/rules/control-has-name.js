/**
 * justified/control-has-name, for FRM-010 (a rule): every form control has
 * a name in code, and when it shows label text, the name contains it.
 *
 * Controls are `Input`, `Textarea`, `NativeSelect`, `SelectTrigger`,
 * `Checkbox`, `Switch`, `RadioGroupItem`, the native `input` (not hidden,
 * submit, button, reset or image), `textarea` and `select`, and any element
 * with `role="combobox"`. Flags:
 *   - A control with no possible source of a name: no `id` (a label may
 *     point at it from anywhere), no `aria-label`, `aria-labelledby`,
 *     `title` or `placeholder`, no spread props, and no element around it
 *     that names it: a `label` or `Label`, shadcn's `FormItem`,
 *     `FormControl` or `FormField`, a `Field`, or any element whose name
 *     ends in "Label" or "Field" or that takes a `label` prop, since a
 *     project's own wrapper may tie the label.
 *   - A written-out `aria-label` that does not contain the control's
 *     written-out visible label, compared without case and punctuation.
 *     The label is read from a `Field label="..."` around the control, a
 *     `FormLabel` in the same `FormItem`, a `label` or `Label` that wraps
 *     the control, or a `Label htmlFor` in the same file that matches the
 *     control's `id`. Text in parentheses, such as "(optional)", is left
 *     out of the comparison: that marker is FRM-005, not this rule.
 *   - A `Switch` or `Checkbox` whose `aria-label` switches between two
 *     written-out texts on the same value as its `checked` prop.
 *
 * Left alone: a `Label` with no matching control (eslint-plugin-jsx-a11y's
 * label-has-associated-control covers it), a radio group under a plain
 * question (whether each option makes sense alone takes judgement), a
 * control a component returns with nothing around it (its caller may wrap
 * it in a label), a control passed as a prop such as `render={<Input />}`
 * (the component that takes it may add the name), labels whose text is
 * computed, and visible text that spells no word.
 */
import { defineRule } from "../lib/define-rule.js";
import {
  attributeValue,
  baseName,
  elementName,
  getAttribute,
  hasSpread,
  isPropValue,
  parentElement,
  unwrap,
} from "../lib/jsx.js";
import {
  containsWords,
  iconImports,
  isAriaHidden,
  spellsWord,
  stringAttribute,
  visibleText,
} from "../lib/name-helpers.js";

const CONTROLS = new Set([
  "Input",
  "Textarea",
  "NativeSelect",
  "SelectTrigger",
  "Checkbox",
  "Switch",
  "RadioGroupItem",
  "input",
  "textarea",
  "select",
]);
const NOT_CONTROLS = new Set(["hidden", "submit", "button", "reset", "image"]);
/** Controls whose placeholder becomes the name when nothing else gives one. */
const PLACEHOLDER_NAMES = new Set(["Input", "Textarea", "input", "textarea"]);
const NAMING = new Set(["label", "Label", "FieldLabel", "Field", "FormItem", "FormControl", "FormField"]);
const TOGGLES = new Set(["Switch", "Checkbox"]);
const LABELS = new Set(["label", "Label", "FieldLabel", "FormLabel"]);

/** Label text for comparing: without parts in parentheses. @param {string} text */
const labelWords = (text) =>
  text
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Strips leading `!` from an expression. @param {any} node */
const stripNot = (node) => {
  let n = unwrap(node);
  while (n.type === "UnaryExpression" && n.operator === "!") n = unwrap(n.argument);
  return n;
};

export default defineRule({
  id: "FRM-010",
  level: "rule",
  verdict: "Requirement",
  description:
    "Form controls with no source of a name, an aria-label without the visible label, or a name that changes with the state.",
  messages: {
    noName:
      "this {{control}} has no name in code: no label is tied to it and it has no aria-label, so a screen reader announces only the kind of control. Tie its visible label to it, with a Label whose htmlFor matches the control's id, a wrapping label, or Field, or give it an aria-label.",
    labelMissesText:
      'the aria-label "{{label}}" does not contain the visible label "{{text}}", and an aria-label replaces the label as the name, so a speech command for the words on screen does nothing. Remove the aria-label, or put the visible words in it in the same order.',
    nameFollowsState:
      'the aria-label changes between "{{a}}" and "{{b}}" as the control is turned on and off. On or off is the state, which the control reports by itself. Keep one name that matches the visible label in both states.',
  },
  create(context) {
    const sourceCode = context.sourceCode;
    /** @type {Set<string>} */
    let icons = new Set();
    /** Visible text of labels with a written-out htmlFor, by that id. @type {Map<string, string | undefined>} */
    const labelsFor = new Map();
    /** Controls with an id and an aria-label, checked against labelsFor at the end. @type {{ node: any, id: string, label: string }[]} */
    const byId = [];

    /** @param {any} element @param {string} label @param {string | undefined} text */
    const compare = (element, label, text) => {
      if (text === undefined) return;
      const words = labelWords(text);
      if (!spellsWord(words) || containsWords(label, words)) return;
      context.report({
        node: getAttribute(element.openingElement, "aria-label"),
        messageId: "labelMissesText",
        data: { label, text: words },
      });
    };

    /** The visible label around a control, or `undefined`. @param {any} element */
    function surroundingLabel(element) {
      const parent = parentElement(element);
      if (parent && baseName(parent.openingElement) === "Field") {
        const label = stringAttribute(parent.openingElement, "label");
        if (label !== undefined) return label;
      }
      let insideControl = false;
      for (let el = parent; el; el = parentElement(el)) {
        const name = elementName(el.openingElement) ?? "";
        if (name === "FormControl") insideControl = true;
        if (name === "label" || name === "Label") return visibleText(el, icons, (e) => e === element);
        if (name === "FormItem") {
          if (!insideControl) return undefined;
          const formLabel = el.children.find(
            (c) => c.type === "JSXElement" && elementName(c.openingElement) === "FormLabel",
          );
          return formLabel ? visibleText(formLabel, icons) : undefined;
        }
      }
      return undefined;
    }

    return {
      Program(node) {
        icons = iconImports(node);
      },
      JSXElement(element) {
        const opening = element.openingElement;
        const name = elementName(opening) ?? "";

        if (LABELS.has(name)) {
          const target = stringAttribute(opening, "htmlFor");
          // Two labels for one id, or a spread, leave the label text unknown.
          if (target !== undefined)
            labelsFor.set(
              target,
              labelsFor.has(target) || hasSpread(opening) ? undefined : visibleText(element, icons),
            );
          return;
        }

        const role = attributeValue(getAttribute(opening, "role"));
        if (!CONTROLS.has(name) && role !== "combobox") return;
        const type = attributeValue(getAttribute(opening, "type"));
        if ((name === "input" || name === "Input") && typeof type === "string" && NOT_CONTROLS.has(type)) return;
        if (hasSpread(opening) || isAriaHidden(opening) || isPropValue(element)) return;

        const ariaLabel = getAttribute(opening, "aria-label");
        const labelledBy = getAttribute(opening, "aria-labelledby");
        const id = getAttribute(opening, "id");

        // 1. No source of a name.
        if (!ariaLabel && !labelledBy && !id && !getAttribute(opening, "title")) {
          if (PLACEHOLDER_NAMES.has(name) && getAttribute(opening, "placeholder")) return;
          const parent = parentElement(element);
          // A control a component returns on its own may be wrapped in a label by the caller.
          if (!parent) return;
          for (let el = parent; el; el = parentElement(el)) {
            const n = baseName(el.openingElement) ?? "";
            if (NAMING.has(n) || /(Label|Field)$/.test(n) || getAttribute(el.openingElement, "label")) return;
          }
          context.report({
            node: opening,
            messageId: "noName",
            data: { control: role === "combobox" ? "combo box" : name },
          });
          return;
        }

        if (!ariaLabel || labelledBy) return;

        // 5. A name that follows the state.
        const checked = getAttribute(opening, "checked");
        if (
          (TOGGLES.has(name) || (name === "input" && type === "checkbox")) &&
          checked?.value?.type === "JSXExpressionContainer"
        ) {
          const v = ariaLabel.value?.type === "JSXExpressionContainer" ? unwrap(ariaLabel.value.expression) : undefined;
          if (v?.type === "ConditionalExpression") {
            const a = attributeValue({ value: { type: "JSXExpressionContainer", expression: v.consequent } });
            const b = attributeValue({ value: { type: "JSXExpressionContainer", expression: v.alternate } });
            const sameValue =
              sourceCode.getText(stripNot(v.test)) === sourceCode.getText(stripNot(checked.value.expression));
            if (typeof a === "string" && typeof b === "string" && a !== b && sameValue) {
              context.report({ node: ariaLabel, messageId: "nameFollowsState", data: { a, b } });
              return;
            }
          }
        }

        // 2. An aria-label without the visible label.
        const label = stringAttribute(opening, "aria-label");
        if (label === undefined) return;
        const around = surroundingLabel(element);
        if (around !== undefined) {
          compare(element, label, around);
          return;
        }
        const idValue = stringAttribute(opening, "id");
        if (idValue !== undefined) byId.push({ node: element, id: idValue, label });
      },
      "Program:exit"() {
        for (const { node, id, label } of byId) if (labelsFor.has(id)) compare(node, label, labelsFor.get(id));
      },
    };
  },
});
