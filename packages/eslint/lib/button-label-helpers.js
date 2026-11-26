/**
 * button-label-helpers.js: reading a button's visible words and its
 * classes, for justified/no-generic-button-label (ACT-001a) and
 * justified/destructive-confirm-style (DLG-005).
 *
 * Like jsx.js, each helper answers only what the code states for certain,
 * and returns `undefined` when it cannot tell.
 */
import { attributeValue, elementName, staticValue, unwrap } from "./jsx.js";

/** Collapses white space and trims. @param {string} s */
const tidy = (s) => s.replace(/\s+/g, " ").trim();

/**
 * The visible text of an element, from its text children and string
 * literal children. Any other child makes the text unknown (`undefined`),
 * except, with `ignoreSelfClosing`, a self-closing element with no
 * children, such as an icon, which adds no words of its own here.
 * @param {any} element A JSXElement.
 * @param {{ ignoreSelfClosing?: boolean }} [options]
 * @returns {string | undefined}
 */
export function visibleText(element, { ignoreSelfClosing = false } = {}) {
  let text = "";
  for (const child of element.children) {
    if (child.type === "JSXText") text += child.value;
    else if (child.type === "JSXExpressionContainer") {
      if (child.expression.type === "JSXEmptyExpression") continue;
      const v = staticValue(child.expression);
      if (typeof v !== "string") return undefined;
      text += v;
    } else if (ignoreSelfClosing && child.type === "JSXElement" && child.openingElement.selfClosing) {
      text += " ";
    } else return undefined;
  }
  return tidy(text);
}

const CLASS_CALLS = new Set(["cn", "clsx", "classNames", "twMerge"]);

/**
 * Every class a `className` may hold, when the whole list is written out:
 * a string, a template with no expressions, or `cn()`, `clsx()` or
 * `twMerge()` of strings, `cond && "a"` and `cond ? "a" : "b"`. Anything
 * else, such as `buttonVariants(...)` or a variable, gives `undefined`.
 * @param {any} attribute A JSXAttribute, or undefined.
 * @returns {string[] | undefined}
 */
export function staticClasses(attribute) {
  if (!attribute) return [];
  const literal = attributeValue(attribute);
  if (typeof literal === "string") return literal.split(/\s+/).filter(Boolean);
  if (attribute.value?.type !== "JSXExpressionContainer") return undefined;
  const out = [];
  /** @param {any} node @returns {boolean} */
  const add = (node) => {
    const n = unwrap(node);
    const v = staticValue(n);
    if (typeof v === "string") {
      out.push(...v.split(/\s+/).filter(Boolean));
      return true;
    }
    if (!n) return false;
    if (n.type === "LogicalExpression" && n.operator === "&&") return add(n.right);
    if (n.type === "ConditionalExpression") return add(n.consequent) && add(n.alternate);
    if (n.type === "CallExpression" && n.callee.type === "Identifier" && CLASS_CALLS.has(n.callee.name))
      return n.arguments.every(add);
    return false;
  };
  return add(attribute.value.expression) ? out : undefined;
}

/**
 * The nearest ancestor element whose name passes the test, crossing
 * fragments but not function boundaries, so a button passed as a prop or
 * returned from another component is not tied to the wrong parent.
 * @param {any} node
 * @param {(name: string) => boolean} test
 */
export function ancestorInTree(node, test) {
  for (let n = node.parent; n; n = n.parent) {
    if (n.type === "JSXElement") {
      const name = elementName(n.openingElement);
      if (name && test(name)) return n;
    } else if (
      n.type === "JSXFragment" ||
      n.type === "JSXExpressionContainer" ||
      n.type === "JSXAttribute" ||
      n.type === "JSXOpeningElement"
    ) {
      continue;
    } else if (n.type === "LogicalExpression" || n.type === "ConditionalExpression") {
      continue;
    } else return undefined;
  }
  return undefined;
}
