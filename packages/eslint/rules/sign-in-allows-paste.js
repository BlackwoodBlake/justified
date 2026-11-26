/**
 * justified/sign-in-allows-paste, for FRM-008 (a rule): user name,
 * password and code fields at sign-in take a pasted value in one go.
 *
 * Flags two things:
 *   - An `onPaste` that blocks paste on a sign-in field: a handler that
 *     calls `preventDefault()` as one of its own statements without reading
 *     the clipboard, that returns `false`, or the string "return false". A
 *     handler named by a function in the same file is followed. A sign-in
 *     field is an `Input`, `input` or `InputOTP` whose `autoComplete` is
 *     `username`, `current-password`, `one-time-code` or `webauthn`, or an
 *     `InputOTP` with no `autoComplete` (it asks for a one-time code).
 *   - A code split into boxes: an `Input` or `input` with `maxLength={1}`
 *     made in a `.map()` or next to another such box, with no `onPaste` on
 *     it or on any element around it, and a sign that it holds a code:
 *     `autoComplete="one-time-code"`, or "code", "OTP", "digit", "PIN",
 *     "passcode" or "verification" in its `aria-label`, `name`, `id` or
 *     `placeholder`, or in the legend or label of an element around it.
 *
 * Left alone: `autoComplete="new-password"` and password fields with no
 * `autoComplete`, since creating an account is outside the rule; a paste
 * handler that reads `clipboardData` (it usually spreads the code across
 * the boxes) or hands the event to another function; a `preventDefault()`
 * inside a condition; boxes with a spread or in a file that listens for
 * "paste" with `addEventListener`; shadcn `InputOTP`, which spreads a
 * paste across its slots; and one-letter boxes with no sign of a code,
 * such as puzzle cells. `autoComplete="off"`,
 * clearing a filled value, selected characters of a password and tests
 * such as a CAPTCHA need the whole flow, so the review skill covers them.
 */
import { defineRule } from "../lib/define-rule.js";
import {
  attributeValue,
  elementName,
  getAttribute,
  hasSpread,
  parentElement,
  staticValue,
  unwrap,
  walk,
} from "../lib/jsx.js";

const INPUTS = new Set(["Input", "input"]);
const SIGN_IN_TOKENS = new Set(["username", "current-password", "one-time-code", "webauthn"]);
const FUNCTIONS = new Set(["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"]);
const CODE_WORDS = /\b(codes?|otp|digits?|pins?|passcodes?|verification)\b/i;
const LABELS = new Set(["legend", "FieldLegend", "Label", "FormLabel", "FieldLabel", "label"]);
const PASTE_PROPS = new Set(["onPaste", "onPasteCapture", "onpaste"]);

/** The paste handler attribute on an element. @param {any} opening */
const pasteAttribute = (opening) =>
  opening.attributes.find(
    (a) => a.type === "JSXAttribute" && a.name.type === "JSXIdentifier" && PASTE_PROPS.has(a.name.name),
  );

/** The autocomplete tokens on an element, or undefined if they are not written out. @param {any} opening */
function autocompleteTokens(opening) {
  const value = attributeValue(getAttribute(opening, "autoComplete") ?? getAttribute(opening, "autocomplete"));
  return typeof value === "string" ? value.toLowerCase().split(/\s+/).filter(Boolean) : undefined;
}

/** Whether an element is a field at sign-in, for certain. @param {any} opening */
function isSignInField(opening) {
  const name = elementName(opening);
  const tokens = autocompleteTokens(opening);
  if (name === "InputOTP")
    return !getAttribute(opening, "autoComplete") || (tokens?.some((t) => SIGN_IN_TOKENS.has(t)) ?? false);
  if (!name || !INPUTS.has(name)) return false;
  return tokens?.some((t) => SIGN_IN_TOKENS.has(t)) ?? false;
}

