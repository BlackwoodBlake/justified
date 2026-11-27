/**
 * justified/enter-sends-form, for FRM-015 (a rule): in a form, Enter in a
 * single-line field sends the form, as its main button does.
 *
 * The browser gives this for free when the field and a submit button sit
 * in one `<form>`. Which `Button` is a submit button depends on where it
 * comes from. shadcn's own `Button`, as the CLI copies it into
 * `components/ui/button`, renders a `button` with no type, which inside a
 * form is a submit button. Justified's `Button`
 * (`@blackwoodblake/justified-shadcn/button`) renders `type="button"`
 * unless told otherwise, so its main button needs `type="submit"` written
 * out. A `Button` from any other module is not judged.
 *
 * Flags five things:
 *   - A button whose `onClick` calls `handleSubmit` (react-hook-form), in
 *     a component with a single-line field and no `<form>` at all, so Enter
 *     in the field does nothing.
 *   - A `<form>` with a single-line field and no submit button, whose main
 *     button is a plain button: one whose `onClick` calls `handleSubmit` or
 *     `requestSubmit`, or a Justified `Button` with no type in the default
 *     variant. With two or more single-line fields Enter does nothing. With
 *     exactly one, the browser still sends the form on Enter (implicit
 *     submission), so such a form is reported only when it has no
 *     `onSubmit` or `action` to catch the send.
 *   - An `onKeyDown` on a `<form>`, or on a single-line field inside one,
 *     that does nothing on Enter but `preventDefault()`.
 *   - A `button`, or a shadcn `Button`, with no type inside a `<form>` and
 *     before the button marked `type="submit"`, so Enter presses it, as a
 *     show-password eye or a clear icon.
 *   - A `type="submit"` button in a `DialogFooter` or `SheetFooter` that
 *     comes after the dialog's `<form>` and is not tied to it with `form`.
 *
 * Left alone, as the rule's Exceptions say or because the code does not
 * show it for certain: a field with no form and a button that sends through
 * a click handler of its own (a filter box or an inline edit looks the same);
 * `Textarea`; a handler that does more on Enter, calls `requestSubmit` or
 * `handleSubmit`, reads `isComposing` or checks a modifier key; fields in a
 * combobox, a command list or a popover, and inputs marked as a combobox
 * or list; anything in an `AlertDialog`, and forms with a destructive
 * button, except for the stray submit button, which the rule's Do names as
 * the worst case; forms with an `id`, which a button elsewhere may point
 * to; forms that hold a component or a value this file does not show,
 * since it may hold the submit button; a button whose type is computed or
 * set by a spread or a wrapper such as `DialogClose asChild` or
 * `DialogTrigger render={<Button />}`; a `Button` from shadcn's react-aria
 * or Base UI base (`aria/ui/button`, `base-nova/ui/button`), which react-aria
 * makes `type="button"` and Base UI may too; and two
 * buttons both marked `type="submit"`.
 */
import { defineRule } from "../lib/define-rule.js";
import {
  callsName,
  componentSources,
  FUNCTIONS,
  isMethodCall,
  isSingleLine,
  mentionsName,
  outerScope,
  resolveFunction,
} from "../lib/form-entry-helpers.js";
import {
  attributeValue,
  elementName,
  getAttribute,
  hasSpread,
  isPropValue,
  parentElement,
  staticValue,
  unwrap,
  walk,
} from "../lib/jsx.js";

const SENDS = (/** @type {string} */ name) => name === "handleSubmit" || name === "requestSubmit";
const FOOTERS = new Set(["DialogFooter", "SheetFooter"]);
/** Radix parts that put `type="button"` on the child they render with `asChild`. */
const TYPED_WRAPPERS = new Set([
  "DialogClose",
  "DialogTrigger",
  "SheetClose",
  "SheetTrigger",
  "AlertDialogCancel",
  "AlertDialogAction",
  "AlertDialogTrigger",
  "PopoverTrigger",
  "DropdownMenuTrigger",
  "CollapsibleTrigger",
]);
/** Elements whose expression children are text, not controls. */
const TEXT = new Set([
  "p", "span", "label", "legend", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "em", "small", "b", "i", "code", "a",
  "option", "button", "Button", "Label", "FormLabel", "FormDescription", "FormMessage", "FieldLabel",
  "FieldDescription", "FieldError", "FieldLegend", "FieldTitle", "CardTitle", "CardDescription", "DialogTitle",
  "DialogDescription", "SheetTitle", "SheetDescription", "SelectItem", "Badge",
]);
const MODIFIERS = /^(ctrlKey|metaKey|altKey|shiftKey|getModifierState)$/;

