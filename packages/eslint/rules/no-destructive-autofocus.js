/**
 * justified/no-destructive-autofocus, for DLG-004 (a guideline): in a dialog
 * that confirms a destructive action, first focus goes to Cancel, never to
 * the destructive button, and Enter never runs the action unless the person
 * has moved focus to that button.
 *
 * A destructive button is a `Button` or `AlertDialogAction` with
 * `variant="destructive"`, or whose text starts with Delete, Remove, Erase,
 * Revoke, Discard or Destroy, inside an `AlertDialogContent` or a
 * `DialogContent`. Flags:
 *   - `autoFocus` or `data-autofocus` on such a button: bare, `true`, a
 *     string, or a condition with a branch that sets it (for `autoFocus`
 *     also a comparison, such as `autoFocus={mode === "delete"}`).
 *   - an inline `onOpenAutoFocus` on the content that calls
 *     `x.current.focus()`, where `x` is the `ref` of such a button in it.
 *   - in an `AlertDialogContent`, a `<form>` whose submit button
 *     (`type="submit"`) is such a button, so Enter in a field runs it.
 *
 * A condition that reads the props of the component it sits in, such as
 * `data-autofocus={focusOn === "delete" ? "" : undefined}`, is worked out
 * for each place that component is rendered, when the component is not
 * exported, every use of it is JSX in this file and the props there are
 * literals. The report then goes on the uses that focus the destructive
 * button. Otherwise the attribute itself is reported.
 *
 * Left alone: `autoFocus` on Cancel or another button (the Do advice);
 * destructive buttons outside a dialog; a submit button with no `type`,
 * since whether it submits depends on which `Button` is in use; and what
 * shows only when the page runs: `keydown` listeners, a `Dialog` used
 * instead of `AlertDialog`, and where focus lands by default.
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

const BUTTONS = new Set(["Button", "AlertDialogAction"]);
const CONTENTS = new Set(["AlertDialogContent", "DialogContent"]);
const DESTRUCTIVE_WORD = /^(delete|remove|erase|revoke|discard|destroy)\b/i;
const FUNCTIONS = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);
const UNKNOWN = Symbol("unknown");

/** Whether a static value sets the attribute. @param {unknown} v */
const sets = (v) => v !== undefined && v !== null && v !== false && v !== UNKNOWN;

/** A value for certain, `undefined` included; `UNKNOWN` when computed. @param {any} node */
function literal(node) {
  const n = unwrap(node);
  if (n?.type === "Identifier" && n.name === "undefined") return undefined;
  const v = staticValue(n);
  return v === undefined ? UNKNOWN : v;
}

/**
 * How an autofocus attribute's value sets it: "always", "maybe" (behind a
 * condition, with a branch that sets it) or "never" (as far as the code shows).
 * @param {any} attribute
 */
function focusKind(attribute) {
  if (attribute.value === null) return "always";
  if (attribute.value.type === "Literal") return "always";
  if (attribute.value.type !== "JSXExpressionContainer") return "never";
  const e = unwrap(attribute.value.expression);
  if (sets(literal(e))) return "always";
  if (e.type === "ConditionalExpression")
    return sets(literal(e.consequent)) || sets(literal(e.alternate)) ? "maybe" : "never";
  if (e.type === "LogicalExpression" && e.operator === "&&") return sets(literal(e.right)) ? "maybe" : "never";
  // A comparison gives autoFocus true or false. (A data attribute would render "false" too, so it is left out.)
  if (attribute.name.name === "autoFocus" && isComparison(e)) return "maybe";
  return "never";
}

/** A condition that gives true or false. @param {any} e */
const isComparison = (e) =>
  (e.type === "BinaryExpression" && ["===", "!==", "==", "!="].includes(e.operator)) ||
  (e.type === "UnaryExpression" && e.operator === "!");

/** Whether a Button or AlertDialogAction is destructive, from its variant or its text. @param {any} element */
function isDestructive(element) {
  if (attributeValue(getAttribute(element.openingElement, "variant")) === "destructive") return true;
  const first = element.children.find((c) => !(c.type === "JSXText" && c.value.trim() === ""));
  if (first?.type === "JSXText") return DESTRUCTIVE_WORD.test(first.value.trim());
  if (first?.type === "JSXExpressionContainer") {
    const v = staticValue(first.expression);
    return typeof v === "string" && DESTRUCTIVE_WORD.test(v.trim());
  }
  return false;
}

/**
 * Evaluates a condition with the given props. Returns `UNKNOWN` when the
 * code reads anything else.
 * @param {any} node
 * @param {(name: string) => unknown} prop A prop's value, or UNKNOWN when the name is not a prop.
 * @returns {unknown}
 */
