/**
 * justified/fields-take-paste, for FRM-017 (a guideline): outside sign-in,
 * every text field and text area takes a pasted value.
 *
 * Flags a paste that is cancelled for certain: a handler that calls
 * `preventDefault()` as one of its own statements, or returns `false`, and
 * does not read the clipboard or hand the event on. It looks at:
 *   - `onPaste` on an `Input`, `input`, `Textarea` or `textarea` that
 *     takes text, and on a `<form>`, where it cancels a paste into every
 *     field inside;
 *   - `onPaste="return false"`;
 *   - `document`, `window` or `document.body` `.addEventListener("paste", …)`.
 * A handler named by a function in the same file is followed.
 *
 * Left alone: sign-in fields, which justified/sign-in-allows-paste
 * (FRM-008) covers: an `autoComplete` of `username`, `current-password`,
 * `one-time-code` or `webauthn`, and `InputOTP`. A password field with no
 * `autoComplete` is also left alone, since it may be either rule's, and so
 * are a form holding any of these and a page-wide listener in a file that
 * has one. A
 * handler that reads `clipboardData` usually puts the value in itself, so
 * it is left alone, as is a `preventDefault()` inside a condition. A field
 * where typing is the task, such as a typing test, may refuse paste (see
 * Exceptions); lint cannot tell, so the message says so. Codes split over
 * several boxes, key filters, masking libraries and cut pastes need
 * judgement or the running page; `maxLength` and `slice` on free text are
 * justified/limit-reached-in-words (FRM-017c).
 */
import { defineRule } from "../lib/define-rule.js";
import { blocksPaste, isSingleLine, resolveFunction } from "../lib/form-entry-helpers.js";
import { attributeValue, elementName, getAttribute, staticValue, unwrap, walk } from "../lib/jsx.js";

const PASTE_PROPS = new Set(["onPaste", "onPasteCapture", "onpaste"]);
const SIGN_IN_TOKENS = new Set(["username", "current-password", "one-time-code", "webauthn"]);
const AREAS = new Set(["Textarea", "textarea"]);

/** The paste handler attribute on an element. @param {any} opening */
const pasteAttribute = (opening) =>
  opening.attributes.find(
    (/** @type {any} */ a) => a.type === "JSXAttribute" && a.name.type === "JSXIdentifier" && PASTE_PROPS.has(a.name.name),
  );

/** Whether a field is one this guideline covers, for certain. @param {any} opening */
function isCoveredField(opening) {
  const name = elementName(opening) ?? "";
  if (name === "form") return true;
  if (!AREAS.has(name) && isSingleLine(opening) !== true) return false;
  const auto = getAttribute(opening, "autoComplete") ?? getAttribute(opening, "autocomplete");
  if (auto) {
    const value = attributeValue(auto);
    if (typeof value !== "string") return false;
    if (value.toLowerCase().split(/\s+/).some((t) => SIGN_IN_TOKENS.has(t))) return false;
  } else if (String(attributeValue(getAttribute(opening, "type")) ?? "").toLowerCase() === "password") return false;
  // type={shown ? "text" : "password"} with no autoComplete may be a sign-in field.
  const type = getAttribute(opening, "type");
  if (!auto && type && typeof attributeValue(type) !== "string") return false;
  return true;
}

/** Whether a listener target is the whole page. @param {any} node */
function isPage(node) {
  const n = unwrap(node);
  if (n?.type === "Identifier") return n.name === "document" || n.name === "window";
  return (
    n?.type === "MemberExpression" &&
    !n.computed &&
    unwrap(n.object)?.type === "Identifier" &&
    unwrap(n.object).name === "document" &&
    n.property.name === "body"
  );
}

/** Whether an element is, or may be, a sign-in field (FRM-008's). @param {any} opening */
function maybeSignIn(opening) {
  const name = elementName(opening) ?? "";
  if (name === "InputOTP") return true;
  if (name !== "Input" && name !== "input") return false;
  const auto = attributeValue(getAttribute(opening, "autoComplete") ?? getAttribute(opening, "autocomplete"));
  if (typeof auto === "string" && auto.toLowerCase().split(/\s+/).some((t) => SIGN_IN_TOKENS.has(t))) return true;
  // A password field whose purpose the code does not state may be a sign-in field.
  if (getAttribute(opening, "autoComplete") ?? getAttribute(opening, "autocomplete")) return false;
  const type = getAttribute(opening, "type");
  if (!type) return false;
  const value = attributeValue(type);
  return value === "password" || typeof value !== "string";
}

export default defineRule({
  id: "FRM-017",
  level: "guideline",
  verdict: "Insufficient evidence (0 of 3 judges spoke)",
  description: "A text field, a form or the page that cancels paste, outside sign-in.",
  messages: {
    pasteBlocked:
      "this cancels paste, so people have to retype a value they could have copied, which is slow and easy to get wrong. Remove the handler, or let it put the pasted text in the field. Refusing paste fits only a field where typing is the task, such as a typing test.",
    pageBlocked:
      "this listener cancels paste on the whole page, so no field takes a pasted value. Remove it, or let it put the pasted text in the field.",
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;
    let signIn = false;
    /** @type {any[]} */
    const forms = [];
    /** @type {any[]} */
    const pages = [];
    return {
      JSXOpeningElement(node) {
        if (maybeSignIn(node)) signIn = true;
        const paste = pasteAttribute(node);
        if (!paste || !isCoveredField(node)) return;
        const value = paste.value;
        if (value?.type === "Literal" && typeof value.value === "string") {
          if (/return\s+false/i.test(value.value)) context.report({ node: paste, messageId: "pasteBlocked" });
          return;
        }
        if (value?.type !== "JSXExpressionContainer") return;
        const fn = resolveFunction(value.expression, context, node);
        if (!fn || !blocksPaste(fn, keys)) return;
        // A form's handler covers its fields; a sign-in form is FRM-008's, so it waits for the whole file.
        if (elementName(node) === "form") forms.push({ form: node.parent, paste });
        else context.report({ node: paste, messageId: "pasteBlocked" });
      },
      CallExpression(node) {
        const c = unwrap(node.callee);
        if (c?.type !== "MemberExpression" || c.computed || c.property.name !== "addEventListener") return;
        if (staticValue(node.arguments[0]) !== "paste" || !isPage(c.object)) return;
        const fn = resolveFunction(node.arguments[1], context, node);
        if (fn && blocksPaste(fn, keys)) pages.push(node);
      },
      "Program:exit"() {
        for (const { form, paste } of forms) {
          let holdsSignIn = false;
          walk(form, keys, (n) => {
            if (n.type === "JSXOpeningElement" && maybeSignIn(n)) holdsSignIn = true;
          });
          if (!holdsSignIn) context.report({ node: paste, messageId: "pasteBlocked" });
        }
        // A page-wide listener on a page with a sign-in field is FRM-008's.
        if (!signIn) for (const node of pages) context.report({ node, messageId: "pageBlocked" });
      },
    };
  },
});