/** @typedef {"submit" | "implicit" | "none" | "unknown"} Kind */

/**
 * What a button does inside a form, or undefined if the element is no button.
 *   submit: marked as the submit button; implicit: a submit button by default;
 *   none: does not send; unknown: the code does not say.
 * @param {any} element
 * @param {Map<string, any>} sources
 * @returns {Kind | undefined}
 */
function buttonKind(element, sources) {
  const opening = element.openingElement;
  const name = elementName(opening);
  if (name === "input") {
    const type = attributeValue(getAttribute(opening, "type"));
    if (hasSpread(opening)) return typeof type === "string" && /^(submit|image)$/.test(type) ? "unknown" : undefined;
    return typeof type === "string" && /^(submit|image)$/.test(type) ? "submit" : undefined;
  }
  if (name !== "button" && name !== "Button") return undefined;
  const source = name === "Button" ? sources.get("Button")?.from : "html";
  if (name === "Button" && source !== "justified" && source !== "stock") return "unknown";
  const asChild = getAttribute(opening, "asChild");
  if (name === "Button" && asChild) return attributeValue(asChild) === true ? "none" : "unknown";
  if (hasSpread(opening)) return "unknown";
  const type = getAttribute(opening, "type");
  if (type) {
    const value = attributeValue(type);
    if (value === "submit") return "submit";
    if (value === "button" || value === "reset") return "none";
    return "unknown";
  }
  if (source === "justified") return "none";
  // shadcn's react-aria base wraps react-aria's Button, which is type="button" by default; the Base UI base is
  // left unknown.
  const path = name === "Button" ? (sources.get("Button")?.path ?? "") : "";
  if (/(^|\/)aria(-[a-z]+)?\/ui(-[a-z]+)?\/button$/.test(path)) return "none";
  if (/(^|\/)base(-[a-z]+)?\/ui(-[a-z]+)?\/button$/.test(path)) return "unknown";
  // A button given as the `render` of a trigger, which draws it with type="button", as asChild does.
  const holder = isPropValue(element) ? element.parent.parent : undefined;
  if (holder?.name?.name === "render") return TYPED_WRAPPERS.has(elementName(holder.parent) ?? "") ? "none" : "unknown";
  // No type: a submit button, unless a wrapper with asChild gives it one.
  const parent = parentElement(element);
  if (parent && getAttribute(parent.openingElement, "asChild")) {
    const p = elementName(parent.openingElement) ?? "";
    if (p === "Button") return "implicit";
    return TYPED_WRAPPERS.has(p) ? "none" : "unknown";
  }
  return "implicit";
}

/** Whether a rendered expression may hold elements the file does not show. @param {any} expression */
function opaque(expression) {
  const e = unwrap(expression);
  if (!e) return false;
  switch (e.type) {
    case "JSXElement":
    case "JSXFragment":
    case "Literal":
    case "TemplateLiteral":
    case "JSXEmptyExpression":
      return false;
    case "ConditionalExpression":
      return opaque(e.consequent) || opaque(e.alternate);
    case "LogicalExpression":
      return e.operator === "&&" ? opaque(e.right) : opaque(e.left) || opaque(e.right);
    case "CallExpression": {
      const fn = unwrap(e.arguments[0]);
      if (!isMethodCall(e, "map") || !fn || !FUNCTIONS.has(fn.type)) return true;
      if (fn.body.type !== "BlockStatement") return opaque(fn.body);
      return fn.body.body.some((/** @type {any} */ s) => s.type !== "ReturnStatement" || opaque(s.argument));
    }
    default:
      return true;
  }
}

/** The JSX elements around a node, nearest first. @param {any} node */
function* ancestors(node) {
  for (let el = parentElement(node); el; el = parentElement(el)) yield el;
}

const inAlertDialog = (/** @type {any} */ node) =>
  [...ancestors(node)].some((el) => /^AlertDialog/.test(elementName(el.openingElement) ?? ""));

