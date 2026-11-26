/**
 * jsx.js: small helpers for reading JSX and the code around it.
 *
 * They work on the ESTree shapes every JSX parser gives, and they unwrap
 * TypeScript-only wrappers (`as`, `satisfies`, `!`) when a TypeScript
 * parser is used. Each helper answers only what it can see for certain:
 * a value it cannot work out is `undefined`, and the rule should then stay
 * quiet.
 */

/** @typedef {import("estree").Node & { parent?: any }} AnyNode */

const TS_WRAPPERS = new Set(["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression", "TSTypeAssertion"]);

/** Strips TypeScript wrappers and parentheses-free casts. @param {any} node */
export function unwrap(node) {
  let n = node;
  while (n && (TS_WRAPPERS.has(n.type) || n.type === "ChainExpression")) n = n.expression;
  return n;
}

/**
 * The element's name as written: "Button", "button", "Dialog.Footer".
 * @param {any} opening A JSXOpeningElement.
 * @returns {string | undefined}
 */
export function elementName(opening) {
  const name = opening?.name;
  if (!name) return undefined;
  if (name.type === "JSXIdentifier") return name.name;
  if (name.type === "JSXNamespacedName") return `${name.namespace.name}:${name.name.name}`;
  const parts = [];
  let n = name;
  while (n.type === "JSXMemberExpression") {
    parts.unshift(n.property.name);
    n = n.object;
  }
  if (n.type === "JSXIdentifier") parts.unshift(n.name);
  return parts.join(".");
}

/** The last part of an element name: "Footer" for "Dialog.Footer". @param {any} opening */
export const baseName = (opening) => elementName(opening)?.split(".").pop();

/**
 * The attribute with this name, ignoring spreads.
 * @param {any} opening
 * @param {string} name
 */
export function getAttribute(opening, name) {
  return opening.attributes.find((a) => a.type === "JSXAttribute" && a.name.type === "JSXIdentifier" && a.name.name === name);
}

/** Whether the element spreads props, which may set anything. @param {any} opening */
export const hasSpread = (opening) => opening.attributes.some((a) => a.type === "JSXSpreadAttribute");

/**
 * A string, number or boolean the code states for certain, or `undefined`.
 * @param {any} node An expression.
 */
export function staticValue(node) {
  const n = unwrap(node);
  if (!n) return undefined;
  if (n.type === "Literal") return /** @type {string | number | boolean | null} */ (n.value);
  if (n.type === "TemplateLiteral" && n.expressions.length === 0) return n.quasis[0].value.cooked;
  return undefined;
}

/**
 * The value of an attribute for certain: `true` for a bare attribute, the
 * literal for `x="a"` or `x={"a"}`, and `undefined` for anything computed.
 * @param {any} attribute A JSXAttribute.
 */
export function attributeValue(attribute) {
  if (!attribute) return undefined;
  if (attribute.value === null) return true;
  if (attribute.value.type === "Literal") return attribute.value.value;
  if (attribute.value.type === "JSXExpressionContainer") return staticValue(attribute.value.expression);
  return undefined;
}

/** The nearest JSX element around a node, not counting the node itself. @param {any} node */
export function parentElement(node) {
  let n = node.parent;
  while (n && n.type !== "JSXElement") n = n.parent;
  return n;
}

/**
 * The nearest ancestor element whose name passes the test.
 * @param {any} node
 * @param {(name: string) => boolean} test
 */
export function findAncestorElement(node, test) {
  for (let el = parentElement(node); el; el = parentElement(el)) {
    const name = elementName(el.openingElement);
    if (name && test(name)) return el;
  }
  return undefined;
}

const FUNCTIONS = new Set(["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"]);

/**
 * Visits every node below `node`, using the parser's visitor keys.
 * Return `false` from `visit` to skip a node's children.
 * @param {any} node
 * @param {Record<string, readonly string[]>} keys `context.sourceCode.visitorKeys`.
 * @param {(node: any, parent: any) => boolean | void} visit
 */
export function walk(node, keys, visit) {
  const stack = [[node, null]];
  while (stack.length) {
    const [n, parent] = /** @type {[any, any]} */ (stack.pop());
    if (visit(n, parent) === false) continue;
    for (const key of keys[n.type] ?? []) {
      const child = n[key];
      if (Array.isArray(child)) {
        for (let i = child.length - 1; i >= 0; i--) if (child[i] && typeof child[i].type === "string") stack.push([child[i], n]);
      } else if (child && typeof child.type === "string") stack.push([child, n]);
    }
  }
}

/**
 * Whether an expression reads a name, as `x` or `a.b.x`, outside nested functions.
 * @param {any} expression
 * @param {Record<string, readonly string[]>} keys
 * @param {(name: string) => boolean} test
 */
export function readsName(expression, keys, test) {
  let found = false;
  walk(expression, keys, (n, parent) => {
    if (found || FUNCTIONS.has(n.type)) return false;
    if (n.type === "Identifier") {
      // An object key or a property after a dot is not a variable read; the member check below covers properties.
      const isKey = parent && parent.type === "Property" && parent.key === n && !parent.computed;
      const isProperty = parent && parent.type === "MemberExpression" && parent.property === n && !parent.computed;
      if (!isKey && !isProperty && test(n.name)) found = true;
    }
    if (n.type === "MemberExpression" && !n.computed && n.property.type === "Identifier" && test(n.property.name)) found = true;
    return undefined;
  });
  return found;
}

/**
 * The local names a module's export is imported under in this file.
 * Call from `ImportDeclaration`.
 * @param {any} node An ImportDeclaration.
 * @param {string | RegExp} source
 * @param {string} imported
 * @returns {{ named: string[], namespaces: string[] }}
 */
export function importedNames(node, source, imported) {
  const value = String(node.source.value);
  const matches = typeof source === "string" ? value === source : source.test(value);
  if (!matches) return { named: [], namespaces: [] };
  const named = [];
  const namespaces = [];
  for (const s of node.specifiers) {
    if (s.type === "ImportSpecifier") {
      const name = s.imported.type === "Identifier" ? s.imported.name : s.imported.value;
      if (name === imported) named.push(s.local.name);
    } else if (s.type === "ImportNamespaceSpecifier") namespaces.push(s.local.name);
  }
  return { named, namespaces };
}
