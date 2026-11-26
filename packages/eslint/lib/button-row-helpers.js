/**
 * button-row-helpers.js: reading a row of buttons, such as a dialog footer,
 * for `justified/confirm-button-last` (ACT-003a) and
 * `justified/one-emphasised-button` (ACT-002a).
 *
 * Like `jsx.js`, each helper answers only what the code shows for certain
 * and returns `undefined` when it cannot tell.
 */
import {
  attributeValue,
  elementName,
  getAttribute,
  hasSpread,
  meaningfulChildren,
  staticValue,
  unwrap,
} from "./jsx.js";

/** Calls that join class names, whose arguments are class lists. */
const CLASS_JOINERS = new Set(["cn", "clsx", "classNames", "twMerge", "twJoin"]);

/**
 * The class names an expression may give. `known` is false when part of it
 * cannot be read, such as a variable or a call to something other than
 * `cn()`. For `a ? "x" : "y"` and `a && "x"` every class that may apply is
 * listed.
 * @param {any} node
 * @returns {{ classes: string[], known: boolean }}
 */
export function classesOf(node) {
  const n = unwrap(node);
  const out = { classes: /** @type {string[]} */ ([]), known: true };
  const add = (/** @type {{ classes: string[], known: boolean }} */ r) => {
    out.classes.push(...r.classes);
    if (!r.known) out.known = false;
  };
  if (!n) return out;
  const value = staticValue(n);
  if (typeof value === "string") {
    out.classes.push(...value.split(/\s+/).filter(Boolean));
    return out;
  }
  if (n.type === "Literal" && (n.value === null || typeof n.value === "boolean")) return out;
  if (n.type === "Identifier" && n.name === "undefined") return out;
  if (n.type === "LogicalExpression") {
    // `a && "x"`: the left side is a condition, not a class list.
    if (n.operator === "&&") add(classesOf(n.right));
    else {
      add(classesOf(n.left));
      add(classesOf(n.right));
    }
    return out;
  }
  if (n.type === "ConditionalExpression") {
    add(classesOf(n.consequent));
    add(classesOf(n.alternate));
    return out;
  }
  if (n.type === "CallExpression" && n.callee.type === "Identifier" && CLASS_JOINERS.has(n.callee.name)) {
    for (const arg of n.arguments) add(classesOf(arg));
    return out;
  }
  out.known = false;
  return out;
}

/**
 * The classes of an element's `className`. No `className` gives an empty,
 * known list.
 * @param {any} opening A JSXOpeningElement.
 */
export function classNameOf(opening) {
  const attribute = getAttribute(opening, "className");
  if (!attribute) return { classes: [], known: true };
  if (attribute.value?.type === "Literal") return classesOf(attribute.value);
  if (attribute.value?.type === "JSXExpressionContainer") return classesOf(attribute.value.expression);
  return { classes: [], known: false };
}

/**
 * Splits a Tailwind class into its variant prefix and utility:
 * "sm:flex-row" gives `{ prefix: "sm", utility: "flex-row" }`. A leading or
 * trailing `!` is dropped.
 * @param {string} cls
 */
export function splitClass(cls) {
  const i = cls.lastIndexOf(":");
  const prefix = i < 0 ? "" : cls.slice(0, i);
  const utility = (i < 0 ? cls : cls.slice(i + 1)).replace(/^!|!$/g, "");
  return { prefix, utility };
}

/**
 * The visible text of an element, from its text children and those of the
 * elements inside it, trimmed and with spaces collapsed. `undefined` when
 * a child is an expression other than a string.
 * @param {any} element A JSXElement or JSXFragment.
 * @returns {string | undefined}
 */
export function visibleText(element) {
  let text = "";
  for (const child of element.children) {
    if (child.type === "JSXText") text += child.value;
    else if (child.type === "JSXExpressionContainer") {
      if (child.expression.type === "JSXEmptyExpression") continue;
      const value = staticValue(child.expression);
      if (typeof value !== "string" && typeof value !== "number") return undefined;
      text += String(value);
    } else if (child.type === "JSXElement" || child.type === "JSXFragment") {
      const inner = visibleText(child);
      if (inner === undefined) return undefined;
      text += ` ${inner} `;
    } else return undefined;
  }
  return text.replace(/\s+/g, " ").trim();
}

/**
 * The items of a row: the direct children of `element`, with fragments
 * opened. Each item is a JSXElement, or a JSXExpressionContainer for a
 * child written as an expression.
 * @param {any} element
 * @returns {any[]}
 */
export function rowItems(element) {
  return meaningfulChildren(element).flatMap((c) => (c.type === "JSXFragment" ? rowItems(c) : [c]));
}

const CLOSERS = new Set(["DialogClose", "SheetClose", "DrawerClose"]);

/**
 * The button an item draws, looking through `<DialogClose asChild>` and the
 * like, which pass their behaviour to the one element inside them.
 * @param {any} item A JSXElement.
 * @returns {{ element: any, name: string, closer: boolean } | undefined}
 */
export function buttonOf(item) {
  if (item.type !== "JSXElement") return undefined;
  const name = elementName(item.openingElement) ?? "";
  if (CLOSERS.has(name) && getAttribute(item.openingElement, "asChild")) {
    const inner = rowItems(item);
    if (inner.length !== 1) return undefined;
    const button = buttonOf(inner[0]);
    return button && { ...button, closer: true };
  }
  if (["Button", "button", "AlertDialogAction", "AlertDialogCancel"].includes(name) || CLOSERS.has(name)) {
    return { element: item, name, closer: CLOSERS.has(name) };
  }
  return undefined;
}

/**
 * The variant a `Button` or `AlertDialogAction` is given for certain: the
 * literal of `variant`, or of `variant` in a `buttonVariants({ ... })`
 * className. `null` when none is given; `undefined` when it cannot be told,
 * such as a variable or a spread that may set it.
 * @param {any} opening
 * @returns {string[] | null | undefined} Every variant it may have.
 */
export function variantsOf(opening) {
  const attribute = getAttribute(opening, "variant");
  if (attribute) {
    const value = attributeValue(attribute);
    if (typeof value === "string") return [value];
    const expr = unwrap(attribute.value?.expression);
    if (expr?.type === "ConditionalExpression") {
      const a = staticValue(expr.consequent);
      const b = staticValue(expr.alternate);
      if (typeof a === "string" && typeof b === "string") return [a, b];
    }
    return undefined;
  }
  if (hasSpread(opening)) return undefined;
  const className = getAttribute(opening, "className");
  const call = unwrap(className?.value?.expression);
  if (call?.type === "CallExpression" && call.callee.type === "Identifier" && call.callee.name === "buttonVariants") {
    const options = unwrap(call.arguments[0]);
    if (!options) return null;
    if (options.type !== "ObjectExpression") return undefined;
    const property = options.properties.find(
      (p) => p.type === "Property" && !p.computed && (p.key.name ?? p.key.value) === "variant",
    );
    if (!property) return options.properties.some((p) => p.type === "SpreadElement") ? undefined : null;
    const value = staticValue(property.value);
    return typeof value === "string" ? [value] : undefined;
  }
  return null;
}