/** The text of a node's literal strings and template parts. @param {any} node */
function textOf(node) {
  const n = unwrap(node);
  if (!n) return "";
  if (n.type === "Literal" && typeof n.value === "string") return n.value;
  if (n.type === "TemplateLiteral") return n.quasis.map((q) => q.value.cooked ?? "").join(" ");
  if (n.type === "JSXExpressionContainer") return textOf(n.expression);
  return "";
}

/** The literal text of an element's children. @param {any} element */
const childText = (element) => element.children.map((c) => (c.type === "JSXText" ? c.value : textOf(c))).join(" ");

/**
 * Resolves a handler to a function: an inline one, or one declared in this file under that name.
 * @param {any} expression
 * @param {import("eslint").Rule.RuleContext} context
 * @param {any} node Where the handler is used, for the scope.
 */
function resolveFunction(expression, context, node) {
  const e = unwrap(expression);
  if (!e) return undefined;
  if (FUNCTIONS.has(e.type)) return e;
  if (e.type !== "Identifier") return undefined;
  for (let scope = context.sourceCode.getScope(node); scope; scope = scope.upper) {
    const variable = scope.set.get(e.name);
    if (!variable) continue;
    if (variable.defs.length !== 1) return undefined;
    const def = variable.defs[0].node;
    if (def.type === "FunctionDeclaration") return def;
    if (def.type === "VariableDeclarator" && variable.defs[0].parent?.kind === "const") {
      const init = unwrap(def.init);
      return init && FUNCTIONS.has(init.type) ? init : undefined;
    }
    return undefined;
  }
  return undefined;
}

/** Whether a statement or expression is `x.preventDefault()`. @param {any} node */
function isPreventDefault(node) {
  const n = unwrap(node);
  if (n?.type !== "CallExpression") return false;
  const c = unwrap(n.callee);
  return (
    c.type === "MemberExpression" &&
    !c.computed &&
    c.property.type === "Identifier" &&
    c.property.name === "preventDefault"
  );
}

/**
 * Whether a paste handler blocks the paste for certain.
 * @param {any} fn
 * @param {Record<string, readonly string[]>} keys
 */
function blocksPaste(fn, keys) {
  // A handler that reads the clipboard usually puts the value in itself.
  let readsClipboard = false;
  walk(fn.body, keys, (n) => {
    if (n.type === "Identifier" && n.name === "clipboardData") readsClipboard = true;
    if (
      n.type === "MemberExpression" &&
      !n.computed &&
      n.property.type === "Identifier" &&
      /^(clipboardData|getData)$/.test(n.property.name)
    )
      readsClipboard = true;
  });
  if (readsClipboard) return false;
  // A handler that hands the event on may read the clipboard elsewhere.
  const event = fn.params[0]?.type === "Identifier" ? fn.params[0].name : undefined;
  let handsOn = false;
  if (event)
    walk(fn.body, keys, (n) => {
      if (n.type === "CallExpression" && n.arguments.some((a) => a.type === "Identifier" && a.name === event))
        handsOn = true;
    });
  if (handsOn) return false;
  const body = unwrap(fn.body);
  if (body.type !== "BlockStatement")
    return isPreventDefault(body) || (body.type === "Literal" && body.value === false);
  return body.body.some(
    (s) =>
      (s.type === "ExpressionStatement" && isPreventDefault(s.expression)) ||
      (s.type === "ReturnStatement" && unwrap(s.argument)?.type === "Literal" && unwrap(s.argument).value === false),
  );
}

/** Whether an element is a one-character box. @param {any} opening */
function isBox(opening) {
  const name = elementName(opening);
  return Boolean(name && INPUTS.has(name) && attributeValue(getAttribute(opening, "maxLength")) === 1);
}

/** Whether the nearest function around an element is a `.map()` callback. @param {any} element */
function madeInMap(element) {
  let n = element.parent;
  while (n && !FUNCTIONS.has(n.type)) n = n.parent;
  if (!n || n.parent?.type !== "CallExpression" || n.parent.arguments[0] !== n) return false;
  const callee = unwrap(n.parent.callee);
  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property.type === "Identifier" &&
    callee.property.name === "map"
  );
}

