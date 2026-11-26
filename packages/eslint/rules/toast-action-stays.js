/**
 * justified/toast-action-stays, for FBK-005 (a rule): a toast holds at most
 * one action besides its close control, and while it holds one it stays
 * until the person uses it or closes it.
 *
 * Flags, for `toast` imported from "sonner":
 *   - `toast(…)`, `toast.success|error|info|warning|message(…)` and
 *     `toast.custom(…)` whose options object has an action and either no
 *     `duration` or a `duration` that is a number. `Infinity` and
 *     `Number.POSITIVE_INFINITY` pass. For `toast.custom`, the action is a
 *     button in the toast besides its close control.
 *   - The same options with both `action` and a `cancel` whose `onClick`
 *     does more than close the toast (sonner closes it after the click).
 *   - `toast.custom(…)` whose JSX holds two or more buttons besides the
 *     close control.
 *
 * A close control is a button whose `aria-label` or text starts with
 * "Close" or "Dismiss", or whose `onClick` only calls `toast.dismiss`.
 *
 * Left alone: toasts without an action, `toast.loading` (sonner does not
 * close it on a timer), `toast.promise`, options passed as a variable or
 * with a spread, a `duration` or `onClick` held in a variable, buttons
 * made in a `.map()` or with `asChild` (often a link), links in the text,
 * and files that render `<Toaster duration={Infinity}>` or
 * `toastOptions={{ duration: Infinity }}`. A `Toaster` in another file
 * cannot be seen: set the option `toasterDurationInfinity` for that.
 * Whether a newer toast replaces one whose action still applies, and
 * whether the action can also be done from a lasting place, need the whole
 * flow, so the review skill covers them. So does a hand-built toast: a
 * component's name alone does not show for certain that it is a toast, nor
 * which of its buttons it shows at once.
 */
import { defineRule } from "../lib/define-rule.js";
import {
  attributeValue,
  baseName,
  elementName,
  getAttribute,
  importedNames,
  staticValue,
  unwrap,
  walk,
} from "../lib/jsx.js";

const TIMED = new Set(["success", "error", "info", "warning", "message"]);
const BUTTONS = new Set(["Button", "button"]);
const FUNCTIONS = new Set(["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"]);
const CLOSE_WORDS = /^\s*(close|dismiss)\b/i;

/** The property `name` of an object literal, ignoring spreads. @param {any} object @param {string} name */
const property = (object, name) =>
  object.properties.find(
    (p) =>
      p.type === "Property" &&
      !p.computed &&
      ((p.key.type === "Identifier" && p.key.name === name) || (p.key.type === "Literal" && p.key.value === name)),
  );

/** Whether an expression is `Infinity` or `Number.POSITIVE_INFINITY`. @param {any} node */
function isInfinity(node) {
  const n = unwrap(node);
  if (n?.type === "Identifier") return n.name === "Infinity";
  return (
    n?.type === "MemberExpression" &&
    !n.computed &&
    n.object.type === "Identifier" &&
    n.object.name === "Number" &&
    n.property.name === "POSITIVE_INFINITY"
  );
}

/** Whether a value is certainly a number other than Infinity. @param {any} node */
function isFiniteNumber(node) {
  const n = unwrap(node);
  if (n?.type === "Literal") return typeof n.value === "number";
  if (n?.type === "BinaryExpression") return isFiniteNumber(n.left) && isFiniteNumber(n.right);
  return false;
}

/** Whether a value is certainly no action: `undefined`, `null` or `false`. @param {any} node */
function isNothing(node) {
  const n = unwrap(node);
  return (
    (n?.type === "Identifier" && n.name === "undefined") ||
    (n?.type === "Literal" && (n.value === null || n.value === false))
  );
}

/**
 * How the options object sets `duration`: "stays", "closes" or "unknown".
 * @param {any} options An ObjectExpression, or nothing.
 */
