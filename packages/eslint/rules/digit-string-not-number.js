/**
 * justified/digit-string-not-number, for FRM-014b (a guideline): a string
 * of digits that is not a quantity, such as a code, a card number or a
 * postcode, goes in a text input, never `type="number"`.
 *
 * Flags `type="number"` on an `Input` or `input` that:
 *   - has `autoComplete` set to `one-time-code`, `cc-number`, `cc-csc`,
 *     `tel`, `tel-national` or `postal-code`, or
 *   - has a written-out label for a code, PIN, card, account, member,
 *     customer or order number, phone number or postcode, such as
 *     "Membership number" or "Sign-in code". Classes that hide the spinner,
 *     such as `[appearance:textfield]`, change nothing.
 *
 * Left alone: quantities, such as "Tables", "Amount" or "Year", which the
 * guideline takes no side on; a label that starts "Number of" or "How
 * many", which counts something; names, ids and placeholders, which are
 * not labels; and a computed `type`, `autoComplete` or label.
 */
import { defineRule } from "../lib/define-rule.js";
import { autocompleteField, fieldLabel, isInput, labelIndex, propValue } from "../lib/input-value-helpers.js";

const DIGIT_STRINGS = new Set(["one-time-code", "cc-number", "cc-csc", "tel", "tel-national", "postal-code"]);
const LABEL =
  /\b(?:code|pin|passcode)\b|\b(?:card|account|member|membership|customer|order|phone|mobile|telephone)(?: number| no)\b|\bpost ?code\b|\bpostal code\b|\bzip(?: code)?\b/;
const COUNTS = /^(?:number of|how many|count of)\b/;

export default defineRule({
  id: "FRM-014b",
  level: "guideline",
  verdict: "Insufficient evidence (1 of 3 judges spoke)",
  type: "suggestion",
  description: "A code, card, account, phone or postcode field in a number input.",
  messages: {
    numberType:
      'this field holds a string of digits, not a quantity, but has type="number", so a leading zero can be lost, spaces are refused and the arrow keys change the value. Use a text input with inputMode="numeric" (type="tel" for a phone number) and check the value as a string.',
  },
  create(context) {
    const labels = labelIndex();
    /** @type {any[]} */
    const inputs = [];

    return {
      JSXElement(element) {
        labels.see(element);
        if (isInput(element.openingElement) && propValue(element.openingElement, "type") === "number") inputs.push(element);
      },
      "Program:exit"() {
        for (const element of inputs) {
          const opening = element.openingElement;
          const auto = autocompleteField(opening);
          let digits = typeof auto === "string" && DIGIT_STRINGS.has(auto);
          if (!digits) {
            const label = fieldLabel(element, labels);
            digits = Boolean(label && LABEL.test(label) && !COUNTS.test(label));
          }
          if (digits) context.report({ node: opening, messageId: "numberType" });
        }
      },
    };
  },
});
