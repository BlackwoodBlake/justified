/**
 * form-entry-helpers.js: reading forms, fields and their handlers, for
 * justified/enter-sends-form (FRM-015), justified/fields-take-paste
 * (FRM-017) and justified/limit-reached-in-words (FRM-017c).
 *
 * Like `jsx.js`, each helper answers only what it can see for certain and
 * returns `undefined` when it cannot tell, so the rule stays quiet.
 */
import { attributeValue, elementName, getAttribute, staticValue, unwrap, walk } from "./jsx.js";
import { iconImports } from "./name-helpers.js";

export const FUNCTIONS = new Set(["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"]);

/** The Justified adapter's modules. */
const JUSTIFIED = /^@blackwoodblake\/justified-shadcn\/([a-z-]+)$/;
/** shadcn's own components as the CLI copies them into a project, such as `@/components/ui/button`. */
const STOCK = /(^|\/)ui\/([a-z-]+)$/;

/**
 * Where each imported name comes from: "justified" or "stock" for a shadcn
 * component (with its module, such as "button"), "icon" for an icon, and
 * nothing for any other module.
 * @param {any} program
 * @returns {Map<string, { from: "justified" | "stock" | "icon", module?: string }>}
 */
export function componentSources(program) {
  /** @type {Map<string, { from: "justified" | "stock" | "icon", module?: string }>} */
  const map = new Map();
  for (const name of iconImports(program)) map.set(name, { from: "icon" });
  for (const node of program.body) {
    if (node.type !== "ImportDeclaration") continue;
    const source = String(node.source.value);
    const j = source.match(JUSTIFIED);
    const s = source.match(STOCK);
    if (!j && !s) continue;
    for (const spec of node.specifiers)
      map.set(spec.local.name, j ? { from: "justified", module: j[1] } : { from: "stock", module: s?.[2] });
  }
  return map;
}

/**
 * Resolves a handler to a function: an inline one, or one declared once in
 * this file under that name, as a function or a `const`.
 * @param {any} expression
 * @param {import("eslint").Rule.RuleContext} context
 * @param {any} node Where the handler is used, for the scope.
 */
export function resolveFunction(expression, context, node) {
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

/** The name a call is made by: `f` in `f()`, `g` in `a.b.g()`. @param {any} call */
export function calleeName(call) {
  const c = unwrap(call.callee);
  if (c?.type === "Identifier") return c.name;
  if (c?.type === "MemberExpression" && !c.computed && c.property.type === "Identifier") return c.property.name;
  return undefined;
}

/** Whether a node is the call `x.<name>()`. @param {any} node @param {string} name */
export function isMethodCall(node, name) {
  const n = unwrap(node);
  if (n?.type !== "CallExpression") return false;
  const c = unwrap(n.callee);
  return c?.type === "MemberExpression" && !c.computed && c.property.type === "Identifier" && c.property.name === name;
}

/**
 * Whether code below a node calls something whose name passes the test,
 * nested functions included.
 * @param {any} node
 * @param {Record<string, readonly string[]>} keys
 * @param {(name: string) => boolean} test
 */
export function callsName(node, keys, test) {
  let found = false;
  walk(node, keys, (n) => {
    if (found) return false;
    if (n.type === "CallExpression") {
      const name = calleeName(n);
      if (name && test(name)) found = true;
    }
    return undefined;
  });
  return found;
}

/**
 * Whether code below a node mentions a name, as a variable or a property.
 * @param {any} node
 * @param {Record<string, readonly string[]>} keys
 * @param {(name: string) => boolean} test
 */
export function mentionsName(node, keys, test) {
  let found = false;
  walk(node, keys, (n) => {
    if (found) return false;
    if (n.type === "Identifier" && test(n.name)) found = true;
    if (n.type === "JSXIdentifier" && test(n.name)) found = true;
    return undefined;
  });
  return found;
}

/**
 * Whether a paste handler cancels the paste for certain: it calls
 * `preventDefault()` as one of its own statements, or returns `false`, and
 * neither reads the clipboard (it then usually puts the value in itself)
 * nor hands the event to another function.
 * @param {any} fn
 * @param {Record<string, readonly string[]>} keys
 */
export function blocksPaste(fn, keys) {
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
  const event = fn.params[0]?.type === "Identifier" ? fn.params[0].name : undefined;
  let handsOn = false;
  if (event)
    walk(fn.body, keys, (n) => {
      if (n.type === "CallExpression" && n.arguments.some((/** @type {any} */ a) => a.type === "Identifier" && a.name === event))
        handsOn = true;
    });
  if (handsOn) return false;
  const body = unwrap(fn.body);
  if (body.type !== "BlockStatement")
    return isMethodCall(body, "preventDefault") || (body.type === "Literal" && body.value === false);
  return body.body.some(
    (/** @type {any} */ s) =>
      (s.type === "ExpressionStatement" && isMethodCall(s.expression, "preventDefault")) ||
      (s.type === "ReturnStatement" && unwrap(s.argument)?.type === "Literal" && unwrap(s.argument).value === false),
  );
}

/** Input types that take one line of text. */
const SINGLE_LINE_TYPES = new Set(["text", "email", "number", "search", "tel", "url", "password"]);

/**
 * Whether an `Input` or `input` takes one line of text: true, false, or
 * undefined when its type is computed in a way the code does not show.
 * @param {any} opening
 */
export function isSingleLine(opening) {
  const name = elementName(opening);
  if (name !== "Input" && name !== "input" && name !== "InputGroupInput") return false;
  const type = getAttribute(opening, "type");
  if (!type) return true;
  const value = attributeValue(type);
  if (typeof value === "string") return SINGLE_LINE_TYPES.has(value.toLowerCase());
  // type={shown ? "text" : "password"}
  const e = type.value?.type === "JSXExpressionContainer" ? unwrap(type.value.expression) : undefined;
  if (e?.type === "ConditionalExpression") {
    const a = staticValue(e.consequent);
    const b = staticValue(e.alternate);
    if (typeof a === "string" && typeof b === "string")
      return SINGLE_LINE_TYPES.has(a.toLowerCase()) && SINGLE_LINE_TYPES.has(b.toLowerCase());
  }
  return undefined;
}

/** The outermost function around a node, or the program. @param {any} node */
export function outerScope(node) {
  let found;
  let n = node.parent;
  while (n) {
    if (FUNCTIONS.has(n.type)) found = n;
    if (n.type === "Program") return found ?? n;
    n = n.parent;
  }
  return found;
}

/** Whether `child` lies inside `ancestor`. @param {any} child @param {any} ancestor */
export function isInside(child, ancestor) {
  for (let n = child; n; n = n.parent) if (n === ancestor) return true;
  return false;
}