function durationOf(options) {
  if (!options) return "closes";
  const p = property(options, "duration");
  if (!p) return options.properties.some((q) => q.type === "SpreadElement") ? "unknown" : "closes";
  if (isInfinity(p.value)) return "stays";
  return isFiniteNumber(p.value) ? "closes" : "unknown";
}

/**
 * Whether a call is `toast.dismiss(…)`, or a call that does nothing visible, such as `console.log(…)`.
 * @param {any} node
 * @param {(name: string) => boolean} isToast
 */
function isQuietCall(node, isToast) {
  const n = unwrap(node);
  if (n?.type !== "CallExpression") return false;
  const c = unwrap(n.callee);
  if (c.type !== "MemberExpression" || c.computed || c.object.type !== "Identifier") return false;
  return (isToast(c.object.name) && c.property.name === "dismiss") || c.object.name === "console";
}

/**
 * Whether a function only closes the toast: its body is empty or only calls `toast.dismiss` or `console`.
 * @param {any} fn
 * @param {(name: string) => boolean} isToast
 */
function onlyCloses(fn, isToast) {
  if (fn.body.type !== "BlockStatement") return isQuietCall(fn.body, isToast);
  return fn.body.body.every((s) => s.type === "ExpressionStatement" && isQuietCall(s.expression, isToast));
}

/** Whether an element's text, from literal children, starts with Close or Dismiss. @param {any} element */
function closeText(element) {
  const text = element.children
    .map((c) =>
      c.type === "JSXText" ? c.value : c.type === "JSXExpressionContainer" ? (staticValue(c.expression) ?? "") : "",
    )
    .join("");
  return CLOSE_WORDS.test(text);
}

/**
 * The buttons inside a node that are not close controls, or `undefined` if some are made in a `.map()`.
 * @param {any} root
 * @param {Record<string, readonly string[]>} keys
 * @param {(name: string) => boolean} isToast
 */
function actionButtons(root, keys, isToast) {
  let count = 0;
  let unknown = false;
  walk(root, keys, (n) => {
    if (
      n.type === "CallExpression" &&
      n.callee.type === "MemberExpression" &&
      !n.callee.computed &&
      n.callee.property.name === "map"
    ) {
      // Buttons made in a loop cannot be counted for certain.
      walk(n, keys, (m) => {
        if (m.type === "JSXElement" && BUTTONS.has(elementName(m.openingElement) ?? "")) unknown = true;
      });
      return false;
    }
    if (n.type !== "JSXElement") return undefined;
    const opening = n.openingElement;
    if (!BUTTONS.has(elementName(opening) ?? "")) return undefined;
    if (getAttribute(opening, "asChild")) return false;
    const label = attributeValue(getAttribute(opening, "aria-label"));
    if (typeof label === "string" && CLOSE_WORDS.test(label)) return false;
    if (closeText(n)) return false;
    const onClick = getAttribute(opening, "onClick");
    const handler = onClick?.value?.type === "JSXExpressionContainer" ? unwrap(onClick.value.expression) : undefined;
    if (handler && FUNCTIONS.has(handler.type) && onlyCloses(handler, isToast)) return false;
    count++;
    return false;
  });
  return unknown ? undefined : count;
}