const isDestructive = (/** @type {any} */ opening) => attributeValue(getAttribute(opening, "variant")) === "destructive";

/**
 * Reads a `<form>`: its buttons and markers in code order.
 * @param {any} form
 * @param {Map<string, any>} sources
 * @param {Record<string, readonly string[]>} keys
 */
function readForm(form, sources, keys) {
  /** @type {{ element?: any, kind: Kind | "opaque" }[]} */
  const items = [];
  const buttons = new Set();
  let singleLine = false;
  /** How many single-line fields the form holds, or undefined when the code does not say, as for fields in a `.map()`. */
  /** @type {number | undefined} */
  let fieldCount = 0;
  let destructive = false;
  const insideButton = (/** @type {any} */ node) => {
    for (let el = parentElement(node); el && el !== form; el = parentElement(el)) if (buttons.has(el)) return true;
    return false;
  };
  walk(form, keys, (n, parent) => {
    if (n === form) return undefined;
    if (n.type === "JSXElement") {
      const opening = n.openingElement;
      const name = elementName(opening) ?? "";
      const kind = buttonKind(n, sources);
      if (kind) {
        // A Button with asChild renders its child, which is read on its own.
        if (name === "Button" && attributeValue(getAttribute(opening, "asChild")) === true) return undefined;
        buttons.add(n);
        if (isDestructive(opening)) destructive = true;
        if (!insideButton(n)) items.push({ element: n, kind });
        return undefined;
      }
      if (isSingleLine(opening) === true && (name === "input" || sources.has(name))) {
        singleLine = true;
        if (fieldCount !== undefined) fieldCount = inFunction(n, form) ? undefined : fieldCount + 1;
      } else if (isSingleLine(opening) === undefined && (name === "input" || sources.has(name))) fieldCount = undefined;
      const first = name.split(".")[0];
      const known = /^[a-z]/.test(name) || name === "Fragment" || name === "React.Fragment" || sources.has(first);
      if (!known && !insideButton(n)) items.push({ element: n, kind: "opaque" });
      return undefined;
    }
    if (n.type === "JSXExpressionContainer" && (parent?.type === "JSXElement" || parent?.type === "JSXFragment")) {
      const holder = parent.type === "JSXElement" ? elementName(parent.openingElement) ?? "" : "";
      if (!TEXT.has(holder) && !insideButton(n) && opaque(n.expression)) items.push({ kind: "opaque" });
    }
    return undefined;
  });
  return { items, singleLine, fieldCount, destructive };
}

/** Whether a node lies in a function inside the form, such as a `.map()` callback. @param {any} node @param {any} form */
function inFunction(node, form) {
  for (let n = node.parent; n && n !== form; n = n.parent) if (FUNCTIONS.has(n.type)) return true;
  return false;
}

/** Whether a button's onClick sends the form through a handler. @param {any} opening @param {any} context */
function clickSends(opening, context) {
  const click = getAttribute(opening, "onClick");
  if (click?.value?.type !== "JSXExpressionContainer") return false;
  const keys = context.sourceCode.visitorKeys;
  const e = unwrap(click.value.expression);
  if (e?.type === "CallExpression") return callsName(e, keys, SENDS);
  const fn = resolveFunction(e, context, opening);
  return Boolean(fn && callsName(fn.body, keys, SENDS));
}

/** Whether an expression is a test for the Enter key alone. @param {any} test */
function isEnterTest(test) {
  const t = unwrap(test);
  if (t?.type !== "BinaryExpression" || (t.operator !== "===" && t.operator !== "==")) return false;
  const pairs = [
    [t.left, t.right],
    [t.right, t.left],
  ];
  return pairs.some(([a, b]) => {
    const value = staticValue(b);
    const m = unwrap(a);
    if (m?.type !== "MemberExpression" || m.computed || m.property.type !== "Identifier") return false;
    const prop = m.property.name;
    if ((prop === "key" || prop === "code") && (value === "Enter" || value === "NumpadEnter")) return true;
    return (prop === "keyCode" || prop === "which") && value === 13;
  });
}

