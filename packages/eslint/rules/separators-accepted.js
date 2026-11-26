/**
 * justified/separators-accepted, for FRM-017a (a guideline): a phone,
 * card, account or reference number takes the spaces, hyphens, brackets
 * and dots people type or paste, and the code removes them before checking.
 *
 * Such a value is one the code names for certain: an `autoComplete` of
 * `tel`, `tel-national` or `cc-number`, `type="tel"`, or a label, `name`,
 * `id` or Zod key for a phone or mobile number, a card or account number,
 * an IBAN, or a booking, order, customer or membership reference.
 *
 * Flags:
 *   - A Zod entry for such a value, `z.string()...`, with a `.regex()` that
 *     allows no space or hyphen, or a `.length()`, and no `.transform()`,
 *     `.pipe()` or `z.preprocess()` that could clean it first.
 *   - An `onKeyDown` or `onBeforeInput` on such a field that calls
 *     `preventDefault()` when a key is not a digit, such as
 *     `if (!/\d/.test(e.key)) e.preventDefault()`.
 *   - `maxLength` on such a field, and `pattern="[0-9]*"` (any digits-only
 *     pattern) on one inside a `form` without `noValidate`.
 *   - A controlled field (with `value`) whose `onChange` rewrites the value
 *     with `.replace(/.../)`, in a file that never touches `selectionStart`,
 *     `selectionEnd` or `setSelectionRange`, so nothing puts the caret back.
 *   - A placeholder of blanks such as "(___) ___-____" on a phone field.
 *
 * Left alone: one-time codes (FRM-008), amounts and free text, which the
 * guideline excludes; a key filter that also lets through a space, hyphen
 * or plus sign, or that reads the key some other way; handlers from other
 * files; masking libraries, whose settings we cannot read; `pattern` in a
 * form whose own check is off or not in view; and computed values and
 * spreads other than react-hook-form's `{...field}` and `{...register()}`.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, findAncestorElement, getAttribute, unwrap, walk } from "../lib/jsx.js";
import {
  autocompleteField,
  callChain,
  fieldLabel,
  identifierWords,
  isInput,
  labelIndex,
  otherNames,
  patternKind,
  propValue,
  schemaEntries,
  schemaRegexes,
} from "../lib/input-value-helpers.js";

const FUNCTIONS = new Set(["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"]);
const AUTOCOMPLETE = new Set(["tel", "tel-national", "cc-number"]);
const VALUE_WORDS =
  /\b(?:phone|mobile|telephone|tel)\b|\bcard (?:number|no|num)\b|^card$|\bcc number\b|\baccount (?:number|no|num)\b|\biban\b|\b(?:booking|order|customer|member|membership) (?:reference|ref)\b|\breference (?:number|code)\b|^(?:reference|ref)$/;
const PHONE_WORDS = /\b(?:phone|mobile|telephone|tel)\b/;
const KEY_PROPS = ["onKeyDown", "onBeforeInput", "onKeyPress"];
const BLANKS = /^[\s()+.\-]*_+(?:[\s()+.\-]+_+)+[\s()+.\-]*$/;

/**
 * Whether a regex source may let a space or hyphen through: `\s`, `\W`, a
 * space, a literal hyphen (not a range such as `0-9`), a negated class or
 * a dot outside a class. When unsure, it says yes.
 * @param {string} source
 */
function allowsSeparators(source) {
  if (/\\[sW]| /.test(source)) return true;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === "\\") {
      if (source[i + 1] === "-") return true;
      i++;
      continue;
    }
    if (ch === "-" || ch === ".") return true;
    if (ch !== "[") continue;
    if (source[i + 1] === "^") return true;
    let j = i + 1;
    for (; j < source.length && source[j] !== "]"; j++) {
      if (source[j] === "\\") {
        if (source[j + 1] === "-") return true;
        j++;
      } else if (source[j] === "-" && (j === i + 1 || source[j + 1] === "]")) return true;
    }
    i = j;
  }
  return false;
}

/**
 * Resolves a handler to a function: an inline one, or a `const` or
 * function declared in this file under that name.
 * @param {any} expression
 * @param {import("eslint").Rule.RuleContext} context
 * @param {any} node
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

/** Whether a node is `x.preventDefault()`, alone or as the only statement of a block. @param {any} node */
function preventsDefault(node) {
  let n = node;
  if (n?.type === "BlockStatement") {
    if (n.body.length < 1) return false;
    n = n.body[0];
  }
  if (n?.type === "ExpressionStatement") n = n.expression;
  n = unwrap(n);
  if (n?.type !== "CallExpression") return false;
  const c = unwrap(n.callee);
  return c.type === "MemberExpression" && !c.computed && c.property.name === "preventDefault";
}

