/**
 * justified/choice-does-not-navigate, for FRM-012b (a rule): a control that
 * holds a choice only records it. Going to another page or step, or sending
 * a form, takes a button or a link, even with a notice.
 *
 * Looks at the value-change handler of a `Select`, `RadioGroup`,
 * `Checkbox`, `Switch`, `ToggleGroup`, `DropdownMenuRadioGroup` or
 * `DropdownMenuCheckboxItem` (`onValueChange`, `onCheckedChange`), and at
 * `onChange` on a native `select` or a radio or checkbox `input`. The
 * handler is read when it is written inline, or is a function declared in
 * this file and passed by name (also through `useCallback`), and so are
 * the local functions it calls, two levels deep.
 *
 * Flags a handler that:
 *   - navigates: `window.open()`, `location.assign()`/`replace()`, setting
 *     `window.location` or `location.href`, `router.push()`/`replace()`,
 *     or a `navigate()` from `useNavigate()`;
 *   - sends a form: `handleSubmit(...)()`, `requestSubmit()`, or a form's
 *     `submit()`. Not on a `Switch`, which may save its own setting in
 *     place, and not inside a `form method="get"`, a filter form.
 *
 * Left alone:
 *   - A change of search params on the same view: a URL that starts with
 *     `?` or `#`, `pathname` followed by `?`, a TanStack `navigate` with
 *     only `search` or `to: "."`, and URLs built by a helper whose name
 *     speaks of query, search or params.
 *   - Work in callbacks the handler sets up for later, such as a toast's
 *     action, except `startTransition` and `setTimeout`.
 *   - Handlers from other files or props, and `router` or `navigate` that
 *     the rule cannot trace. `DropdownMenuItem`, `Command` and text fields
 *     (FRM-012a).
 *   - Running a command such as export from a choice, and a command item in
 *     a `ToggleGroup`: which handler is a command takes judgement.
 */
import { defineRule } from "../lib/define-rule.js";
import {
  attributeValue,
  elementName,
  findAncestorElement,
  getAttribute,
  staticValue,
  unwrap,
  walk,
} from "../lib/jsx.js";

const CHOICES = new Set([
  "Select",
  "RadioGroup",
  "Checkbox",
  "Switch",
  "ToggleGroup",
  "DropdownMenuRadioGroup",
  "DropdownMenuCheckboxItem",
]);
const HANDLERS = new Set(["onValueChange", "onCheckedChange"]);
const NATIVE_CHOICE_INPUTS = new Set(["radio", "checkbox"]);
const FUNCTIONS = new Set(["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"]);
/** Callbacks that run as part of the same change, so they are read too. */
const SAME_CHANGE = new Set(["startTransition", "setTimeout"]);
const SAME_VIEW_HELPER = /query|search|param/i;
const MAX_DEPTH = 2;

/** `a.b` as written, for a non-computed member. @param {any} node */
const propertyName = (node) =>
  node?.type === "MemberExpression" && !node.computed && node.property.type === "Identifier"
    ? node.property.name
    : undefined;

/** Whether a string goes to the same view: only a query or a hash. @param {unknown} value */
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