/** Whether a statement only cancels the event, and does cancel it. @param {any} statement */
function onlyCancels(statement) {
  const list = statement.type === "BlockStatement" ? statement.body : [statement];
  if (!list.length) return false;
  let cancels = false;
  for (const s of list) {
    if (s.type === "ReturnStatement" && !s.argument) continue;
    if (s.type !== "ExpressionStatement") return false;
    if (isMethodCall(s.expression, "preventDefault")) cancels = true;
    else if (!isMethodCall(s.expression, "stopPropagation")) return false;
  }
  return cancels;
}

/**
 * Whether a key handler does nothing on Enter but cancel it.
 * @param {any} fn
 * @param {Record<string, readonly string[]>} keys
 */
function blocksEnter(fn, keys) {
  if (mentionsName(fn.body, keys, (n) => n === "isComposing" || MODIFIERS.test(n))) return false;
  if (callsName(fn.body, keys, (n) => SENDS(n) || n === "submit")) return false;
  /** @param {any} node */
  const matches = (node) => {
    const n = unwrap(node);
    if (n?.type === "LogicalExpression" && n.operator === "&&") return isEnterTest(n.left) && isMethodCall(n.right, "preventDefault");
    return false;
  };
  const body = unwrap(fn.body);
  if (body.type !== "BlockStatement") return matches(body);
  let found = false;
  walk(body, keys, (n) => {
    if (found || FUNCTIONS.has(n.type)) return false;
    if (n.type === "IfStatement" && isEnterTest(n.test) && onlyCancels(n.consequent)) found = true;
    if (n.type === "ExpressionStatement" && matches(n.expression)) found = true;
    return undefined;
  });
  return found;
}