function evaluate(node, prop) {
  const n = unwrap(node);
  if (!n) return UNKNOWN;
  if (n.type === "Identifier") return n.name === "undefined" ? undefined : prop(n.name);
  if (
    n.type === "MemberExpression" &&
    !n.computed &&
    n.object.type === "Identifier" &&
    n.property.type === "Identifier"
  )
    return prop(`${n.object.name}.${n.property.name}`);
  if (n.type === "Literal" || n.type === "TemplateLiteral") return literal(n);
  if (n.type === "UnaryExpression" && n.operator === "!") {
    const v = evaluate(n.argument, prop);
    return v === UNKNOWN ? UNKNOWN : !v;
  }
  if (n.type === "BinaryExpression" && ["===", "!==", "==", "!="].includes(n.operator)) {
    const a = evaluate(n.left, prop);
    const b = evaluate(n.right, prop);
    if (a === UNKNOWN || b === UNKNOWN) return UNKNOWN;
    const equal = n.operator.length === 3 ? a === b : a == b;
    return n.operator.startsWith("!") ? !equal : equal;
  }
  if (n.type === "LogicalExpression") {
    const a = evaluate(n.left, prop);
    if (a === UNKNOWN) return UNKNOWN;
    if (n.operator === "&&") return a ? evaluate(n.right, prop) : a;
    if (n.operator === "||") return a ? a : evaluate(n.right, prop);
    if (n.operator === "??") return a ?? evaluate(n.right, prop);
  }
  return UNKNOWN;
}

/** The value a condition's chosen branch gives the attribute. @param {any} e @param {unknown} test */
function branch(e, test) {
  if (e.type === "ConditionalExpression") return literal(test ? e.consequent : e.alternate);
  if (e.type === "LogicalExpression") return test ? literal(e.right) : test; // `cond && value`
  return test; // a comparison
}

/** The condition that decides the value. @param {any} e */
const testOf = (e) => (e.type === "ConditionalExpression" ? e.test : e.type === "LogicalExpression" ? e.left : e);

/**
 * The props a component's first parameter names: `{ a, b = "x" }` gives a
 * and b with their defaults, `props` gives `props.a` and so on.
 * @param {any} fn
 * @returns {{ names: Map<string, { key: string, fallback: unknown }>, byMember: string | null } | null}
 */
function paramsOf(fn) {
  const param = fn.params[0];
  if (!param) return null;
  if (param.type === "Identifier") return { names: new Map(), byMember: param.name };
  if (param.type !== "ObjectPattern") return null;
  const names = new Map();
  for (const p of param.properties) {
    if (p.type !== "Property" || p.computed || p.key.type !== "Identifier") continue;
    const value = p.value;
    if (value.type === "Identifier") names.set(value.name, { key: p.key.name, fallback: undefined });
    else if (value.type === "AssignmentPattern" && value.left.type === "Identifier")
      names.set(value.left.name, { key: p.key.name, fallback: literal(value.right) });
  }
  return { names, byMember: null };
}

/** A prop's value at a use of the component, from its literal attribute. @param {any} opening @param {string} key @param {unknown} fallback */
function propAt(opening, key, fallback) {
  const attribute = getAttribute(opening, key);
  if (!attribute) return fallback;
  if (attribute.value === null) return true;
  if (attribute.value.type === "Literal") return attribute.value.value;
  return literal(attribute.value.expression);
}