export default defineRule({
  id: "FRM-012b",
  level: "rule",
  verdict: "Majority (2 of 3)",
  description:
    "A select, radio group, checkbox, switch or toggle group whose value change goes to another page or sends the form.",
  messages: {
    navigates:
      "this {{control}} goes to another page when its value changes, so a person looking through the options, or moving through them with the arrow keys, sets it off. Let it only record the choice, and put the move on a button or a link next to it. Filtering or sorting the same view through search params is fine.",
    submits:
      "this {{control}} sends the form when its value changes, before the person has decided. Let it only record the choice, and send the form with its submit button. A switch that applies and saves its own setting in place is fine.",
  },
  create(context) {
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

    /** The initial value of a local `const`, or undefined. @param {any} identifier */
    const constInit = (identifier) => {
      const def = variableOf(identifier)?.defs[0];
      if (def?.type !== "Variable" || def.parent?.kind !== "const" || def.node.id.type !== "Identifier")
        return undefined;
      return unwrap(def.node.init);
    };

    /** Whether a name is a global, not a local variable. @param {any} identifier */
    const isGlobal = (identifier, /** @type {string} */ name) => {
      if (identifier?.type !== "Identifier" || identifier.name !== name) return false;
      const v = variableOf(identifier);
      return !v || v.defs.length === 0;
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
      // useCallback(fn, deps)
      const callee = unwrap(init?.callee);
      if (
        init?.type === "CallExpression" &&
        (callee?.name === "useCallback" || propertyName(callee) === "useCallback")
      ) {
        const fn = unwrap(init.arguments[0]);
        if (fn && FUNCTIONS.has(fn.type)) return fn;
      }
      return undefined;
    };

    /** Whether a const was made by calling a hook of this name. @param {any} identifier @param {string} hook */
    const madeBy = (identifier, hook) => {
      const init = constInit(identifier);
      const callee = unwrap(init?.callee);
      return init?.type === "CallExpression" && (callee?.name === hook || propertyName(callee) === hook);
    };

    /** Whether a navigation target stays on the same view. @param {any} node @param {number} [depth] */
    const sameView = (node, depth = 0) => {
      const n = unwrap(node);
      if (!n) return true;
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
        return SAME_VIEW_HELPER.test(callee?.type === "Identifier" ? callee.name : (propertyName(callee) ?? ""));
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
     * Whether a function, as written in a call, goes to another page:
     * "always", "target" when that depends on its first argument, or undefined.
     * @param {any} node The callee.
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
      if (callee?.type === "Identifier" && madeBy(callee, "useNavigate")) return "target";
      return undefined;
    };

    /** Whether a call navigates to another page. @param {any} call A CallExpression. */
    const navigates = (call) => {
      const kind = navigator(call.callee);
      return kind === "always" || (kind === "target" && !sameView(call.arguments[0]));
    };

    /** Whether an assignment sets the page's location. @param {any} node An AssignmentExpression. */
    const setsLocation = (node) => {
      const left = unwrap(node.left);
      const isWindowLocation = (/** @type {any} */ n) =>
        propertyName(n) === "location" &&
        (isGlobal(unwrap(n.object), "window") || isGlobal(unwrap(n.object), "document"));
      const target =
        isWindowLocation(left) ||
        (propertyName(left) === "href" &&
          (isWindowLocation(unwrap(left.object)) || isGlobal(unwrap(left.object), "location")));
      return target && !sameView(node.right);
    };

    /** Whether a call sends a form. @param {any} call A CallExpression. */
    const submits = (call) => {
      const callee = unwrap(call.callee);
      // handleSubmit(onValid)(event)
      if (callee?.type === "CallExpression") {
        const inner = unwrap(callee.callee);
        if (inner?.name === "handleSubmit" || propertyName(inner) === "handleSubmit") return true;
      }
      const method = propertyName(callee);
      if (method === "requestSubmit") return true;
      if (method === "submit" && call.arguments.length === 0) {
        const text = sourceCode.getText(callee.object);
        return /form/i.test(text) || /\.current$/.test(text);
      }
      return false;
    };

    /**
     * What a function does when it runs: "navigates", "submits" or nothing.
     * @param {any} fn
     * @param {number} depth
     * @param {Set<any>} seen
     * @returns {"navigates" | "submits" | undefined}
     */
    const effectOf = (fn, depth, seen) => {
      if (seen.has(fn)) return undefined;
      seen.add(fn);
      /** @type {"navigates" | "submits" | undefined} */
      let found;
      walk(fn.body, keys, (n, parent) => {
        if (found === "navigates") return false;
        if (FUNCTIONS.has(n.type)) {
          const call = parent?.type === "CallExpression" && parent.arguments.includes(n) ? parent : undefined;
          const callee = unwrap(call?.callee);
          const name = callee?.type === "Identifier" ? callee.name : propertyName(callee);
          return Boolean(name && SAME_CHANGE.has(name));
        }
        if (n.type === "AssignmentExpression" && setsLocation(n)) found = "navigates";
        if (n.type !== "CallExpression") return undefined;
        if (navigates(n)) found = "navigates";
        else if (!found && submits(n)) found = "submits";
        else if (depth < MAX_DEPTH) {
          const callee = unwrap(n.callee);
          const local = callee?.type === "Identifier" ? functionOf(callee) : undefined;
          const inner = local && effectOf(local, depth + 1, seen);
          if (inner === "navigates" || (inner && !found)) found = inner;
        }
        return undefined;
      });
      return found;
    };

    /** What a handler expression does. @param {any} expression */
    const handlerEffect = (expression) => {
      const n = unwrap(expression);
      if (!n) return undefined;
      // Passed straight through: onValueChange={router.push}, onCheckedChange={form.handleSubmit(save)}.
      if ((n.type === "MemberExpression" || n.type === "Identifier") && navigator(n)) return "navigates";
      if (n.type === "CallExpression") {
        const callee = unwrap(n.callee);
        if (callee?.name === "handleSubmit" || propertyName(callee) === "handleSubmit") return "submits";
      }
      const fn = functionOf(n);
      return fn ? effectOf(fn, 0, new Set()) : undefined;
    };

    return {
      JSXAttribute(attribute) {
        if (attribute.name.type !== "JSXIdentifier" || attribute.value?.type !== "JSXExpressionContainer") return;
        const opening = attribute.parent;
        const name = elementName(opening);
        if (!name) return;
        const handler = attribute.name.name;
        const shadcn = CHOICES.has(name) && HANDLERS.has(handler);
        const native =
          handler === "onChange" &&
          (name === "select" ||
            (name === "input" && NATIVE_CHOICE_INPUTS.has(String(attributeValue(getAttribute(opening, "type"))))));
        if (!shadcn && !native) return;

        const effect = handlerEffect(attribute.value.expression);
        if (!effect) return;
        const control = native
          ? name === "select"
            ? "select"
            : `${attributeValue(getAttribute(opening, "type"))} input`
          : name;
        if (effect === "submits") {
          if (name === "Switch") return;
          const form = findAncestorElement(opening, (n) => n === "form" || n === "Form");
          if (form && String(attributeValue(getAttribute(form.openingElement, "method"))).toLowerCase() === "get")
            return;
        }
        context.report({ node: attribute, messageId: effect, data: { control } });
      },
    };
  },
});
