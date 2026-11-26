/**
 * justified/option-text-toggles, for FRM-016a (a rule): a press on the text
 * of a checkbox or radio button checks it, as a press on the box does.
 *
 * Controls: shadcn's `Checkbox` and `RadioGroupItem`, and a native `input`
 * of type checkbox or radio. What is flagged and what is left alone is
 * described in `lib/label-target-helpers.js`, which FRM-016b shares. In
 * short: text beside the control in a span, p or div that is tied to
 * nothing; a Label beside it with no htmlFor or with an htmlFor that names
 * nothing that can take a label; a hard-coded id in a .map() that a label
 * points at; a bare pointer-events-none on a tied label; and a row onClick
 * that toggles the same state.
 *
 * A control with no name at all is left to justified/control-has-name
 * (FRM-010), so one fault is not reported twice. A checkbox with no text of
 * its own, such as one that selects a table row, is outside the rule and is
 * never reported. A switch is FRM-016b.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, getAttribute } from "../lib/jsx.js";
import { labelTargetListener, labelTargetMessages } from "../lib/label-target-helpers.js";

/** @param {any} opening */
function kindOf(opening) {
  const name = elementName(opening);
  if (name === "Checkbox") return "checkbox";
  if (name === "RadioGroupItem") return "radio button";
  if (name !== "input" || getAttribute(opening, "role")) return undefined;
  const type = attributeValue(getAttribute(opening, "type"));
  return type === "checkbox" ? "checkbox" : type === "radio" ? "radio button" : undefined;
}

export default defineRule({
  id: "FRM-016a",
  level: "rule",
  verdict: "Unanimous (2 of 2)",
  description: "Checkbox and radio button text that a press cannot reach: tied to no control, or blocked.",
  messages: labelTargetMessages,
  create(context) {
    return labelTargetListener(context, kindOf);
  },
});