/** Whether an expression is `.key` or `.data` read from something. @param {any} node */
const readsKey = (node) => {
  const n = unwrap(node);
  return n?.type === "MemberExpression" && !n.computed && /^(key|data)$/.test(n.property.name);
};

/**
 * Whether an expression is true for every key that is not a digit:
 * `!/\d/.test(e.key)`, `!/^[0-9]$/.test(e.key)` or `/\D/.test(e.key)`.
 * @param {any} node
 */
function isNotDigitTest(node) {
  let n = unwrap(node);
  let negated = false;
  if (n?.type === "UnaryExpression" && n.operator === "!") {
    negated = true;
    n = unwrap(n.argument);
  }
  if (n?.type !== "CallExpression" || !readsKey(n.arguments[0])) return false;
  const c = unwrap(n.callee);
  if (c.type !== "MemberExpression" || c.computed || c.property.name !== "test") return false;
  const r = unwrap(c.object);
  if (r?.type !== "Literal" || !r.regex) return false;
  const p = r.regex.pattern;
  if (negated) return /^\^?(?:\\d|\[0-9\])\+?\$?$/.test(p);
  return /^(?:\\D|\[\^0-9\]|\[\^\\d\])$/.test(p);
}

/**
 * Whether a key handler refuses every key that is not a digit: an `if`
 * whose test is such a check, alone or joined by `&&` with checks that
 * name no space, hyphen or plus sign, and whose branch is
 * `preventDefault()`.
 * @param {any} fn
 * @param {Record<string, readonly string[]>} keys
 * @param {import("eslint").SourceCode} sourceCode
 */
