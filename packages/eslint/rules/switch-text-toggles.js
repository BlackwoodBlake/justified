/**
 * justified/switch-text-toggles, for FRM-016b (a guideline): a press on the
 * text of a switch turns it on or off, as a press on the switch does.
 *
 * Controls: shadcn's `Switch` and a native `input` or `button` with
 * `role="switch"`. The check is the one FRM-016a uses, in
 * `lib/label-target-helpers.js`: text beside the switch in a span, p or div
 * that is tied to nothing; a Label beside it with no htmlFor or with an
 * htmlFor that names nothing that can take a label; a hard-coded id in a
 * .map() that a label points at; a bare pointer-events-none on a tied
 * label; and a row onClick that flips the same state.
 *
 * A switch with no name at all is left to justified/control-has-name
 * (FRM-010). A switch with no text of its own is never reported. The
 * justify-between row whose Label is passed to a component as a prop is
 * not reached: what that component renders is not in the file.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, getAttribute } from "../lib/jsx.js";
import { labelTargetListener, labelTargetMessages } from "../lib/label-target-helpers.js";

/** @param {any} opening */
function kindOf(opening) {
  const name = elementName(opening);
  if (name === "Switch") return "switch";
  if ((name === "input" || name === "button") && attributeValue(getAttribute(opening, "role")) === "switch") return "switch";
  return undefined;
}

export default defineRule({
  id: "FRM-016b",
  level: "guideline",
  verdict: "Insufficient evidence (1 of 3 judges spoke)",
  description: "Switch text that a press cannot reach: tied to no switch, or blocked.",
  messages: labelTargetMessages,
  create(context) {
    return labelTargetListener(context, kindOf);
  },
});
