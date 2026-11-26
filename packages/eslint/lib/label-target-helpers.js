/**
 * label-target-helpers.js: the shared check behind justified/option-text-toggles
 * (FRM-016a) and justified/switch-text-toggles (FRM-016b): a press on the
 * text of a checkbox, radio button or switch changes it, as a press on the
 * control does.
 *
 * Both texts list the same code patterns, for different controls, so one
 * check serves both. It reports only what the file shows for certain:
 *
 *   - textNotTied: the control has a name in code (an `id`, a written-out
 *     `aria-label`, or `aria-labelledby`), so FRM-010 is quiet, and its own
 *     text sits in a native `span`, `p` or `div` beside it with no label
 *     tied to the control. With an `aria-label`, the text must hold the
 *     label's words (or the label the text's), so a hint or a count beside
 *     the control is not mistaken for its text. With `aria-labelledby`, the
 *     text is the element it points at. With only an `id`, nothing in the
 *     file may point at that id.
 *   - labelNoFor: a `Label` or `label` beside the control with no `htmlFor`
 *     that does not wrap a control.
 *   - labelForMismatch: a `Label` or `label` beside the control whose
 *     written-out `htmlFor` is neither the control's id nor the id of
 *     anything else in the file that can take a label.
 *   - mappedId: a control rendered in a `.map()` with a written-out `id`
 *     that a label in the file points at, so every label reaches the first.
 *   - pointerEvents: a bare `pointer-events-none` class on a label tied to
 *     a control that is not disabled.
 *   - rowClick: a native row element whose `onClick` sets the same state as
 *     the control's `checked` or `onCheckedChange`, while the control has
 *     no `onClick` of its own (one that may stop the second toggle).
 *
 * "Beside" means a sibling in the control's row: its parent element, or its
 * grandparent when the parent only wraps the control, and one level into a
 * native `div`, `span` or `p` in that row.
 *
 * Left alone: a control with no name at all (that is FRM-010, which reports
 * it), a control inside a label, `Label`, `FieldLabel`, `FormItem`,
 * `FormControl`, `FormField`, `Field` or any wrapper whose name ends in
 * "Label" or "Field" or that takes a `label` prop (they tie or may tie the
 * text), controls and labels with spread props, ids and `htmlFor`s that
 * are computed and not written the same way, text in components (which may
 * render a label), and an `absolute` element laid over the text (whether it
 * covers the words shows only when the page runs).
 */
import {
  attributeValue,
  baseName,
  elementName,
  getAttribute,
  hasSpread,
  isPropValue,
  meaningfulChildren,
  parentElement,
  readsName,
  unwrap,
  walk,
} from "./jsx.js";
import { containsWords, iconImports, isAriaHidden, spellsWord, staticClassName, stringAttribute, visibleText } from "./name-helpers.js";

/** Elements that can be the target of a label's `htmlFor`, besides any component. */
const LABELABLE = new Set(["input", "select", "textarea", "button", "meter", "output", "progress"]);
const LABELS = new Set(["label", "Label", "FieldLabel", "FormLabel"]);
/** Wrappers that tie, or may tie, the text to a control inside them. */
const NAMING = new Set(["label", "Label", "FieldLabel", "Field", "FormItem", "FormControl", "FormField"]);
const TEXT_TAGS = new Set(["span", "p", "div"]);
const NOT_ROWS = new Set(["label", "button", "a", "input", "select", "textarea"]);
/** The part of each control people press. @type {Record<string, string>} */
const PARTS = { checkbox: "box", "radio button": "circle", switch: "track" };
const FUNCTIONS = new Set(["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"]);

/** The messages; `{{control}}` is the kind of control and `{{part}}` the part people press. */
export const labelTargetMessages = {
  textNotTied: `the words beside this {{control}} sit in a {{tag}} that is tied to nothing, so a press on them does nothing and only the small {{part}} responds. Put the words in a Label whose htmlFor matches the {{control}}'s id, or wrap both in one label.`,
  labelNoFor: `this Label beside a {{control}} has no htmlFor and does not wrap it, so a press on its words does nothing. Give the {{control}} an id and the Label the same htmlFor.`,
  labelForMismatch: `this Label points at "{{target}}", which is not the id of the {{control}} beside it, so a press on its words does not reach it. Give htmlFor and the {{control}}'s id the same value.`,
  mappedId: `every {{control}} this .map() renders gets the id "{{id}}", so each label reaches only the first one. Build the id from the item's key or with useId().`,
  pointerEvents: `pointer-events-none on this label stops a press on its words from reaching the {{control}}. Keep it for the disabled state only, for example group-data-[disabled=true]:pointer-events-none.`,
  rowClick: `this onClick toggles the {{control}} from the row instead of a label tied to it, so a press on the {{control}} itself toggles it twice, and nothing ties the text to it for assistive technology. Tie the text with a Label and htmlFor, and remove the onClick.`,
};