function refusesNonDigits(fn, keys, sourceCode) {
  let found = false;
  walk(fn.body, keys, (n) => {
    if (found) return false;
    if (n.type !== "IfStatement" || !preventsDefault(n.consequent)) return undefined;
    /** @type {any[]} */
    const parts = [];
    const split = (/** @type {any} */ e) => {
      const u = unwrap(e);
      if (u.type === "LogicalExpression" && u.operator === "&&") {
        split(u.left);
        split(u.right);
      } else parts.push(u);
    };
    split(n.test);
    if (!parts.some(isNotDigitTest)) return undefined;
    const others = parts.filter((p) => !isNotDigitTest(p)).map((p) => sourceCode.getText(p));
    if (others.some((t) => /["'`](?: |-|\+|Space)["'`]|\\s|\\-|\[[^\]]*[ +-]/.test(t))) return undefined;
    found = true;
    return false;
  });
  return found;
}

/**
 * Whether an onChange handler rewrites the value it reads with `.replace()`.
 * @param {any} fn
 * @param {Record<string, readonly string[]>} keys
 */
function rewritesValue(fn, keys) {
  let found = false;
  walk(fn.body, keys, (n) => {
    if (found || n.type !== "CallExpression") return undefined;
    const c = unwrap(n.callee);
    if (c.type !== "MemberExpression" || c.computed || !/^replace(All)?$/.test(c.property.name)) return undefined;
    const pattern = unwrap(n.arguments[0]);
    if (pattern?.type !== "Literal" || !pattern.regex) return undefined;
    // The value read from the event: e.target.value or e.currentTarget.value.
    let reads = false;
    walk(c.object, keys, (m) => {
      if (
        m.type === "MemberExpression" &&
        !m.computed &&
        m.property.name === "value" &&
        unwrap(m.object)?.type === "MemberExpression" &&
        /^(target|currentTarget)$/.test(unwrap(m.object).property.name)
      )
        reads = true;
    });
    if (reads) found = true;
    return undefined;
  });
  return found;
}

export default defineRule({
  id: "FRM-017a",
  level: "guideline",
  verdict: "Insufficient evidence (0 of 3 judges spoke)",
  type: "suggestion",
  description:
    "Phone, card, account and reference fields that refuse or cut the spaces and separators people type or paste.",
  messages: {
    rawCheck:
      'this schema checks a {{what}} as typed, so a value with a space or hyphen, as people often write it, fails. Remove spaces, hyphens, brackets and dots first, for example z.string().transform((v) => v.replace(/[\\s\\-().]/g, "")).pipe(z.string().regex(...)).',
    keysRefused:
      "this key handler refuses every key that is not a digit, so a typed space, hyphen or plus sign does nothing. Let the keys through and remove the separators before checking.",
    maxLength:
      "maxLength on this {{what}} field counts the spaces and hyphens people write, so a pasted value loses its last characters with nothing to say so. Remove maxLength and check the length after cleaning the value.",
    digitPattern:
      'this {{what}} field has a digits-only pattern and the form\'s own check is on, so a value with a space or hyphen is refused when the form is sent. Remove the pattern, or add noValidate to the form and check the cleaned value yourself.',
    caretJumps:
      "this onChange rewrites the value of a controlled field, and nothing in this file puts the caret back, so after an edit in the middle the caret can jump to the end. Clean the value when it is checked instead, or restore the caret with setSelectionRange.",
    blankPlaceholder:
      'the placeholder "{{placeholder}}" shows one country\'s phone format only, and people write numbers in many ways. Remove it, or show an example in the hint text and accept any format.',
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const keys = sourceCode.visitorKeys;
    const labels = labelIndex();
    /** @type {any[]} */
    const inputs = [];
    let restoresCaret = false;

    /** What the field holds, or undefined when it is not such a value. @param {any} element */
    function valueOf(element) {
      const opening = element.openingElement;
      const auto = autocompleteField(opening);
      if (auto === "one-time-code") return undefined;
      if (typeof auto === "string" && AUTOCOMPLETE.has(auto)) return auto === "cc-number" ? "card number" : "phone number";
      if (propValue(opening, "type") === "tel") return "phone number";
      if (typeof auto === "string" && auto !== "on" && auto !== "off") return undefined;
      const label = fieldLabel(element, labels);
      const words = [label ?? "", ...otherNames(element)].find((n) => VALUE_WORDS.test(n));
      if (words === undefined) return undefined;
      return PHONE_WORDS.test(words) ? "phone number" : "number";
    }

    return {
      Program(node) {
        for (const [key, value] of schemaEntries(node, keys)) {
          const words = identifierWords(key);
          if (!VALUE_WORDS.test(words)) continue;
          const { calls, root } = callChain(value);
          if (root?.type !== "Identifier" || root.name !== "z" || calls[0]?.name !== "string") continue;
          if (calls.some((c) => /^(transform|pipe|preprocess)$/.test(c.name))) continue;
          const regexes = schemaRegexes(value, keys);
          const length = calls.find((c) => c.name === "length");
          const strict = regexes.find((r) => !allowsSeparators(r.source));
          const at = strict?.node ?? length?.call;
          if (!at) continue;
          context.report({
            node: at,
            messageId: "rawCheck",
            data: { what: PHONE_WORDS.test(words) ? "phone number" : "number" },
          });
        }
      },
      Identifier(node) {
        if (/^(selectionStart|selectionEnd|setSelectionRange)$/.test(node.name)) restoresCaret = true;
      },
      JSXElement(element) {
        labels.see(element);
        if (isInput(element.openingElement)) inputs.push(element);
      },
      "Program:exit"() {
        for (const element of inputs) {
          const opening = element.openingElement;
          const what = valueOf(element);
          if (!what) continue;

          for (const name of KEY_PROPS) {
            const a = getAttribute(opening, name);
            if (a?.value?.type !== "JSXExpressionContainer") continue;
            const fn = resolveFunction(a.value.expression, context, opening);
            if (fn && refusesNonDigits(fn, keys, sourceCode)) context.report({ node: a, messageId: "keysRefused" });
          }

          const max = getAttribute(opening, "maxLength");
          if (max) context.report({ node: max, messageId: "maxLength", data: { what } });

          const pattern = propValue(opening, "pattern");
          if (typeof pattern === "string" && patternKind(pattern, { anchored: false }) === "digits") {
            const form = findAncestorElement(element, (n) => n === "form");
            if (form && !getAttribute(form.openingElement, "noValidate"))
              context.report({ node: getAttribute(opening, "pattern"), messageId: "digitPattern", data: { what } });
          }

          const change = getAttribute(opening, "onChange");
          if (!restoresCaret && getAttribute(opening, "value") && change?.value?.type === "JSXExpressionContainer") {
            const fn = resolveFunction(change.value.expression, context, opening);
            if (fn && rewritesValue(fn, keys)) context.report({ node: change, messageId: "caretJumps" });
          }

          const placeholder = attributeValue(getAttribute(opening, "placeholder"));
          if (what === "phone number" && typeof placeholder === "string" && BLANKS.test(placeholder))
            context.report({ node: getAttribute(opening, "placeholder"), messageId: "blankPlaceholder", data: { placeholder } });
        }
      },
    };
  },
});