export default defineRule({
  id: "FRM-015",
  level: "rule",
  verdict: "Unanimous (3 of 3)",
  description: "A form that Enter cannot send, or where Enter presses a helper button instead of the main one.",
  messages: {
    noForm:
      'this button sends the fields with handleSubmit in onClick, but there is no <form>, so Enter in a field does nothing. Put the fields and the button in <form onSubmit={form.handleSubmit(onSubmit)}> and make the button type="submit".',
    mainNotSubmit:
      'this form has no submit button, so Enter in a field does not do what this button does. Make the main button type="submit" and send from the form\'s onSubmit. Justified\'s Button is type="button" unless you write the type.',
    mainNotSubmitOneField:
      'this form has no submit button and one single-line field, so Enter in the field sends the form, but the form has no onSubmit: the page reloads instead of doing what this button does. Make the main button type="submit" and send from the form\'s onSubmit.',
    enterBlocked:
      "this key handler cancels Enter, so Enter cannot send the form. Remove it; if people send too early, check the fields when they send instead.",
    strayButton:
      'this button has no type and comes before the submit button, so Enter in a field presses it instead of the main button. A button with no type inside a form is a submit button: give it type="button".',
    footerOutside:
      'this submit button is in a footer outside the dialog\'s <form>, so neither Enter nor a click sends the form. Put the <form> around the footer too, or give the form an id and this button form="that-id".',
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;
    /** @type {Map<string, any>} */
    let sources = new Map();
    const reported = new Set();
    /** @param {any} node @param {string} messageId */
    const report = (node, messageId) => {
      if (reported.has(node)) return;
      reported.add(node);
      context.report({ node, messageId });
    };

    return {
      Program(node) {
        sources = componentSources(node);
      },
      JSXElement(node) {
        const opening = node.openingElement;
        const name = elementName(opening) ?? "";

        if (name === "form") {
          if (inAlertDialog(node)) return;
          const { items, singleLine, fieldCount, destructive } = readForm(node, sources, keys);
          const firstSubmit = items.findIndex((i) => i.kind === "submit");
          // A stray submit button before the main one.
          if (firstSubmit > 0) {
            const first = items.findIndex((i) => i.kind !== "none");
            if (items[first]?.kind === "implicit") report(items[first].element.openingElement, "strayButton");
          }
          // No submit button at all, and a main button that is a plain one.
          const open = items.some((i) => i.kind === "submit" || i.kind === "implicit" || i.kind === "unknown" || i.kind === "opaque");
          // With no submit button and exactly one single-line field, Enter still sends the form (implicit
          // submission in the HTML standard), so a form whose onSubmit or action handles it is left alone.
          const handled = getAttribute(opening, "onSubmit") || getAttribute(opening, "action");
          const oneField = fieldCount === 1;
          if (!open && singleLine && !(oneField && handled) && !destructive && !getAttribute(opening, "id") && !hasSpread(opening)) {
            const main = items.find(({ element }) => {
              const o = element.openingElement;
              if (getAttribute(o, "form")) return false;
              if (clickSends(o, context)) return true;
              if (elementName(o) !== "Button" || sources.get("Button")?.from !== "justified") return false;
              if (getAttribute(o, "type") || getAttribute(o, "asChild")) return false;
              const variant = getAttribute(o, "variant");
              const size = attributeValue(getAttribute(o, "size"));
              return (!variant || attributeValue(variant) === "default") && size !== "icon";
            });
            if (main) report(main.element.openingElement, oneField ? "mainNotSubmitOneField" : "mainNotSubmit");
          }
          return;
        }

        if (FOOTERS.has(name)) {
          if (inAlertDialog(node) || [...ancestors(node)].some((el) => elementName(el.openingElement) === "form")) return;
          const parent = node.parent;
          if (parent?.type !== "JSXElement" && parent?.type !== "JSXFragment") return;
          const before = parent.children.slice(0, parent.children.indexOf(node));
          if (!before.some((/** @type {any} */ c) => c.type === "JSXElement" && elementName(c.openingElement) === "form")) return;
          walk(node, keys, (n) => {
            if (n.type !== "JSXElement" || n === node) return undefined;
            const o = n.openingElement;
            if (buttonKind(n, sources) === "submit" && !getAttribute(o, "form") && !isDestructive(o)) report(o, "footerOutside");
            return undefined;
          });
        }
      },
      JSXOpeningElement(node) {
        const name = elementName(node) ?? "";

        // A button that sends with handleSubmit, with no form in the component.
        if ((name === "Button" || name === "button") && !getAttribute(node, "form") && !isDestructive(node)) {
          const click = getAttribute(node, "onClick");
          const e = click?.value?.type === "JSXExpressionContainer" ? unwrap(click.value.expression) : undefined;
          const sends =
            e &&
            (e.type === "CallExpression"
              ? calleeNameIs(e, "handleSubmit")
              : FUNCTIONS.has(e.type) && callsName(e.body, keys, (n) => n === "handleSubmit"));
          if (sends && !inAlertDialog(node)) {
            const scope = outerScope(node);
            let hasForm = false;
            let field = false;
            walk(scope, keys, (n) => {
              if (n.type !== "JSXOpeningElement") return undefined;
              const nm = elementName(n) ?? "";
              if (nm === "form") hasForm = true;
              if (isSingleLine(n) === true && (nm === "input" || sources.has(nm))) field = true;
              return undefined;
            });
            if (!hasForm && field) report(node, "noForm");
          }
        }

        // A key handler that cancels Enter.
        const keyDown = getAttribute(node, "onKeyDown");
        if (!keyDown || keyDown.value?.type !== "JSXExpressionContainer") return;
        const element = node.parent;
        const around = [...ancestors(element)];
        if (around.some((el) => /^(AlertDialog|Command|Combobox|Popover|Autocomplete)/.test(elementName(el.openingElement) ?? "")))
          return;
        let form;
        if (name === "form") form = element;
        else {
          if (isSingleLine(node) !== true || (name !== "input" && !sources.has(name))) return;
          for (const a of ["role", "list", "aria-autocomplete", "aria-activedescendant", "aria-controls", "aria-expanded"])
            if (getAttribute(node, a)) return;
          form = around.find((el) => elementName(el.openingElement) === "form");
        }
        if (!form || readForm(form, sources, keys).destructive) return;
        const fn = resolveFunction(keyDown.value.expression, context, node);
        if (fn && blocksEnter(fn, keys)) report(keyDown, "enterBlocked");
      },
    };
  },
});

/** Whether a call is `handleSubmit(…)` or `x.handleSubmit(…)`. @param {any} call @param {string} name */
function calleeNameIs(call, name) {
  const c = unwrap(call.callee);
  if (c?.type === "Identifier") return c.name === name;
  return c?.type === "MemberExpression" && !c.computed && c.property.type === "Identifier" && c.property.name === name;
}
