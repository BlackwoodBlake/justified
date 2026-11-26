/**
 * justified/digit-field-keypad, for FRM-014a (a guideline): a text field
 * that takes only digits gets `inputMode="numeric"`, one that takes a
 * decimal number gets `inputMode="decimal"`, and neither goes on a field
 * that takes letters.
 *
 * Flags, on an `Input` or `input` with no `type` or `type="text"`:
 *   - `autoComplete="cc-number"` or `"cc-csc"` with no `inputMode`.
 *   - A field validated as digits only, with no `inputMode`: its `pattern`
 *     is digits only, such as `[0-9]*` or `\d{6}`, or the Zod entry its
 *     form field name points at has a `.regex()` such as `/^\d{6}$/`.
 *   - A field validated as a decimal number with no minus sign, such as
 *     `/^\d+([.,]\d+)?$/`, with no `inputMode`.
 *   - `inputMode="numeric"` or `"decimal"` on a field whose `pattern` or
 *     Zod `.regex()` allows letters, such as `/^[A-Z]{2}-\d+$/`.
 *
 * Left alone: phone fields (`type="tel"`, `autoComplete="tel"`, or a
 * label or name for a phone number), which FRM-014 covers; `inputMode`
 * set to anything, even a different keypad; a pattern that allows a minus
 * sign, or one we cannot read for certain; a field with more than one
 * `.regex()`; a Zod entry the field is not visibly bound to; computed
 * values and spreads other than react-hook-form's `{...field}` and
 * `{...register()}`. `type="number"` is FRM-014b's check, and
 * `type="tel"` on a card number is our own advice, not the rule.
 */
import { defineRule } from "../lib/define-rule.js";
import {
  autocompleteField,
  fieldLabel,
  formFieldName,
  isInput,
  isTextType,
  labelIndex,
  otherNames,
  patternKind,
  propValue,
  schemaEntries,
  schemaRegexes,
} from "../lib/input-value-helpers.js";

const CARD = new Set(["cc-number", "cc-csc"]);
const PHONE_WORDS = /\b(phone|mobile|telephone|tel|cell)\b/;

/**
 * Whether the field's placeholder or default value shows a decimal point
 * or comma, which a digits-only pattern contradicts, so the keypad it
 * needs is unclear.
 * @param {any} opening
 */
const showsDecimal = (opening) =>
  ["placeholder", "defaultValue", "value"].some((n) => /\d[.,]\d/.test(String(propValue(opening, n) ?? "")));

export default defineRule({
  id: "FRM-014a",
  level: "guideline",
  verdict: "Insufficient evidence (1 of 3 judges spoke)",
  type: "suggestion",
  description: "Digit-only and decimal text fields without the keypad inputMode, and a digit keypad on a field that takes letters.",
  messages: {
    noNumeric:
      'this text field takes only digits but has no inputMode, so a phone shows the standard keyboard with the digits behind a layout switch. Add inputMode="numeric" and keep the text type.',
    noDecimal:
      'this text field takes a number with a decimal part but has no inputMode, so a phone shows the standard keyboard. Add inputMode="decimal".',
    keypadForLetters:
      'this field has inputMode="{{mode}}" but its pattern allows letters, and some digit keypads have no letter keys. Remove the inputMode.',
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;
    const labels = labelIndex();
    /** @type {any[]} */
    const inputs = [];
    /** @type {Map<string, any>} */
    let schema = new Map();

    /** What the field's validation allows, from its pattern or its Zod entry. @param {any} element */
    function validation(element) {
      const pattern = propValue(element.openingElement, "pattern");
      if (typeof pattern === "string") return patternKind(pattern, { anchored: false });
      const name = formFieldName(element) ?? propValue(element.openingElement, "name");
      if (typeof name !== "string" || !schema.has(name)) return undefined;
      const regexes = schemaRegexes(schema.get(name), keys);
      return regexes.length === 1 ? patternKind(regexes[0].source) : undefined;
    }

    return {
      Program(node) {
        schema = schemaEntries(node, keys);
      },
      JSXElement(element) {
        labels.see(element);
        if (isInput(element.openingElement)) inputs.push(element);
      },
      "Program:exit"() {
        for (const element of inputs) {
          const opening = element.openingElement;
          if (isTextType(opening) !== true) continue;
          const mode = propValue(opening, "inputMode");
          if (mode === undefined) continue;
          const auto = autocompleteField(opening);
          if (typeof auto === "string" && /^tel/.test(auto)) continue;
          const label = fieldLabel(element, labels);
          if ([label ?? "", ...otherNames(element)].some((n) => PHONE_WORDS.test(n))) continue;
          const kind = validation(element);

          if (mode === "numeric" || mode === "decimal") {
            if (kind === "letters") context.report({ node: opening, messageId: "keypadForLetters", data: { mode } });
            continue;
          }
          if (mode !== null && mode !== "text") continue;
          if (typeof auto === "string" && CARD.has(auto)) context.report({ node: opening, messageId: "noNumeric" });
          else if (kind === "digits" && !showsDecimal(opening)) context.report({ node: opening, messageId: "noNumeric" });
          else if (kind === "decimal") context.report({ node: opening, messageId: "noDecimal" });
        }
      },
    };
  },
});
