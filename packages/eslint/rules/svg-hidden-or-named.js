/**
 * justified/svg-hidden-or-named, for STR-005 (a rule): an icon that carries
 * information has a text alternative, and one that only decorates is
 * hidden from assistive technology.
 *
 * Flags an inline `svg` element that is neither hidden nor named: it has no
 * `aria-hidden` (other than "false"), no `role="presentation"` or
 * `role="none"`, no `aria-label` or `aria-labelledby`, and no `<title>`
 * child. Whether the picture decorates or informs is the author's call, so
 * the message offers both fixes.
 *
 * Left alone, because the code does not show for certain what reaches a
 * screen reader:
 *   - An `svg` that spreads props, such as an icon component's
 *     `<svg {...props}>`: the caller may hide or name it.
 *   - An `svg` with `aria-hidden` set from an expression.
 *   - An `svg` inside an element with `aria-hidden`, inside another `svg`,
 *     or hidden with the `hidden` class or `display: none`, and a sprite
 *     sheet that holds only `defs` or `symbol`.
 *   - An `svg` inside a link, a button, a menu item or another control:
 *     the exceptions send those icons to ACT-001b and TXT-003.
 *   - An `svg` kept in a `const` (also in an object or an array read with
 *     `.map()`) whose every use in the file sits in a control or a hidden
 *     element, or that the file never renders, or whose uses the rule
 *     cannot follow; and one drawn into a picture by `ImageResponse`
 *     (next/og).
 *   - Icon components from libraries. Whether a library hides its icons
 *     depends on the library and its version.
 *   - An `aria-hidden` icon that is the only sign of a status: whether
 *     anything else says it needs the page around it.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, getAttribute, hasSpread, staticValue, unwrap } from "../lib/jsx.js";

const HIDDEN_ROLES = new Set(["presentation", "none"]);
/** Roles of controls, whose icons follow ACT-001b and TXT-003. */
const CONTROL_ROLES = new Set([
  "button",
  "link",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "tab",
  "option",
  "switch",
  "checkbox",
  "radio",
]);
const SPRITE_CHILDREN = new Set(["defs", "symbol"]);

/** Whether an `aria-hidden` attribute hides for certain; `undefined` if it is computed. @param {any} attribute */
function hides(attribute) {
  if (!attribute) return false;
  const value = attributeValue(attribute);
  if (value === undefined) return undefined;
  return value !== false && value !== "false";
}

/** The static class string, or `undefined`. @param {any} opening */
function staticClass(opening) {
  const value = attributeValue(getAttribute(opening, "className") ?? getAttribute(opening, "class"));
  return typeof value === "string" ? value : undefined;
}

/** Whether a `style` object literal sets `display: "none"`. @param {any} opening */
function displayNone(opening) {
  const style = getAttribute(opening, "style");
  const expression = style?.value?.type === "JSXExpressionContainer" ? unwrap(style.value.expression) : undefined;
  if (expression?.type !== "ObjectExpression") return false;
  return expression.properties.some(
    (/** @type {any} */ p) =>
      p.type === "Property" &&
      !p.computed &&
      (p.key.name ?? p.key.value) === "display" &&
      staticValue(p.value) === "none",
  );
}

/** Whether an element is a control or is hidden, so the svg inside is not this rule's. @param {any} element */
function coversSvg(element) {
  const opening = element.openingElement;
  const name = elementName(opening) ?? "";
  const base = name.split(".").pop() ?? "";
  if (name === "a" || name === "button" || name === "summary" || name === "svg") return true;
  if (/(Button|Link|Trigger|Item|Toggle|Tab|Close|Action|Cancel)$/.test(base)) return true;
  const role = attributeValue(getAttribute(opening, "role"));
  if (typeof role === "string" && CONTROL_ROLES.has(role)) return true;
  if (getAttribute(opening, "onClick")) return true;
  const hidden = getAttribute(opening, "aria-hidden");
  // A computed aria-hidden on a parent may hide the svg; stay quiet.
  if (hidden && hides(hidden) !== false) return true;
  return false;
}

/** Whether the svg has a direct `<title>` child, or holds only sprite definitions. @param {any} element */
function childrenNameOrHide(element) {
  const elements = element.children.filter((/** @type {any} */ c) => c.type === "JSXElement");
  if (elements.some((/** @type {any} */ c) => elementName(c.openingElement) === "title")) return true;
  return (
    elements.length > 0 &&
    elements.every((/** @type {any} */ c) => SPRITE_CHILDREN.has(elementName(c.openingElement) ?? ""))
  );
}

export default defineRule({
  id: "STR-005",
  level: "rule",
  verdict: "Requirement",
  description: 'An inline svg that is neither hidden with aria-hidden nor named with role="img" and aria-label.',
  messages: {
    unnamed:
      'this svg is neither hidden nor named, so a screen reader may announce it as an unlabelled image. If it only decorates or repeats the words beside it, add aria-hidden="true". If it carries information, give it role="img" and an aria-label that says what it tells.',
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (elementName(node) !== "svg") return;
        if (hasSpread(node)) return;
        const hidden = hides(getAttribute(node, "aria-hidden"));
        if (hidden !== false) return;
        const role = attributeValue(getAttribute(node, "role"));
        if (typeof role === "string" && HIDDEN_ROLES.has(role)) return;
        if (getAttribute(node, "aria-label") || getAttribute(node, "aria-labelledby")) return;
        if (/(^|\s)(\S+:)*hidden(\s|$)/.test(staticClass(node) ?? "") || displayNone(node)) return;
        const element = node.parent;
        if (childrenNameOrHide(element)) return;
        if (hasCoveringAncestor(element) || notRenderedHere(element, context.sourceCode)) return;
        context.report({ node, messageId: "unnamed" });
      },
    };
  },
});

