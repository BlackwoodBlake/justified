/**
 * link-role-helpers.js: telling a click that only goes somewhere from one
 * that acts, for justified/clickable-has-role (ACT-009),
 * justified/navigate-with-link (ACT-009a) and justified/act-with-button
 * (ACT-009b).
 *
 * Like `jsx.js`, each helper answers only what the code shows for certain.
 * A handler the helpers cannot read, such as one passed in by props, is
 * treated as unknown, and the rules stay quiet.
 */
import { getAttribute, meaningfulChildren, staticValue, unwrap, walk } from "./jsx.js";

const FUNCTIONS = new Set(["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"]);

/** Radix and shadcn triggers that render a button of their own unless `asChild` is used. */
export const TRIGGERS = new Set([
  "DialogTrigger",
  "AlertDialogTrigger",
  "SheetTrigger",
  "DrawerTrigger",
  "DropdownMenuTrigger",
  "PopoverTrigger",
  "CollapsibleTrigger",
]);

/** Labels and addresses of a job that acts before it moves on: signing out, or sending typed input. */
export const ACT_THEN_MOVE = /sign[\s_-]?out|log[\s_-]?out|search|[?&](q|query|search)=/i;

/** `a.b` as written, for a non-computed member. @param {any} node */
export const propertyName = (node) =>
  node?.type === "MemberExpression" && !node.computed && node.property.type === "Identifier"
    ? node.property.name
    : undefined;

