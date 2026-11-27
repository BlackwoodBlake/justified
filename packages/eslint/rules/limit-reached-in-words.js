/**
 * justified/limit-reached-in-words, for FRM-017c (a guideline): when a
 * free-text field limits its length, it says in words when the limit is
 * reached, and never cuts text in silence.
 *
 * Flags a text area that stops or cuts text with nothing in its component
 * that could say so:
 *   - `maxLength` on a `Textarea` (shadcn's or Justified's) or a `textarea`;
 *   - an `onChange` on one that keeps only `value.slice(0, n)` (or
 *     `substring`, `substr`).
 * Words at the limit need code that reads how long the text is. So the
 * rule stays quiet when the component around the field (the outermost
 * function, or the file) reads `.length` anywhere outside that cut, calls
 * or renders anything named like a count or a limit, or uses the limit's
 * value anywhere else, such as `max={MAX}` on a counter.
 *
 * Left alone: single-line `Input` fields, since lint cannot tell free
 * text from a code, and codes are FRM-017a; a `Textarea` from any other
 * module, which may count by itself; a count that only changes colour, and
 * whether the words that are there say the right thing, which need the
 * running page or the review skill. Whether the limit and a count show
 * before people get there is FRM-017b, which has no lint rule: the review
 * skill checks it.
 */
import { defineRule } from "../lib/define-rule.js";
import { componentSources, FUNCTIONS, isInside, outerScope, resolveFunction } from "../lib/form-entry-helpers.js";
import { elementName, getAttribute, staticValue, unwrap, walk } from "../lib/jsx.js";

const CUTS = new Set(["slice", "substring", "substr"]);
const COUNT_WORDS = /count|remaining|left|limit|length|chars|characters|words|max/i;

/** The `x.slice(0, n)` calls in a handler, with their limit argument. @param {any} fn @param {any} keys */
function cutsIn(fn, keys) {
  /** @type {{ call: any, limit: any }[]} */
  const found = [];
  walk(fn.body, keys, (n) => {
    if (n.type !== "CallExpression") return undefined;
    const c = unwrap(n.callee);
    if (c?.type !== "MemberExpression" || c.computed || !CUTS.has(c.property.name)) return undefined;
    if (staticValue(n.arguments[0]) !== 0 || !n.arguments[1]) return undefined;
    found.push({ call: n, limit: n.arguments[1] });
    return undefined;
  });
  return found;
}

/**
 * Whether the scope has code that could say the limit is reached.
 * @param {any} scope
 * @param {Record<string, readonly string[]>} keys
 * @param {any[]} skip Nodes whose own code does not count: the maxLength attribute and the cut.
 * @param {any} limit The limit's expression.
 * @param {any} sourceCode
 */
function mightSpeak(scope, keys, skip, limit, sourceCode) {
  const limitText = limit ? sourceCode.getText(unwrap(limit)) : undefined;
  let speaks = false;
  walk(scope, keys, (n) => {
    if (speaks || skip.includes(n)) return false;
    if (n.type === "MemberExpression" && !n.computed && n.property.type === "Identifier" && n.property.name === "length")
      speaks = true;
    if (n.type === "CallExpression") {
      const c = unwrap(n.callee);
      const name = c?.type === "Identifier" ? c.name : c?.type === "MemberExpression" && !c.computed ? c.property.name : "";
      if (name && COUNT_WORDS.test(name)) speaks = true;
    }
    if (n.type === "JSXOpeningElement" && COUNT_WORDS.test(elementName(n) ?? "")) speaks = true;
    if (n.type === "JSXAttribute" && n.name.type === "JSXIdentifier" && n.name.name !== "maxLength" && COUNT_WORDS.test(n.name.name))
      speaks = true;
    // The limit used anywhere else, as a value or a name.
    if (limitText && n !== limit && (n.type === "Identifier" || n.type === "Literal" || n.type === "MemberExpression")) {
      if (sourceCode.getText(n) === limitText && !isInsideAny(n, skip)) speaks = true;
    }
    return undefined;
  });
  return speaks;
}

/** @param {any} node @param {any[]} list */
const isInsideAny = (node, list) => list.some((l) => isInside(node, l));

export default defineRule({
  id: "FRM-017c",
  level: "guideline",
  verdict: "Insufficient evidence (1 of 3 judges spoke)",
  description: "A text area that stops or cuts text at a limit with nothing that says so.",
  messages: {
    silentStop:
      'this text area stops taking text at maxLength, and nothing here says when the limit is reached, so a long paste loses its end in silence. Show words at the limit, such as "Limit reached", or let the text run over and show how far over it is.',
    silentCut:
      'this onChange cuts the text to a length, and nothing here says so, so the end of what people typed or pasted is lost in silence. Say in words when the limit is reached, or let the text run over and show how far over it is.',
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;
    /** @type {Map<string, any>} */
    let sources = new Map();
    return {
      Program(node) {
        sources = componentSources(node);
      },
      JSXOpeningElement(node) {
        const name = elementName(node) ?? "";
        if (name !== "textarea" && !(name === "Textarea" && sources.get("Textarea")?.module === "textarea")) return;
        const scope = outerScope(node);
        if (!scope) return;

        const max = getAttribute(node, "maxLength");
        if (max?.value) {
          const expr = max.value.type === "JSXExpressionContainer" ? unwrap(max.value.expression) : max.value;
          const off = expr?.type === "Identifier" && expr.name === "undefined";
          if (!off && expr?.type !== "ConditionalExpression" && !mightSpeak(scope, keys, [max], expr, context.sourceCode))
            context.report({ node: max, messageId: "silentStop" });
        }

        const change = getAttribute(node, "onChange");
        if (change?.value?.type !== "JSXExpressionContainer") return;
        const fn = resolveFunction(change.value.expression, context, node);
        if (!fn || !FUNCTIONS.has(fn.type)) return;
        const cuts = cutsIn(fn, keys);
        if (cuts.length !== 1) return;
        const { call, limit } = cuts[0];
        // Only a cut of what was typed: the value read from the event.
        const target = context.sourceCode.getText(unwrap(call.callee).object);
        if (!/\b(target|currentTarget)\.value\b|^value$|^v$/.test(target) && !/\.value$/.test(target)) return;
        const skip = max ? [call, max] : [call];
        if (!mightSpeak(scope, keys, skip, limit, context.sourceCode)) context.report({ node: change, messageId: "silentCut" });
      },
    };
  },
});