/** Whether any ancestor element covers the svg. @param {any} element */
function hasCoveringAncestor(element) {
  for (let n = element.parent; n; n = n.parent) if (n.type === "JSXElement" && coversSvg(n)) return true;
  return false;
}

/** Nodes JSX passes through on its way to where it is kept. */
const WRAPS = /^(JSXElement|JSXFragment|JSXExpressionContainer|ConditionalExpression|LogicalExpression)$/;
const FUNCTION_TYPES = /^(ArrowFunctionExpression|FunctionExpression|FunctionDeclaration)$/;

/**
 * Where JSX kept in a `const` is put: the variable, the object key it sits
 * under (`{ icon: <svg /> }`), and whether it sits in an array whose items
 * are read through `.map()`. Undefined when the code keeps it some other way.
 * @param {any} root The outermost JSX node.
 * @returns {{ declarator: any, key: string | null, inArray: boolean } | undefined}
 */
function storedAt(root) {
  let n = root.parent;
  /** @type {string | null} */
  let key = null;
  let inArray = false;
  if (n?.type === "Property" && !n.computed && n.value === root) {
    key = n.key.type === "Identifier" ? n.key.name : String(n.key.value);
    n = n.parent?.parent;
  }
  if (n?.type === "ArrayExpression") {
    inArray = true;
    n = n.parent;
  }
  if (n?.type !== "VariableDeclarator" || n.id.type !== "Identifier" || n.parent?.kind !== "const") return undefined;
  return { declarator: n, key, inArray };
}

/**
 * The places in the file where a stored svg is read, or undefined when one
 * of them cannot be followed.
 * @param {any} sourceCode @param {{ declarator: any, key: string | null, inArray: boolean }} at
 * @returns {any[] | undefined}
 */
function usesOf(sourceCode, at) {
  const variable = sourceCode.getDeclaredVariables(at.declarator)[0];
  if (!variable) return undefined;
  /** @type {any[]} */
  const uses = [];
  /** Reads `<x>.<key>`, or `<x>` itself with no key. @param {any} id @returns {boolean} */
  const keyOf = (id) => {
    if (!at.key) return uses.push(id) > 0;
    const m = id.parent;
    if (m?.type !== "MemberExpression" || m.object !== id) return false;
    if (m.computed || (m.property.type === "Identifier" && m.property.name === at.key)) uses.push(m);
    return true;
  };
  for (const ref of variable.references) {
    if (ref.isValueReference === false || !ref.isRead()) continue;
    const id = ref.identifier;
    if (!at.inArray) {
      if (!keyOf(id)) return undefined;
      continue;
    }
    // items.map((item) => ... item.icon ...)
    const m = id.parent;
    const call = m?.type === "MemberExpression" && m.object === id ? m.parent : undefined;
    const fn = call?.type === "CallExpression" && call.callee === m ? unwrap(call.arguments[0]) : undefined;
    if (!fn || !FUNCTION_TYPES.test(fn.type)) return undefined;
    const param = fn.params[0];
    if (!param) continue;
    if (param.type === "Identifier") {
      const item = sourceCode.getDeclaredVariables(fn).find((/** @type {any} */ v) => v.name === param.name);
      for (const r of item?.references ?? []) if (!keyOf(r.identifier)) return undefined;
    } else if (param.type === "ObjectPattern" && at.key) {
      const prop = param.properties.find(
        (/** @type {any} */ p) => p.type === "Property" && !p.computed && p.key.name === at.key,
      );
      if (!prop) continue;
      if (prop.value.type !== "Identifier") return undefined;
      const item = sourceCode.getDeclaredVariables(fn).find((/** @type {any} */ v) => v.name === prop.value.name);
      for (const r of item?.references ?? []) uses.push(r.identifier);
    } else return undefined;
  }
  return uses;
}

/**
 * Whether the svg is not rendered where it is written in a way this rule
 * can read: JSX kept in a `const` (also in an object or array) whose every
 * use in the file sits in a control or a hidden element, or that the file
 * never renders, and JSX drawn into a picture by `ImageResponse` (next/og),
 * which never reaches a screen reader. Kept JSX whose uses cannot be
 * followed is left alone.
 * @param {any} element @param {any} sourceCode
 */
function notRenderedHere(element, sourceCode) {
  for (let a = element.parent; a; a = a.parent) {
    if (a.type !== "NewExpression" && a.type !== "CallExpression") continue;
    const callee = unwrap(a.callee);
    if (callee?.type === "Identifier" && callee.name === "ImageResponse") return true;
  }
  let n = element;
  while (n.parent && WRAPS.test(n.parent.type)) n = n.parent;
  // Rendered where it is written.
  if (!/^(Property|VariableDeclarator|ArrayExpression|AssignmentExpression)$/.test(n.parent?.type ?? "")) return false;
  const at = storedAt(n);
  if (!at) return true;
  const uses = usesOf(sourceCode, at);
  if (!uses) return true;
  for (const use of uses) {
    let c = use.parent;
    while (c && c.type !== "JSXExpressionContainer" && !FUNCTION_TYPES.test(c.type) && c.type !== "Program")
      c = c.parent;
    // Read outside JSX, or given as a prop: where it ends up cannot be followed.
    if (c?.type !== "JSXExpressionContainer" || c.parent?.type === "JSXAttribute") return true;
    if (!hasCoveringAncestor(c)) return false;
  }
  return true;
}
