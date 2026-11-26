/**
 * justified/error-timing, for FRM-002b: a new error shows when the person
 * leaves a field they changed, or sends the form, never while they type;
 * a shown error goes as soon as the value is valid.
 *
 * Flags react-hook-form's `useForm` options that are certain to do
 * otherwise:
 *   - `mode: "onChange"` or `"all"`: new errors while typing.
 *   - `mode: "onBlur"` or `"onTouched"`: an error on a field that was only
 *     tabbed past; `onTouched` then also shows new errors while typing.
 *   - `reValidateMode: "onBlur"` or `"onSubmit"`: a fixed value keeps its
 *     error until the field is left or the form sent again.
 *
 * Left out, because the code alone cannot settle them:
 *   - The exception for a new value with its rules shown beside the field,
 *     such as a new password. A file with `autoComplete="new-password"`
 *     gets no `mode` reports, since the mode may be there for that field.
 *   - `setError`, `trigger()` or a `safeParse` in an `onChange` handler, and
 *     server checks on each change: whether they add an error or only clear
 *     one takes judgement. The review skill covers them.
 *   - Options that are not written as an object literal in the call.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, importedNames, staticValue, unwrap } from "../lib/jsx.js";

const TYPING = new Set(["onChange", "all"]);

export default defineRule({
  id: "FRM-002b",
  level: "rule",
  verdict: "Unanimous (2 of 2)",
  description: "react-hook-form validation modes that show an error while the person types, on a field they only tabbed past, or after the value is fixed.",
  hasSuggestions: true,
  messages: {
    typing:
      'mode "{{mode}}" checks every field on each key press, so a new error can appear while the person is still typing. Leave mode at its default ("onSubmit") and check a field when the person leaves it after a change, for example by calling trigger() from onBlur when the field is dirty.',
    onBlur:
      'mode "onBlur" shows an error on a field the person only tabbed past, and keeps a shown error until the field is left again. Leave mode at its default ("onSubmit") and check a field on blur only when it was changed.',
    onTouched:
      'mode "onTouched" shows an error on a field the person only tabbed past, and from then on checks it on every key press. Leave mode at its default ("onSubmit") and check a field on blur only when it was changed.',
    revalidate:
      'reValidateMode "{{mode}}" keeps a shown error after the person has fixed the value, until they leave the field or send the form again. Use the default reValidateMode ("onChange"), so the error goes as soon as the value is valid.',
    suggestRemoveRevalidate: 'Remove reValidateMode, so the default "onChange" clears a fixed error at once.',
  },
  create(context) {
    const sourceCode = context.sourceCode;
    /** Local names of react-hook-form's useForm, and namespaces it is imported under. */
    const names = new Set();
    const namespaces = new Set();
    let newPassword = false;
    /** @type {{ node: any, messageId: string, mode: string }[]} */
    const modeHits = [];

    /** Removes an object property and the comma after it. @param {any} property */
    const removeProperty = (property) => (/** @type {import("eslint").Rule.RuleFixer} */ fixer) => {
      const after = sourceCode.getTokenAfter(property);
      const end = after && after.value === "," ? after.range[1] : property.range[1];
      return fixer.removeRange([property.range[0], end]);
    };

    return {
      ImportDeclaration(node) {
        const found = importedNames(node, "react-hook-form", "useForm");
        found.named.forEach((n) => names.add(n));
        found.namespaces.forEach((n) => namespaces.add(n));
      },
      JSXAttribute(node) {
        const name = node.name.type === "JSXIdentifier" ? node.name.name : "";
        if ((name === "autoComplete" || name === "autocomplete") && String(attributeValue(node)).includes("new-password")) newPassword = true;
      },
      CallExpression(node) {
        const callee = unwrap(node.callee);
        const isUseForm =
          (callee.type === "Identifier" && names.has(callee.name)) ||
          (callee.type === "MemberExpression" &&
            !callee.computed &&
            callee.object.type === "Identifier" &&
            namespaces.has(callee.object.name) &&
            callee.property.type === "Identifier" &&
            callee.property.name === "useForm");
        if (!isUseForm) return;
        const options = unwrap(node.arguments[0]);
        if (!options || options.type !== "ObjectExpression") return;
        for (const property of options.properties) {
          if (property.type !== "Property" || property.computed) continue;
          const key = property.key.type === "Identifier" ? property.key.name : property.key.value;
          const value = staticValue(property.value);
          if (typeof value !== "string") continue;
          if (key === "mode") {
            const messageId = TYPING.has(value) ? "typing" : value === "onBlur" ? "onBlur" : value === "onTouched" ? "onTouched" : null;
            if (messageId) modeHits.push({ node: property, messageId, mode: value });
          } else if (key === "reValidateMode" && (value === "onBlur" || value === "onSubmit")) {
            context.report({
              node: property,
              messageId: "revalidate",
              data: { mode: value },
              suggest: [{ messageId: "suggestRemoveRevalidate", fix: removeProperty(property) }],
            });
          }
        }
      },
      "Program:exit"() {
        // A new password with its rules beside it may check while typing (see the rule's Exceptions).
        if (newPassword) return;
        for (const hit of modeHits) context.report({ node: hit.node, messageId: hit.messageId, data: { mode: hit.mode } });
      },
    };
  },
});
