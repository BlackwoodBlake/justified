/**
 * justified/submit-stays-enabled, for ACT-004 (a guideline): on a form that
 * does not fit on one screen at the smallest supported width, the submit
 * button stays enabled until the form is sent.
 *
 * Flags `disabled` or `aria-disabled` that reads form validity (`isValid`,
 * as in `!isValid` or `!form.formState.isValid`) on a submit button:
 * `<Button>`, `<button>` or `<input>` with `type="submit"`, or a `Button` or
 * `button` with no `type` directly inside a `<form>`.
 *
 * Whether a form fits on one screen shows only when it runs. To stay clear
 * of short forms, which the guideline leaves out, the rule reports only
 * when the `<form>` element is in the same file and holds at least
 * `minFields` fields (default 5) it can count for certain. Fields made in a
 * `.map()` or in other components are not counted.
 *
 * Left alone: `disabled={isSubmitting}` and other states while sending
 * (STA-005a and STA-005b), buttons with `asChild`, and validity read
 * through a variable of another name, such as `disabled={!canSend}`.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, findAncestorElement, getAttribute, readsName, walk } from "../lib/jsx.js";

const BUTTONS = new Set(["Button", "button"]);
/** Elements that are one field each, with what is inside them. */
const FIELD_GROUPS = new Set(["FormField", "Field", "FormItem", "RadioGroup", "InputOTP"]);
/** Controls that are one field each. */
const CONTROLS = new Set(["Input", "Textarea", "Select", "NativeSelect", "Checkbox", "Switch", "Slider", "input", "textarea", "select"]);
const NOT_FIELDS = new Set(["hidden", "submit", "button", "reset", "image"]);

/**
 * The fields a form holds for certain, outside `.map()` callbacks.
 * @param {any} form A JSXElement.
 * @param {Record<string, readonly string[]>} keys
 */
function countFields(form, keys) {
  let count = 0;
  walk(form, keys, (n) => {
    if (n.type === "CallExpression" && n.callee.type === "MemberExpression" && !n.callee.computed && n.callee.property.name === "map") return false;
    if (n.type !== "JSXElement" || n === form) return undefined;
    const name = elementName(n.openingElement) ?? "";
    const base = name.split(".").pop() ?? "";
    if (FIELD_GROUPS.has(base)) {
      count++;
      return false;
    }
    if (CONTROLS.has(base) || CONTROLS.has(name)) {
      const type = attributeValue(getAttribute(n.openingElement, "type"));
      if (!(typeof type === "string" && NOT_FIELDS.has(type))) count++;
      return false;
    }
    return undefined;
  });
  return count;
}

export default defineRule({
  id: "ACT-004",
  level: "guideline",
  verdict: "Split (1 of 2)",
  description: "A submit button on a longer form that is disabled until the form is valid.",
  type: "suggestion",
  schema: [
    {
      type: "object",
      properties: { minFields: { type: "integer", minimum: 1 } },
      additionalProperties: false,
    },
  ],
  messages: {
    disabledUntilValid:
      "this submit button is off until the form is valid, on a form with {{count}} fields. If the form does not fit on one screen at the smallest width you support, the person may not see which field holds it back. Keep the button enabled and show what is missing when it is pressed. Turning it off while the form is sending, as with isSubmitting, is fine.",
  },
  create(context) {
    const minFields = context.options[0]?.minFields ?? 5;
    const keys = context.sourceCode.visitorKeys;
    const isForm = (/** @type {string} */ name) => name === "form";

    return {
      JSXOpeningElement(node) {
        const name = elementName(node);
        if (!name || !(BUTTONS.has(name) || name === "input")) return;
        if (getAttribute(node, "asChild")) return;
        const typeAttribute = getAttribute(node, "type");
        const type = attributeValue(typeAttribute);
        const form = findAncestorElement(node, isForm);
        const submit = type === "submit" || (!typeAttribute && BUTTONS.has(name) && form);
        if (!submit || !form) return;
        for (const attr of ["disabled", "aria-disabled"]) {
          const attribute = getAttribute(node, attr);
          if (!attribute?.value || attribute.value.type !== "JSXExpressionContainer") continue;
          if (!readsName(attribute.value.expression, keys, (n) => n === "isValid")) continue;
          const count = countFields(form, keys);
          if (count < minFields) return;
          context.report({ node: attribute, messageId: "disabledUntilValid", data: { count: String(count) } });
          return;
        }
      },
    };
  },
});
