/**
 * justified/input-type-matches-value, for FRM-014 (a guideline): a field
 * that asks only for an email address, a phone number or a web address
 * gets `type="email"`, `type="tel"` or `type="url"`.
 *
 * Flags, on an `Input` or `input`:
 *   - No `type`, or `type="text"`, on a field with `autoComplete="email"`,
 *     `"tel"`, `"tel-national"` or `"url"`, or whose written-out label
 *     names only that value, such as "Email", "Work email", "Mobile number"
 *     or "Shop website".
 *   - `type="email"` on a field whose label names both an email address
 *     and a user name, such as "Email or username".
 *
 * Left alone: a field whose label, name, id or placeholder also names a
 * user name, or whose label says "or" (it takes more than one kind of
 * value); `type="number"` on a phone field (FRM-014b's check); search
 * fields; a computed `type` or `autoComplete`, and spreads other than
 * react-hook-form's `{...field}` and `{...register()}`, which may set the
 * type; `autoComplete="username"` with `type="email"`, which an
 * email-only sign-in uses correctly; and labels that are computed or come
 * from a component the file does not show.
 */
import { defineRule } from "../lib/define-rule.js";
import {
  autocompleteField,
  fieldLabel,
  isInput,
  isTextType,
  labelIndex,
  otherNames,
  propValue,
} from "../lib/input-value-helpers.js";

/** Label patterns for a field that takes only one kind of value, on normalised text. */
const LABEL_KIND = [
  { kind: "email", test: /^(?:\w+ )?(?:e ?mail)(?: address)?$/ },
  { kind: "tel", test: /^(?:\w+ )?(?:phone|mobile|telephone|cell|cell phone|mobile phone)(?: number)?$/ },
  { kind: "url", test: /^(?:\w+ )?(?:website|web address|homepage|web site)(?: address| url)?$/ },
];
const AUTOCOMPLETE_KIND = { email: "email", tel: "tel", "tel-national": "tel", url: "url" };
const USER_NAME = /\buser ?name\b|\blog ?in\b|\bhandle\b/;
const TYPE_FOR = { email: "email", tel: "tel", url: "url" };
const WHAT = { email: "an email address", tel: "a phone number", url: "a web address" };

export default defineRule({
  id: "FRM-014",
  level: "guideline",
  verdict: "Insufficient evidence (1 of 3 judges spoke)",
  type: "suggestion",
  description: "Email, phone and web address fields left as text, and an email type on a field that also takes a user name.",
  messages: {
    textType:
      'this field takes {{what}} but has the text type, so a phone shows the letters keyboard and the keys it needs sit behind a layout switch. Add type="{{type}}"; keep its autoComplete value too.',
    emailTakesUserName:
      'this field takes an email address or a user name but has type="email", so the browser\'s own check can refuse a user name and the keyboard suits only half of what it takes. Leave it as type="text".',
  },
  create(context) {
    const labels = labelIndex();
    /** @type {any[]} */
    const inputs = [];

    return {
      JSXElement(element) {
        labels.see(element);
        if (isInput(element.openingElement)) inputs.push(element);
      },
      "Program:exit"() {
        for (const element of inputs) {
          const opening = element.openingElement;
          const label = fieldLabel(element, labels);
          const names = [label ?? "", ...otherNames(element)];
          const takesUserName = names.some((n) => USER_NAME.test(n));
          const type = propValue(opening, "type");

          if (type === "email") {
            if (label && /\be ?mail\b/.test(label) && USER_NAME.test(label))
              context.report({ node: opening, messageId: "emailTakesUserName" });
            continue;
          }

          if (isTextType(opening) !== true || takesUserName) continue;
          if (label && /\bor\b/.test(label)) continue;
          const auto = autocompleteField(opening);
          let kind = typeof auto === "string" ? AUTOCOMPLETE_KIND[/** @type {keyof typeof AUTOCOMPLETE_KIND} */ (auto)] : undefined;
          // A field whose autoComplete names some other value is not this kind, whatever its label says.
          if (!kind && (auto === null || auto === "on")) kind = label ? LABEL_KIND.find((k) => k.test.test(label))?.kind : undefined;
          if (!kind) continue;
          context.report({
            node: opening,
            messageId: "textType",
            data: { what: WHAT[/** @type {keyof typeof WHAT} */ (kind)], type: TYPE_FOR[/** @type {keyof typeof TYPE_FOR} */ (kind)] },
          });
        }
      },
    };
  },
});