/** Whether a string stays on the same page: a query or a hash only. @param {unknown} value */
const sameViewString = (value) => typeof value === "string" && /^[?#]/.test(value);

/** The operands of a chain of `+`, left to right. @param {any} node @returns {any[]} */
const operands = (node) => {
  const n = unwrap(node);
  return n?.type === "BinaryExpression" && n.operator === "+" ? [...operands(n.left), ...operands(n.right)] : [n];
};

const readsPathname = (/** @type {any} */ node) => {
  const n = unwrap(node);
  return (n?.type === "Identifier" && /pathname/i.test(n.name)) || /pathname/i.test(propertyName(n) ?? "");
};

/**
 * Whether the element's only meaningful child is one element, and which.
 * @param {any} element A JSXElement.
 */
export function onlyChild(element) {
  const children = meaningfulChildren(element);
  return children.length === 1 && children[0].type === "JSXElement" ? children[0] : undefined;
}

/** Whether an attribute is present and not set to `false`. @param {any} opening @param {string} name */
export function isOn(opening, name) {
  const a = getAttribute(opening, name);
  if (!a) return false;
  if (a.value === null) return true;
  return staticValue(a.value.type === "JSXExpressionContainer" ? a.value.expression : a.value) !== false;
}

/**
 * Reading handlers in one file.
 * @param {import("eslint").Rule.RuleContext} context
 */
export function handlerReader(context) {
  const sourceCode = context.sourceCode;
  const keys = sourceCode.visitorKeys;

  /** The variable a name refers to where it is used. @param {any} identifier */
  const variableOf = (identifier) => {
    for (let scope = sourceCode.getScope(identifier); scope; scope = scope.upper) {
      const v = scope.set.get(identifier.name);
      if (v) return v;
    }
    return undefined;
  };

  /** The initial value of a local `const` bound to a plain name. @param {any} identifier */
  const constInit = (identifier) => {
    const def = variableOf(identifier)?.defs[0];
    if (def?.type !== "Variable" || def.parent?.kind !== "const" || def.node.id.type !== "Identifier") return undefined;
    return unwrap(def.node.init);
  };

  /** Whether a name is a global, not a local variable. @param {any} identifier @param {string} name */
  const isGlobal = (identifier, name) => {
    if (identifier?.type !== "Identifier" || identifier.name !== name) return false;
    const v = variableOf(identifier);
    return !v || v.defs.length === 0;
  };

  /** Whether a const was made by calling a hook of this name. @param {any} identifier @param {string} hook */
  const madeBy = (identifier, hook) => {
    const init = constInit(identifier);
    const callee = unwrap(init?.callee);
    return init?.type === "CallExpression" && (callee?.name === hook || propertyName(callee) === hook);
  };

  /** Whether a name holds React state, as in `const [query, setQuery] = useState("")`. @param {any} identifier */
  const isState = (identifier) => {
    const def = variableOf(identifier)?.defs[0];
    if (def?.type !== "Variable" || def.node.id.type !== "ArrayPattern") return false;
    const init = unwrap(def.node.init);
    const callee = unwrap(init?.callee);
    return (
      init?.type === "CallExpression" &&
      /^use(State|Reducer)$/.test(callee?.type === "Identifier" ? callee.name : (propertyName(callee) ?? ""))
    );
  };

  /** The function a handler expression stands for, in this file. @param {any} node */
  const functionOf = (node) => {
    const n = unwrap(node);
    if (!n) return undefined;
    if (FUNCTIONS.has(n.type)) return n;
    if (n.type !== "Identifier") return undefined;
    const def = variableOf(n)?.defs[0];
    if (!def) return undefined;
    if (def.type === "FunctionName") return def.node;
    if (def.type !== "Variable" || def.node.id.type !== "Identifier") return undefined;
    const init = unwrap(def.node.init);
    if (init && FUNCTIONS.has(init.type)) return init;
    const callee = unwrap(init?.callee);
    if (init?.type === "CallExpression" && (callee?.name === "useCallback" || propertyName(callee) === "useCallback")) {
      const fn = unwrap(init.arguments[0]);
      if (fn && FUNCTIONS.has(fn.type)) return fn;
    }
    return undefined;
  };

  /**
   * Whether a callee goes to another address: "always", "target" when that
   * depends on its first argument, or undefined.
   * @param {any} node
   * @returns {"always" | "target" | undefined}
   */
  const navigator = (node) => {
    const callee = unwrap(node);
    const method = propertyName(callee);
    const object = unwrap(callee?.object);
    if (method === "open" && isGlobal(object, "window")) return "always";
    if (method === "assign" || method === "replace") {
      const owner = unwrap(object?.object);
      if (
        isGlobal(object, "location") ||
        (propertyName(object) === "location" && (isGlobal(owner, "window") || isGlobal(owner, "document")))
      )
        return "target";
    }
    if (method === "push" || method === "replace") {
      const isRouter =
        (object?.type === "Identifier" &&
          (object.name === "router" || object.name === "Router" || madeBy(object, "useRouter"))) ||
        propertyName(object) === "router";
      if (isRouter) return "target";
    }
    // Only a `navigate` made by useNavigate() in this file; a parameter of that name is not traced.
    if (callee?.type === "Identifier" && madeBy(callee, "useNavigate")) return "target";
    return undefined;
  };

  /** Whether a location assignment's target is the page's address. @param {any} node An AssignmentExpression. */
  const locationAssignment = (node) => {
    if (node.operator !== "=") return false;
    const left = unwrap(node.left);
    const isWindowLocation = (/** @type {any} */ n) =>
      propertyName(n) === "location" &&
      (isGlobal(unwrap(n.object), "window") || isGlobal(unwrap(n.object), "document"));
    return (
      isWindowLocation(left) ||
      (propertyName(left) === "href" &&
        (isWindowLocation(unwrap(left.object)) || isGlobal(unwrap(left.object), "location")))
    );
  };

  /**
   * Whether a navigation target stays on the same page: only a query or a
   * hash, or the current pathname followed by one.
   * @param {any} node
   * @param {number} [depth]
   */
  const sameView = (node, depth = 0) => {
    const n = unwrap(node);
    if (!n) return false;
    const value = staticValue(n);
    if (value !== undefined) return sameViewString(value);
    if (n.type === "Identifier") {
      const init = depth < 3 ? constInit(n) : undefined;
      return init ? sameView(init, depth + 1) : false;
    }
    if (n.type === "TemplateLiteral") {
      const [first, second] = n.quasis.map((/** @type {any} */ q) => q.value.cooked ?? "");
      if (sameViewString(first)) return true;
      return first === "" && readsPathname(n.expressions[0]) && sameViewString(second);
    }
    if (n.type === "BinaryExpression" && n.operator === "+") {
      const [a, b] = operands(n);
      if (sameViewString(staticValue(a))) return true;
      return readsPathname(a) && sameViewString(staticValue(b));
    }
    if (n.type === "CallExpression") {
      const callee = unwrap(n.callee);
      return /query|search|param/i.test(callee?.type === "Identifier" ? callee.name : (propertyName(callee) ?? ""));
    }
    if (n.type === "ObjectExpression") {
      for (const p of n.properties) {
        if (p.type !== "Property" || p.computed) return false;
        const key = p.key.type === "Identifier" ? p.key.name : p.key.value;
        if (key === "to" && staticValue(p.value) !== ".") return false;
        if (key === "pathname" && !readsPathname(p.value)) return false;
        if (key === "href" || key === "url") return false;
      }
      return true;
    }
    return false;
  };

  /**
   * Whether a target is built from what the person typed or chose: React
   * state, an input's `.value`, or react-hook-form's `getValues`/`watch`.
   * Such a click sends typed input, as *Search* does.
   * @param {any} node
   */
  const readsInput = (node) => {
    if (!node) return false;
    let found = false;
    walk(node, keys, (n) => {
      if (found || FUNCTIONS.has(n.type)) return false;
      if (n.type === "Identifier" && isState(n)) found = true;
      if (propertyName(n) === "value") found = true;
      if (n.type === "CallExpression") {
        const callee = unwrap(n.callee);
        const name = callee?.type === "Identifier" ? callee.name : propertyName(callee);
        if (name === "getValues" || name === "watch") found = true;
      }
      return undefined;
    });
    return found;
  };

  /**
   * A single statement or expression that navigates, with its target.
   * @param {any} node
   * @returns {{ target: any } | undefined}
   */
  const navigationIn = (node) => {
    let n = unwrap(node);
    if (n?.type === "ExpressionStatement") n = unwrap(n.expression);
    if (n?.type === "ReturnStatement") n = unwrap(n.argument);
    if (n?.type === "AwaitExpression" || (n?.type === "UnaryExpression" && n.operator === "void"))
      n = unwrap(n.argument);
    if (!n) return undefined;
    if (n.type === "CallExpression") {
      const kind = navigator(n.callee);
      if (kind) return { target: n.arguments[0] };
    }
    if (n.type === "AssignmentExpression" && locationAssignment(n)) return { target: n.right };
    return undefined;
  };

  /** Whether a statement is `e.preventDefault()` on the handler's event. @param {any} node */
  const isPreventDefault = (node) => {
    const n = unwrap(node?.type === "ExpressionStatement" ? node.expression : node);
    return (
      n?.type === "CallExpression" && propertyName(unwrap(n.callee)) === "preventDefault" && n.arguments.length === 0
    );
  };

  /**
   * When a handler does nothing but go to another address, the targets it
   * goes to. Undefined when it does anything else, or cannot be read.
   * @param {any} expression The handler as written in the attribute.
   * @param {number} [depth]
   * @returns {any[] | undefined}
   */
  const onlyNavigates = (expression, depth = 0) => {
    const n = unwrap(expression);
    if (!n) return undefined;
    const fn = functionOf(n);
    if (!fn) return undefined;
    const body = fn.body;
    const statements = body.type === "BlockStatement" ? body.body : [body];
    if (statements.length === 0) return undefined;
    const targets = [];
    for (const s of statements) {
      if (isPreventDefault(s)) continue;
      const nav = navigationIn(s);
      if (nav) {
        targets.push(nav.target);
        continue;
      }
      // A local helper that itself only navigates: onClick={() => goTo("/x")} is not traced, but goTo() with no arguments is.
      const call = unwrap(s.type === "ExpressionStatement" ? s.expression : s);
      const callee = unwrap(call?.callee);
      if (
        depth < 1 &&
        call?.type === "CallExpression" &&
        call.arguments.length === 0 &&
        callee?.type === "Identifier"
      ) {
        const inner = onlyNavigates(callee, depth + 1);
        if (inner) {
          targets.push(...inner);
          continue;
        }
      }
      return undefined;
    }
    return targets.length ? targets : undefined;
  };

  return {
    functionOf,
    navigator,
    navigationIn,
    onlyNavigates,
    sameView,
    readsInput,
    isPreventDefault,
    keys,
    propertyName,
  };
}