export default defineRule({
  id: "DLG-004",
  level: "guideline",
  verdict: "Split (1 of 2)",
  description: "First focus or a form submit on the destructive button of a confirmation dialog.",
  type: "suggestion",
  messages: {
    autofocus:
      "{{attribute}} puts first focus on the destructive button of this dialog, so a reflex press of Enter runs the action. Leave first focus on Cancel: remove {{attribute}} here, or put it on the Cancel button.",
    autofocusHere:
      "with these props, {{component}} puts first focus on the destructive button of its dialog ({{attribute}}), so a reflex press of Enter runs the action. Leave first focus on Cancel.",
    openAutoFocus:
      "onOpenAutoFocus moves first focus to the destructive button of this dialog, so a reflex press of Enter runs the action. Let focus start on Cancel instead.",
    formSubmit:
      'the destructive button is this form\'s submit button, so Enter in any field of the confirmation runs the action. Make it type="button" and run the action from its onClick, so only pressing the button itself does it.',
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;
    /** Conditional autofocus to work out at the end. @type {{ attribute: any, expression: any }[]} */
    const pending = [];
    /** Refs of destructive buttons, per content element. @type {Map<any, Set<string>>} */
    const refs = new Map();
    /** Content elements with an inline onOpenAutoFocus. @type {any[]} */
    const contents = [];
    /** Uses of each name as JSX, and names used other ways. */
    const jsxUses = new Map();
    const valueUses = new Set();
    const exported = new Set();

    /** Reports a conditional autofocus on the uses of its component, or on itself. @param {{ attribute: any, expression: any }} hit */
    const settle = (hit) => {
      const name = hit.attribute.name.name;
      const atAttribute = () =>
        context.report({ node: hit.attribute, messageId: "autofocus", data: { attribute: name } });
      let fn = hit.attribute.parent;
      while (fn && !FUNCTIONS.has(fn.type)) fn = fn.parent;
      // The component: a function declared by name, or a const holding a function.
      const component =
        fn?.type === "FunctionDeclaration"
          ? fn.id?.name
          : fn?.parent?.type === "VariableDeclarator" && fn.parent.id.type === "Identifier"
            ? fn.parent.id.name
            : undefined;
      const params = fn && paramsOf(fn);
      if (!component || !params || exported.has(component) || valueUses.has(component)) return atAttribute();
      const uses = jsxUses.get(component) ?? [];
      if (uses.length === 0) return atAttribute();
      const results = uses.map((/** @type {any} */ opening) => {
        if (opening.attributes.some((/** @type {any} */ a) => a.type === "JSXSpreadAttribute")) return UNKNOWN;
        const prop = (/** @type {string} */ id) => {
          if (params.byMember)
            return id.startsWith(`${params.byMember}.`)
              ? propAt(opening, id.slice(params.byMember.length + 1), undefined)
              : UNKNOWN;
          const p = params.names.get(id);
          return p ? propAt(opening, p.key, p.fallback) : UNKNOWN;
        };
        const test = evaluate(testOf(hit.expression), prop);
        return test === UNKNOWN ? UNKNOWN : branch(hit.expression, test);
      });
      if (results.includes(UNKNOWN)) return atAttribute();
      uses.forEach((/** @type {any} */ opening, /** @type {number} */ i) => {
        if (sets(results[i]))
          context.report({ node: opening, messageId: "autofocusHere", data: { component, attribute: name } });
      });
    };

    return {
      ExportNamedDeclaration(node) {
        const d = node.declaration;
        if (d?.type === "FunctionDeclaration" && d.id) exported.add(d.id.name);
        if (d?.type === "VariableDeclaration")
          for (const v of d.declarations) if (v.id.type === "Identifier") exported.add(v.id.name);
        for (const s of node.specifiers ?? []) if (s.local.type === "Identifier") exported.add(s.local.name);
      },
      ExportDefaultDeclaration(node) {
        const d = node.declaration;
        if (d.type === "Identifier") exported.add(d.name);
        if (d.type === "FunctionDeclaration" && d.id) exported.add(d.id.name);
      },
      Identifier(node) {
        const p = node.parent;
        if (!p) return;
        if ((p.type === "VariableDeclarator" || p.type === "FunctionDeclaration") && p.id === node) return;
        if (p.type === "MemberExpression" && p.property === node && !p.computed) return;
        if (p.type === "Property" && p.key === node && !p.computed && p.value !== node) return;
        if (p.type.startsWith("TS") || p.type.startsWith("Import")) return;
        valueUses.add(node.name);
      },
      JSXOpeningElement(node) {
        const name = elementName(node);
        if (!name) return;
        if (!jsxUses.has(name)) jsxUses.set(name, []);
        jsxUses.get(name).push(node);

        if (CONTENTS.has(name)) {
          const handler = getAttribute(node, "onOpenAutoFocus");
          const fn = handler?.value?.type === "JSXExpressionContainer" ? unwrap(handler.value.expression) : undefined;
          if (fn && FUNCTIONS.has(fn.type)) contents.push({ element: node.parent, handler, fn });
          return;
        }
        if (!BUTTONS.has(name)) return;
        const element = node.parent;
        const content = findAncestorElement(node, (n) => CONTENTS.has(n));
        if (!content || !isDestructive(element)) return;

        for (const attr of ["autoFocus", "data-autofocus"]) {
          const attribute = getAttribute(node, attr);
          if (!attribute) continue;
          const kind = focusKind(attribute);
          if (kind === "always") context.report({ node: attribute, messageId: "autofocus", data: { attribute: attr } });
          if (kind === "maybe") pending.push({ attribute, expression: unwrap(attribute.value.expression) });
        }

        const ref = getAttribute(node, "ref");
        const refName = ref?.value?.type === "JSXExpressionContainer" ? unwrap(ref.value.expression) : undefined;
        if (refName?.type === "Identifier") {
          if (!refs.has(content)) refs.set(content, new Set());
          refs.get(content).add(refName.name);
        }

        if (
          elementName(content.openingElement) === "AlertDialogContent" &&
          attributeValue(getAttribute(node, "type")) === "submit"
        ) {
          const form = findAncestorElement(node, (n) => n === "form" || CONTENTS.has(n));
          if (form && elementName(form.openingElement) === "form")
            context.report({ node: getAttribute(node, "type"), messageId: "formSubmit" });
        }
      },
      "Program:exit"() {
        for (const { element, handler, fn } of contents) {
          const names = refs.get(element);
          if (!names) continue;
          let hit = false;
          walk(fn.body, keys, (n) => {
            if (hit) return false;
            // x.current.focus() or x.current?.focus()
            if (n.type !== "CallExpression") return undefined;
            const callee = unwrap(n.callee);
            if (callee?.type !== "MemberExpression" || callee.computed || callee.property.name !== "focus")
              return undefined;
            const current = unwrap(callee.object);
            if (
              current?.type === "MemberExpression" &&
              !current.computed &&
              current.property.name === "current" &&
              current.object.type === "Identifier" &&
              names.has(current.object.name)
            )
              hit = true;
            return undefined;
          });
          if (hit) context.report({ node: handler, messageId: "openAutoFocus" });
        }
        pending.forEach(settle);
      },
    };
  },
});