/** The one-character boxes among an element's siblings, itself included. @param {any} element */
function siblingBoxes(element) {
  const parent = element.parent;
  if (parent?.type !== "JSXElement" && parent?.type !== "JSXFragment") return [element];
  return parent.children.filter((c) => c.type === "JSXElement" && isBox(c.openingElement));
}

/** Whether an element has a sign that it holds a code. @param {any} element */
function hasCodeSign(element) {
  const opening = element.openingElement;
  if (autocompleteTokens(opening)?.includes("one-time-code")) return true;
  for (const name of ["aria-label", "name", "id", "placeholder"]) {
    const a = getAttribute(opening, name);
    if (a?.value && CODE_WORDS.test(textOf(a.value))) return true;
  }
  for (let el = parentElement(element); el; el = parentElement(el)) {
    for (const name of ["legend", "label", "aria-label"]) {
      const a = getAttribute(el.openingElement, name);
      if (a?.value && CODE_WORDS.test(textOf(a.value))) return true;
    }
    for (const c of el.children) {
      if (c.type === "JSXElement" && LABELS.has(elementName(c.openingElement) ?? "") && CODE_WORDS.test(childText(c)))
        return true;
    }
  }
  return false;
}

export default defineRule({
  id: "FRM-008",
  level: "rule",
  verdict: "Requirement",
  description: "A sign-in field that blocks paste, or a code split into boxes that a paste cannot fill.",
  messages: {
    pasteBlocked:
      "this sign-in field blocks paste, so a person cannot paste a password or code, and some password managers cannot fill it. Remove the paste handler, or let it put the pasted value in the field.",
    splitCode:
      'this code is split into one-character boxes with no paste handling, so a pasted or filled-in code goes only into the first box. Use one field with autoComplete="one-time-code", or shadcn\'s InputOTP, or add an onPaste that spreads the code across the boxes.',
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;
    let listensForPaste = false;
    /** @type {any[]} */
    const boxes = [];

    return {
      CallExpression(node) {
        // element.addEventListener("paste", …) somewhere in the file may handle the boxes.
        const c = unwrap(node.callee);
        if (
          c.type === "MemberExpression" &&
          !c.computed &&
          c.property.name === "addEventListener" &&
          staticValue(node.arguments[0]) === "paste"
        )
          listensForPaste = true;
      },
      JSXOpeningElement(node) {
        const paste = pasteAttribute(node);
        if (paste && isSignInField(node)) {
          const value = paste.value;
          if (value?.type === "Literal" && typeof value.value === "string") {
            if (/return\s+false/i.test(value.value)) context.report({ node: paste, messageId: "pasteBlocked" });
          } else if (value?.type === "JSXExpressionContainer") {
            const fn = resolveFunction(value.expression, context, node);
            if (fn && blocksPaste(fn, keys)) context.report({ node: paste, messageId: "pasteBlocked" });
          }
        }
        if (isBox(node)) boxes.push(node.parent);
      },
      "Program:exit"() {
        if (listensForPaste) return;
        for (const element of boxes) {
          const opening = element.openingElement;
          if (hasSpread(opening)) continue;
          const inMap = madeInMap(element);
          const siblings = siblingBoxes(element);
          if (!inMap && (siblings.length < 2 || siblings[0] !== element)) continue;
          if (siblings.some((s) => hasSpread(s.openingElement) || pasteAttribute(s.openingElement))) continue;
          let handled = false;
          for (let el = parentElement(element); el && !handled; el = parentElement(el))
            if (pasteAttribute(el.openingElement)) handled = true;
          if (handled || !hasCodeSign(element)) continue;
          context.report({ node: opening, messageId: "splitCode" });
        }
      },
    };
  },
});
