/**
 * justified/state-in-code, for VIS-008a (a requirement): a state a control
 * shows is also set in code on the control itself, and changes whenever the
 * look changes.
 *
 * Flags:
 *   1. A look switched by a state such as `selected`, `active`, `checked`,
 *      `open` or `on` (`cn(…, selected && "bg-accent")`, `on ? "bg-primary"
 *      : "bg-background"`, `{ "border-primary": plan.id === selectedId }`,
 *      or `variant={on ? "default" : "outline"}`) on a `button`, `Button`,
 *      `Card`, `div`, `li`, `span`, `tr` or `TableRow` with `onClick`, when
 *      neither it nor anything inside it carries `aria-pressed`,
 *      `aria-selected`, `aria-checked`, `aria-expanded`, `aria-current`,
 *      `aria-sort` or `data-state`, and no text inside it follows the same
 *      state.
 *   2. `opacity-50`, `pointer-events-none` or `cursor-not-allowed` added by
 *      a condition to a button, link or field that acts (`onClick`, `href`
 *      or `type="submit"`) and has neither `disabled` nor `aria-disabled`.
 *   3. A fixed `aria-pressed`, `aria-expanded`, `aria-checked` or
 *      `aria-selected` (`"true"`, `{false}` …) on an element with `onClick`,
 *      and `aria-pressed`, `aria-selected` or `aria-checked` on an `li` or
 *      `div` with no role whose child is the button or link.
 *   4. `aria-disabled` on an element whose `onClick` handler, written in the
 *      file, runs with no condition at all. For a computed `aria-disabled`,
 *      only when the handler neither reads its value nor calls a function
 *      the file declares, which may hold the guard.
 *
 * Left alone:
 *   - shadcn and Radix components that set their own state (`Toggle`,
 *     `TabsTrigger`, `Checkbox`, `RadioGroupItem`, menu items …), and links,
 *     whose current page is NAV-002a (`active-link-aria-current`), and
 *     header cells, whose sort is TBL-002.
 *   - Elements that spread props, which may bring the state.
 *   - Whether a `disabled` or `aria-disabled` follows the same condition as
 *     the faded look: any such attribute quiets check 2.
 *   - A state that is set but stops updating at run time, and a look drawn
 *     only by CSS from elsewhere: the review skill covers them.
 */
import { defineRule } from "../lib/define-rule.js";
import { parseToken, readClassList } from "../lib/class-token-helpers.js";
import {
  attributeValue,
  elementName,
  getAttribute,
  hasSpread,
  meaningfulChildren,
  readsName,
  unwrap,
  walk,
} from "../lib/jsx.js";

const TARGETS = new Set(["button", "Button", "Card", "div", "li", "span", "tr", "TableRow"]);
const STATE_ATTRIBUTES = ["aria-pressed", "aria-selected", "aria-checked", "aria-expanded", "aria-current", "aria-sort", "data-state"];
const STATEFUL =
  /^(Toggle|ToggleGroupItem|TabsTrigger|Checkbox|RadioGroupItem|Switch|AccordionTrigger|CollapsibleTrigger|SelectTrigger|SelectItem|CommandItem|DropdownMenu(Checkbox|Radio)Item|ContextMenu(Checkbox|Radio)Item|Menubar(Checkbox|Radio)Item|PopoverTrigger|DropdownMenuTrigger|input|select)$/;
const STATE_NAME =
  /^(is|has)?(selected|active|checked|pressed|open|opened|expanded|current|on|toggled|chosen|picked)$|^(selected|active|current|chosen|checked|picked)[A-Z_]|[a-z](Selected|Active|Checked|Pressed|Open|Expanded|Chosen|Toggled)$/i;
/** Classes that draw a look, not layout. */
const LOOK = /^-?(bg|text|border|ring|outline|font|shadow|underline|decoration|rotate|scale|fill|stroke|opacity)(-|$)/;
const OFF_LOOK = /^(opacity-(30|40|50|60|70)|pointer-events-none|cursor-not-allowed)$/;
const PRESSABLE = new Set(["button", "Button", "a", "Link", "input", "Input", "Textarea", "textarea", "select", "SelectTrigger"]);
const FIXED_STATES = ["aria-pressed", "aria-expanded", "aria-checked", "aria-selected"];
const CONTROLS = new Set(["button", "Button", "a", "Link", "input"]);
const FUNCTIONS = new Set(["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"]);