export default defineRule({
  id: "FBK-005",
  level: "rule",
  verdict: "Unanimous (2 of 2)",
  description: "A sonner toast with an action that closes on a timer, or a toast with more than one action.",
  schema: [
    {
      type: "object",
      properties: { toasterDurationInfinity: { type: "boolean" } },
      additionalProperties: false,
    },
  ],
  messages: {
    closesWithAction:
      "this toast has an action but closes by itself after a few seconds, so someone who reads or moves slowly can lose the action before they reach it. Add duration: Infinity so it stays until it is used or closed, and offer the action somewhere that lasts too. If Toaster sets duration={Infinity} for every toast, turn on this rule's toasterDurationInfinity option.",
    cancelIsAction:
      "this toast's cancel does more than close it, so the toast holds two actions. Keep one action in the toast. If the person has to choose between steps, use an inline notice or a dialog instead.",
    tooManyButtons:
      "this toast holds {{count}} buttons besides its close control. Keep one action in the toast and offer the others somewhere that lasts. If the person has to choose between steps, use an inline notice or a dialog instead.",
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;
    let globalInfinity = context.options[0]?.toasterDurationInfinity ?? false;
    const toastNames = new Set();
    const namespaces = new Set();
    /** @type {any[]} */
    const calls = [];
    const isToast = (/** @type {string} */ name) => toastNames.has(name);

    /** The sonner method a call uses: "" for `toast(…)`, "success" for `toast.success(…)`, or undefined. @param {any} callee */
    function methodOf(callee) {
      const c = unwrap(callee);
      if (c.type === "Identifier") return toastNames.has(c.name) ? "" : undefined;
      if (c.type !== "MemberExpression" || c.computed || c.property.type !== "Identifier") return undefined;
      const o = unwrap(c.object);
      if (o.type === "Identifier" && toastNames.has(o.name)) return c.property.name;
      // sonner.toast(…) and sonner.toast.success(…) through a namespace import.
      if (o.type === "Identifier" && namespaces.has(o.name) && c.property.name === "toast") return "";
      if (
        o.type === "MemberExpression" &&
        !o.computed &&
        o.object.type === "Identifier" &&
        namespaces.has(o.object.name) &&
        o.property.name === "toast"
      )
        return c.property.name;
      return undefined;
    }

    /** @param {any} call @param {string} method */
    function checkCall(call, method) {
      const optionsNode = unwrap(call.arguments[1]);
      if (optionsNode && optionsNode.type !== "ObjectExpression") return;
      const options = optionsNode;
      const duration = durationOf(options);

      if (method === "custom") {
        const render = unwrap(call.arguments[0]);
        if (!render || !FUNCTIONS.has(render.type)) return;
        const count = actionButtons(render.body, keys, isToast);
        if (count === undefined || count === 0) return;
        if (count >= 2) context.report({ node: call, messageId: "tooManyButtons", data: { count: String(count) } });
        else if (duration === "closes" && !globalInfinity)
          context.report({ node: call, messageId: "closesWithAction" });
        return;
      }

      if (!options) return;
      const action = property(options, "action");
      if (!action || isNothing(action.value)) return;

      const cancel = property(options, "cancel");
      const cancelValue = unwrap(cancel?.value);
      if (cancelValue?.type === "ObjectExpression") {
        const onClick = unwrap(property(cancelValue, "onClick")?.value);
        if (onClick && FUNCTIONS.has(onClick.type) && !onlyCloses(onClick, isToast)) {
          context.report({ node: cancel, messageId: "cancelIsAction" });
        }
      }
      if (method !== "loading" && duration === "closes" && !globalInfinity) {
        context.report({ node: property(options, "duration") ?? action, messageId: "closesWithAction" });
      }
    }

    return {
      ImportDeclaration(node) {
        const { named, namespaces: ns } = importedNames(node, "sonner", "toast");
        for (const n of named) toastNames.add(n);
        for (const n of ns) namespaces.add(n);
      },
      JSXOpeningElement(node) {
        if (baseName(node) !== "Toaster") return;
        const duration = getAttribute(node, "duration");
        if (duration?.value?.type === "JSXExpressionContainer" && isInfinity(duration.value.expression))
          globalInfinity = true;
        const toastOptions = getAttribute(node, "toastOptions");
        const value =
          toastOptions?.value?.type === "JSXExpressionContainer" ? unwrap(toastOptions.value.expression) : undefined;
        if (value?.type === "ObjectExpression") {
          const d = property(value, "duration");
          if (d && isInfinity(d.value)) globalInfinity = true;
        }
      },
      CallExpression(node) {
        calls.push(node);
      },
      "Program:exit"() {
        // Imports and a Toaster can come after the calls in the file, so the calls are checked last.
        for (const call of calls) {
          const method = methodOf(call.callee);
          if (method === undefined) continue;
          if (method === "" || TIMED.has(method) || method === "loading" || method === "custom")
            checkCall(call, method);
        }
      },
    };
  },
});