/** How an id or htmlFor is written: `{ text }` for a literal, `{ code }` for an expression. @param {any} attribute @param {any} sourceCode */
function written(attribute, sourceCode) {
  if (!attribute) return undefined;
  const v = attributeValue(attribute);
  if (typeof v === "string") return { text: v };
  if (attribute.value?.type === "JSXExpressionContainer") return { code: sourceCode.getText(unwrap(attribute.value.expression)) };
  return undefined;
}

const same = (/** @type {any} */ a, /** @type {any} */ b) =>
  a && b && ((a.text !== undefined && a.text === b.text) || (a.code !== undefined && a.code === b.code));

/** Whether the element sits inside a wrapper that ties, or may tie, its text. @param {any} element */
function isWrapped(element) {
  for (let el = parentElement(element); el; el = parentElement(el)) {
    const n = baseName(el.openingElement) ?? "";
    if (NAMING.has(n) || /(Label|Field)$/.test(n) || getAttribute(el.openingElement, "label")) return true;
  }
  return false;
}

/** Whether a function node is the callback of a `.map()` or `.flatMap()`. @param {any} fn */
const isMapCallback = (fn) => {
  const call = fn.parent;
  if (call?.type !== "CallExpression" || !call.arguments.includes(fn)) return false;
  const callee = unwrap(call.callee);
  return callee?.type === "MemberExpression" && !callee.computed && ["map", "flatMap"].includes(callee.property.name);
};

/** Whether the node is inside a `.map()` callback. @param {any} node */
function inMap(node) {
  for (let n = node.parent; n; n = n.parent) if (FUNCTIONS.has(n.type) && isMapCallback(n)) return true;
  return false;
}

const jsxChildren = (/** @type {any} */ el) => meaningfulChildren(el).filter((c) => c.type === "JSXElement");

/** The control's row: its parent, or its grandparent when the parent only wraps it. @param {any} element */
function rowOf(element) {
  const parent = parentElement(element);
  if (!parent || parent.children.indexOf(element) === -1) return undefined;
  const kids = meaningfulChildren(parent);
  if (kids.length === 1) {
    const grand = parentElement(parent);
    if (grand && grand.children.includes(parent)) return { row: grand, self: parent };
  }
  return { row: parent, self: element };
}

/** The elements beside a control: its row's other children, and one level into native text boxes. @param {any} element */
function besideOf(element) {
  const r = rowOf(element);
  if (!r) return [];
  const out = [];
  for (const c of jsxChildren(r.row)) {
    if (c === r.self) continue;
    out.push(c);
    if (TEXT_TAGS.has(elementName(c.openingElement) ?? "")) out.push(...jsxChildren(c));
  }
  return out;
}

/** Whether a JSX element is a control or a component that may render one. @param {any} n */
const mayBeControl = (n) => {
  const name = elementName(n.openingElement) ?? "";
  return /^[A-Z]/.test(name) || name.includes(".") || LABELABLE.has(name);
};

/** Whether an element holds a control or a component that may render one. @param {any} element @param {any} keys */
function holdsControl(element, keys) {
  let found = false;
  walk(element, keys, (n) => {
    if (found) return false;
    if (n !== element && n.type === "JSXElement" && mayBeControl(n)) found = true;
    return undefined;
  });
  return found;
}

/** Identifier names a function body calls directly, or the identifier itself. @param {any} expression @param {any} keys */
function setterNames(expression, keys) {
  const e = unwrap(expression);
  if (!e) return [];
  if (e.type === "Identifier") return [e.name];
  if (!FUNCTIONS.has(e.type)) return [];
  /** @type {string[]} */
  const names = [];
  walk(e.body, keys, (n) => {
    if (n.type === "CallExpression" && unwrap(n.callee)?.type === "Identifier") names.push(unwrap(n.callee).name);
    return FUNCTIONS.has(n.type) ? false : undefined;
  });
  return names;
}

/**
 * Builds the rule's listener.
 * @param {import("eslint").Rule.RuleContext} context
 * @param {(opening: any) => string | undefined} kindOf The control's kind ("checkbox", "radio button", "switch") or `undefined`.
 */