/** Whether a string holds a look class. @param {string} text */
const hasLookClass = (text) =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .some((t) => {
      const { utility } = parseToken(t);
      return LOOK.test(utility) && !/^text-(xs|sm|base|lg|\d?xl|left|center|right)$/.test(utility);
    });

/** The strings an expression can give, read shallowly. @param {any} node @returns {string[]} */
function strings(node) {
  const n = unwrap(node);
  if (!n) return [];
  if (n.type === "Literal" && typeof n.value === "string") return [n.value];
  if (n.type === "TemplateLiteral") return n.quasis.map((q) => q.value.cooked ?? "");
  if (n.type === "ConditionalExpression") return [...strings(n.consequent), ...strings(n.alternate)];
  if (n.type === "LogicalExpression") return [...strings(n.left), ...strings(n.right)];
  if (n.type === "ArrayExpression") return n.elements.flatMap((e) => strings(e));
  if (n.type === "CallExpression") return n.arguments.flatMap((a) => strings(a));
  return [];
}

export default defineRule({
  id: "VIS-008a",
  level: "rule",
  verdict: "Requirement",
  description:
    "A look switched by a state with no aria-pressed, aria-selected, aria-checked or aria-expanded, a faded control that is not off in code, a fixed or misplaced state, and aria-disabled on a handler that still runs.",
  messages: {
    lookOnly:
      "this {{name}} changes its look with {{state}} but sets no state in code, so a screen reader announces it the same either way. Set aria-pressed={{open}}{{state}}{{close}} (or aria-selected, aria-checked, aria-expanded, as fits), or use a component that sets it, such as Toggle or RadioGroup.",
    fadedOnly:
      "{{token}} makes this {{name}} look off under a condition, but it is not off in code, so Enter still runs it and a screen reader calls it usable. Set disabled, or aria-disabled with a guard in the handler, under the same condition.",
    fixedState:
      "{{attribute}} is fixed at {{value}} on a control that is pressed, so the state in code never changes with the look. Bind it to the state, as in {{attribute}}={{open}}isOn{{close}}.",
    wrapperState:
      "{{attribute}} sits on the {{name}} around the control, not on the control itself, so the control is announced without it. Move it to the button or link, or give the element the role that carries it.",
    offStillRuns:
      "aria-disabled says this control is off, but its onClick still runs the action. Return early in the handler while it is off, or use disabled.",
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;

    /**
     * Names the element's own onClick sets. A toggle (`setBold(!bold)`,
     * `setOpen(true)`, `setOn((v) => !v)`) is the control's on or off state;
     * a value (`setDelivery(o.id)`) is its chosen state when the look
     * compares it, as in `delivery === o.id`.
     */
    let toggled = new Set();
    let chosen = new Set();

    /** @param {string} name */
    const isStateName = (name) => STATE_NAME.test(name) || toggled.has(name);

    /** Whether a test reads a state. @param {any} test */
    const isStateTest = (test) => {
      if (readsName(test, keys, isStateName)) return true;
      const t = unwrap(test);
      return (
        t?.type === "BinaryExpression" && ["===", "=="].includes(t.operator) && readsName(t, keys, (n) => chosen.has(n))
      );
    };

    /** @param {any} node */
    const isToggle = (node) => {
      const a = unwrap(node);
      if (!a) return false;
      if (a.type === "UnaryExpression" && a.operator === "!") return true;
      if (a.type === "Literal" && typeof a.value === "boolean") return true;
      if (a.type === "ArrowFunctionExpression" && a.body.type !== "BlockStatement") return isToggle(a.body);
      return false;
    };

    /** @param {any} attribute */
    const readSetters = (attribute) => {
      toggled = new Set();
      chosen = new Set();
      const e = attribute?.value?.type === "JSXExpressionContainer" ? attribute.value.expression : undefined;
      if (!e) return;
      walk(e, keys, (n) => {
        const callee = n.type === "CallExpression" ? unwrap(n.callee) : undefined;
        if (callee?.type === "Identifier" && /^set[A-Z]/.test(callee.name) && n.arguments.length === 1) {
          const name = callee.name[3].toLowerCase() + callee.name.slice(4);
          (isToggle(n.arguments[0]) ? toggled : chosen).add(name);
        }
        return undefined;
      });
    };

    /** Whether the element or anything inside it carries a state. @param {any} element */
    const carriesState = (element) => {
      let found = false;
      walk(element, keys, (n) => {
        if (found) return false;
        if (n.type !== "JSXOpeningElement") return undefined;
        if (STATE_ATTRIBUTES.some((a) => getAttribute(n, a))) found = true;
        else if (n !== element.openingElement && STATEFUL.test((elementName(n) ?? "").split(".").pop() ?? "")) found = true;
        return undefined;
      });
      return found;
    };

    /** Whether text inside follows a state, as Play becoming Pause. @param {any} element */
    const textFollowsState = (element) => {
      let found = false;
      const label = getAttribute(element.openingElement, "aria-label");
      if (label?.value?.type === "JSXExpressionContainer" && readsName(label.value.expression, keys, isStateName)) return true;
      walk({ type: "Wrapper", children: element.children }, { ...keys, Wrapper: ["children"] }, (n) => {
        if (found) return false;
        if (n.type === "JSXExpressionContainer" && readsName(n.expression, keys, isStateName)) found = true;
        return undefined;
      });
      return found;
    };

    /**
     * The state a look is switched by in a class expression, as source text.
     * @param {any} expression
     * @returns {string | undefined}
     */
    const switchedBy = (expression) => {
      let found;
      walk(expression, keys, (n) => {
        if (found || FUNCTIONS.has(n.type)) return false;
        if (n.type === "ConditionalExpression" || (n.type === "LogicalExpression" && n.operator === "&&")) {
          const test = n.type === "ConditionalExpression" ? n.test : n.left;
          const branches = n.type === "ConditionalExpression" ? [n.consequent, n.alternate] : [n.right];
          if (isStateTest(test) && branches.some((b) => strings(b).some(hasLookClass)))
            found = context.sourceCode.getText(test);
        } else if (n.type === "ObjectExpression") {
          for (const p of n.properties) {
            if (p.type !== "Property" || p.computed) continue;
            const key = p.key.type === "Identifier" ? p.key.name : String(p.key.value);
            if (hasLookClass(key) && isStateTest(p.value)) found = context.sourceCode.getText(p.value);
          }
        }
        return undefined;
      });
      return found;
    };

    /** The function an onClick runs, if the file writes it. @param {any} attribute */
    const handlerOf = (attribute) => {
      const e = attribute?.value?.type === "JSXExpressionContainer" ? unwrap(attribute.value.expression) : undefined;
      if (!e) return undefined;
      if (FUNCTIONS.has(e.type)) return e;
      if (e.type !== "Identifier") return undefined;
      let scope = context.sourceCode.getScope(e);
      while (scope) {
        const v = scope.set.get(e.name);
        if (v) {
          const def = v.defs[0];
          if (def?.type === "FunctionName") return def.node;
          const init = def?.type === "Variable" ? unwrap(def.node.init) : undefined;
          return init && FUNCTIONS.has(init.type) ? init : undefined;
        }
        scope = scope.upper;
      }
      return undefined;
    };

    /** Whether a function calls another the file declares. @param {any} fn */
    const callsLocal = (fn) => {
      let found = false;
      walk(fn.body, keys, (n) => {
        if (found) return false;
        const callee = n.type === "CallExpression" ? unwrap(n.callee) : undefined;
        if (callee?.type === "Identifier") {
          let scope = context.sourceCode.getScope(n);
          while (scope && !found) {
            if (scope.set.get(callee.name)?.defs.length) found = true;
            scope = scope.upper;
          }
        }
        return undefined;
      });
      return found;
    };

    /** Whether a function runs with no condition at all. @param {any} fn */
    const unconditional = (fn) => {
      let branch = false;
      walk(fn.body, keys, (n) => {
        if (branch) return false;
        if (n !== fn.body && FUNCTIONS.has(n.type)) return false;
        if (["IfStatement", "ConditionalExpression", "LogicalExpression", "SwitchStatement", "ChainExpression"].includes(n.type))
          branch = true;
        return undefined;
      });
      return !branch;
    };

    return {
      JSXElement(element) {
        const opening = element.openingElement;
        const name = elementName(opening) ?? "";
        if (hasSpread(opening)) return;
        const onClick = getAttribute(opening, "onClick");
        readSetters(onClick);

        // 1. A look switched by a state, with no state in code.
        if (TARGETS.has(name) && onClick && !carriesState(element) && !textFollowsState(element)) {
          const className = getAttribute(opening, "className");
          let state =
            className?.value?.type === "JSXExpressionContainer" ? switchedBy(className.value.expression) : undefined;
          const variant = getAttribute(opening, "variant");
          const v = variant?.value?.type === "JSXExpressionContainer" ? unwrap(variant.value.expression) : undefined;
          if (!state && v?.type === "ConditionalExpression" && isStateTest(v.test)) {
            const a = unwrap(v.consequent);
            const b = unwrap(v.alternate);
            if (a?.type === "Literal" && b?.type === "Literal" && a.value !== b.value) state = context.sourceCode.getText(v.test);
          }
          if (state)
            context.report({
              node: opening,
              messageId: "lookOnly",
              data: { name, state, open: "{", close: "}" },
            });
        }

        // 2. Faded under a condition, but not off in code.
        const acts =
          onClick || getAttribute(opening, "href") || attributeValue(getAttribute(opening, "type")) === "submit";
        if (PRESSABLE.has(name) && acts && !getAttribute(opening, "disabled") && !getAttribute(opening, "aria-disabled")) {
          const list = readClassList(context, opening);
          if (list) {
            const token = list.parts
              .filter((p) => p.group !== null)
              .flatMap((p) => p.tokens)
              .find((t) => OFF_LOOK.test(t) && !list.certain.includes(t));
            if (token) context.report({ node: getAttribute(opening, "className"), messageId: "fadedOnly", data: { token, name } });
          }
        }

        // 3. A fixed state on a pressable element, or a state on the wrapper.
        if (onClick) {
          for (const attribute of FIXED_STATES) {
            const a = getAttribute(opening, attribute);
            if (!a) continue;
            const value = attributeValue(a);
            if (value === true || value === false || value === "true" || value === "false" || value === "mixed")
              context.report({
                node: a,
                messageId: "fixedState",
                data: { attribute, value: String(value), open: "{", close: "}" },
              });
          }
        }
        if ((name === "li" || name === "div") && !getAttribute(opening, "role")) {
          const attribute = ["aria-pressed", "aria-selected", "aria-checked"].find((a) => getAttribute(opening, a));
          const child = meaningfulChildren(element).find(
            (/** @type {any} */ c) => c.type === "JSXElement" && CONTROLS.has(elementName(c.openingElement) ?? ""),
          );
          if (attribute && child)
            context.report({ node: getAttribute(opening, attribute), messageId: "wrapperState", data: { attribute, name } });
        }

        // 4. aria-disabled while the handler still runs.
        const off = getAttribute(opening, "aria-disabled");
        const offValue = attributeValue(off);
        if (off && offValue !== false && offValue !== "false" && onClick) {
          const fn = handlerOf(onClick);
          if (!fn || !unconditional(fn)) return;
          const expression = off.value?.type === "JSXExpressionContainer" ? off.value.expression : undefined;
          if (expression && offValue === undefined) {
            /** @type {Set<string>} */
            const names = new Set();
            walk(expression, keys, (n) => {
              if (n.type === "Identifier") names.add(n.name);
              return undefined;
            });
            if (readsName(fn.body, keys, (x) => names.has(x))) return;
            // A function the file declares may hold the guard.
            if (callsLocal(fn)) return;
          }
          context.report({ node: off, messageId: "offStillRuns" });
        }
      },
    };
  },
});