export function labelTargetListener(context, kindOf) {
  const sourceCode = context.sourceCode;
  const keys = /** @type {any} */ (sourceCode.visitorKeys);
  /** @type {Set<string>} */
  let icons = new Set();
  /** @type {any[]} */
  const controls = [];
  /** @type {any[]} */
  const labels = [];
  /** Written-out ids by value, with the element names that carry them. @type {Map<string, string[]>} */
  const ids = new Map();
  let anySpread = false;

  return {
    Program(node) {
      icons = iconImports(node);
    },
    JSXElement(element) {
      const opening = element.openingElement;
      const name = elementName(opening) ?? "";
      if (hasSpread(opening)) anySpread = true;
      const id = stringAttribute(opening, "id");
      if (id !== undefined) ids.set(id, [...(ids.get(id) ?? []), name]);
      if (LABELS.has(name)) labels.push(element);
      if (kindOf(opening)) controls.push(element);
    },
    "Program:exit"() {
      const labelFors = labels.map((l) => written(getAttribute(l.openingElement, "htmlFor"), sourceCode)).filter(Boolean);
      /** Whether a label in the file points at this id. @param {any} id */
      const pointedAt = (id) => labelFors.some((f) => same(f, id));
      const reported = new Set();
      /** @type {(descriptor: any) => void} */
      let report = () => {};

      for (const element of controls) {
        const opening = element.openingElement;
        if (hasSpread(opening) || isPropValue(element) || isAriaHidden(opening)) continue;
        const kind = /** @type {string} */ (kindOf(opening));
        report = (descriptor) => {
          if (reported.has(descriptor.node)) return;
          reported.add(descriptor.node);
          context.report({ ...descriptor, data: { ...descriptor.data, control: kind, part: PARTS[kind] ?? kind } });
        };
        const id = written(getAttribute(opening, "id"), sourceCode);
        const disabled = getAttribute(opening, "disabled");

        // A hard-coded id in a .map() that a label points at.
        if (id?.text !== undefined && inMap(element) && pointedAt(id)) {
          report({ node: getAttribute(opening, "id"), messageId: "mappedId", data: { id: id.text } });
          continue;
        }

        // pointer-events-none on a tied label, while the control is enabled.
        if (!disabled) {
          for (const label of labels) {
            const classes = staticClassName(label.openingElement);
            if (!classes || !classes.split(/\s+/).includes("pointer-events-none")) continue;
            const wraps = (() => {
              for (let el = parentElement(element); el; el = parentElement(el)) if (el === label) return true;
              return false;
            })();
            const f = written(getAttribute(label.openingElement, "htmlFor"), sourceCode);
            if (wraps || (id && same(f, id))) report({ node: label.openingElement, messageId: "pointerEvents" });
          }
        }

        // An onClick on the row that sets the control's state.
        if (!getAttribute(opening, "onClick")) {
          const names = [
            ...setterNames(getAttribute(opening, "onCheckedChange")?.value?.expression, keys),
            ...(unwrap(getAttribute(opening, "checked")?.value?.expression)?.type === "Identifier"
              ? [unwrap(getAttribute(opening, "checked").value.expression).name]
              : []),
          ];
          if (names.length) {
            let el = parentElement(element);
            for (let depth = 0; el && depth < 3; depth++, el = parentElement(el)) {
              const n = elementName(el.openingElement) ?? "";
              if (!/^[a-z]+$/.test(n) || NOT_ROWS.has(n)) continue;
              const onClick = getAttribute(el.openingElement, "onClick");
              const fn = unwrap(onClick?.value?.expression);
              if (!fn || !FUNCTIONS.has(fn.type)) continue;
              if (readsName(fn.body, keys, (x) => names.includes(x))) {
                report({ node: onClick, messageId: "rowClick" });
                break;
              }
            }
          }
        }

        if (isWrapped(element)) continue;
        const beside = besideOf(element);
        const besideLabels = beside.filter((b) => LABELS.has(elementName(b.openingElement) ?? ""));

        // A Label beside the control that is tied to nothing.
        let labelProblem = false;
        for (const label of besideLabels) {
          const lo = label.openingElement;
          if (hasSpread(lo) || !["Label", "label"].includes(elementName(lo) ?? "")) continue;
          const text = visibleText(label, icons);
          const htmlFor = getAttribute(lo, "htmlFor");
          if (!htmlFor) {
            if (holdsControl(label, keys) || (text !== undefined && !spellsWord(text))) continue;
            report({ node: lo, messageId: "labelNoFor" });
            labelProblem = true;
            continue;
          }
          const f = written(htmlFor, sourceCode);
          if (f?.text === undefined || (id && id.text === undefined)) continue;
          if (id && same(f, id)) continue;
          const holders = ids.get(f.text) ?? [];
          if (anySpread || holders.some((n) => LABELABLE.has(n) || /^[A-Z]/.test(n) || n.includes("."))) continue;
          report({ node: htmlFor, messageId: "labelForMismatch", data: { target: f.text } });
          labelProblem = true;
        }
        if (labelProblem || besideLabels.length) continue;

        // The control's own text in a span, p or div tied to nothing.
        const ariaLabel = getAttribute(opening, "aria-label");
        const labelledBy = written(getAttribute(opening, "aria-labelledby"), sourceCode);
        if (!ariaLabel && !labelledBy && !id) continue; // No name at all: FRM-010.
        if (id && (pointedAt(id) || (id.code !== undefined && labelFors.some((f) => f.code !== undefined)))) continue;
        const label = stringAttribute(opening, "aria-label");
        if (ariaLabel && label === undefined) continue;
        for (const b of beside) {
          const bo = b.openingElement;
          const tag = elementName(bo) ?? "";
          if (!TEXT_TAGS.has(tag) || hasSpread(bo) || isAriaHidden(bo) || bo.attributes.some((a) => a.name?.name === "onClick")) continue;
          const text = visibleText(b, icons);
          if (text === undefined || !spellsWord(text)) continue;
          let match = false;
          if (labelledBy) match = same(written(getAttribute(bo, "id"), sourceCode), labelledBy);
          else if (label !== undefined) match = containsWords(text, label) || containsWords(label, text);
          else match = true;
          if (match) {
            report({ node: bo, messageId: "textNotTied", data: { tag } });
            break;
          }
        }
      }
    },
  };
}
