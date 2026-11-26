/**
 * justified/sort-in-header-button, for TBL-002: a sortable header holds a
 * keyboard sort control, a button or link, and the sorted column's order is
 * in code, not shown by an arrow alone.
 *
 * Flags:
 *   - A `TableHead` or `th` with `onClick`, `onMouseDown` or
 *     `onPointerDown`, or a `div` or `span` inside it with one, when the
 *     header holds no button, link or other control. A keyboard cannot
 *     reach such a handler.
 *   - A `TableHead` or `th` with `role="button"` or a literal `tabIndex` of
 *     0 or more: the cell stops being a header.
 *   - `aria-sort` on a `Button`, `button`, `a` or `Link`: it belongs on the
 *     header cell.
 *   - A `TableHead` whose control sorts with TanStack Table
 *     (`column.getToggleSortingHandler()` or `column.toggleSorting(…)`),
 *     in a table where no header cell sets `aria-sort`, and where the
 *     header holds no `sr-only` text and no text from an expression that
 *     could say the order.
 *
 * Left alone:
 *   - `aria-sort` on more than one column. A table that sorts by several
 *     columns at once is outside the rule, and the code cannot tell it from
 *     a mistake.
 *   - A sort handler with another name than TanStack's, since lint cannot
 *     tell a sort from any other click. The review skill covers it.
 *   - An `aria-label` such as "Sort by finish time" on the button. That
 *     is our own advice, not part of the rule.
 *   - Elements with spread props, where the code cannot see everything.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, getAttribute, hasSpread, parentElement, unwrap, walk } from "../lib/jsx.js";

const HEADERS = new Set(["TableHead", "th"]);
const TABLES = new Set(["Table", "table"]);
const POINTER = ["onClick", "onMouseDown", "onPointerDown"];
/** Elements that are, or may be, a control a keyboard reaches. */
const CONTROLS = new Set([
  "Button",
  "button",
  "a",
  "Link",
  "NavLink",
  "input",
  "select",
  "Checkbox",
  "Switch",
  "Select",
  "SelectTrigger",
  "DropdownMenu",
  "DropdownMenuTrigger",
  "Popover",
  "PopoverTrigger",
]);
const SORT_TARGETS = new Set(["Button", "button", "a", "Link"]);
/** Icon libraries: what they draw is a picture, never text or a control. */
const ICON_SOURCES =
  /^(lucide-react|@radix-ui\/react-icons|@tabler\/icons-react|@heroicons\/react(\/.*)?|react-icons(\/.*)?|@phosphor-icons\/react)$/;

/** @param {any} element A JSXElement. */
const nameOf = (element) => elementName(element.openingElement) ?? "";

/**
 * Whether a header element holds something a keyboard can use, or may.
 * @param {any} header A JSXElement.
 * @param {Record<string, readonly string[]>} keys
 * @param {(name: string) => boolean} isIcon
 */
function holdsControl(header, keys, isIcon) {
  let found = false;
  walk(header, keys, (n) => {
    if (found) return false;
    if (n.type !== "JSXElement" || n === header) return undefined;
    const name = nameOf(n);
    const opening = n.openingElement;
    if (CONTROLS.has(name) || getAttribute(opening, "role") || getAttribute(opening, "tabIndex")) found = true;
    // A component of the project's own may render a control.
    else if (/^[A-Z]/.test(name) && !isIcon(name)) found = true;
    return undefined;
  });
  return found;
}

/** Whether the opening element has one of the pointer handlers. @param {any} opening */
const pointerHandler = (opening) => POINTER.map((p) => getAttribute(opening, p)).find(Boolean);

/**
 * Whether an expression sorts with TanStack Table: `x.getToggleSortingHandler()`
 * itself, or a function that calls `x.toggleSorting(…)` or `x.getToggleSortingHandler()`.
 * @param {any} expression
 * @param {Record<string, readonly string[]>} keys
 */
function sortsWithTanStack(expression, keys) {
  let found = false;
  walk(expression, keys, (n) => {
    if (found) return false;
    if (n.type === "CallExpression") {
      const callee = unwrap(n.callee);
      if (
        callee.type === "MemberExpression" &&
        !callee.computed &&
        callee.property.type === "Identifier" &&
        (callee.property.name === "toggleSorting" || callee.property.name === "getToggleSortingHandler")
      )
        found = true;
    }
    return undefined;
  });
  return found;
}

/**
 * Whether a class attribute may hold `sr-only`, reading every string in it.
 * @param {any} attribute
 * @param {Record<string, readonly string[]>} keys
 */
function mayHoldSrOnly(attribute, keys) {
  if (!attribute?.value) return false;
  if (attribute.value.type === "Literal") return /(^|\s)sr-only(\s|$)/.test(String(attribute.value.value));
  let found = false;
  walk(attribute.value, keys, (n) => {
    if (n.type === "Literal" && typeof n.value === "string" && /(^|\s)sr-only(\s|$)/.test(n.value)) found = true;
    if (n.type === "TemplateElement" && /(^|\s)sr-only(\s|$)/.test(n.value.cooked ?? "")) found = true;
  });
  return found;
}

/** Whether an expression child can only give elements or nothing, never text. @param {any} node */
function onlyElements(node) {
  const n = unwrap(node);
  if (!n || n.type === "JSXEmptyExpression") return true;
  if (n.type === "JSXElement" || n.type === "JSXFragment") return true;
  if (n.type === "Literal") return n.value === null || typeof n.value === "boolean";
  if (n.type === "Identifier") return n.name === "undefined";
  if (n.type === "ConditionalExpression") return onlyElements(n.consequent) && onlyElements(n.alternate);
  // `a && <Icon />` draws either the icon or, at most, a falsy value such as 0, which says no order.
  if (n.type === "LogicalExpression" && n.operator === "&&") return onlyElements(n.right);
  if (n.type === "LogicalExpression") return onlyElements(n.left) && onlyElements(n.right);
  return false;
}

/**
 * Whether a header may say the order in text: an `sr-only` element, a name
 * or description on an element, a spread, or text from an expression.
 * @param {any} header
 * @param {Record<string, readonly string[]>} keys
 * @param {(name: string) => boolean} isIcon
 */
function maySayOrder(header, keys, isIcon) {
  let found = false;
  walk(header, keys, (n) => {
    if (found) return false;
    if (n.type === "JSXElement") {
      const opening = n.openingElement;
      if (hasSpread(opening) && n !== header) found = true;
      for (const a of ["aria-label", "aria-labelledby", "aria-describedby", "title"])
        if (getAttribute(opening, a)) found = true;
      if (mayHoldSrOnly(getAttribute(opening, "className"), keys)) found = true;
      // Icons draw no text; what a project component draws is unknown.
      const name = nameOf(n);
      if (n !== header && /^[A-Z]/.test(name) && !isIcon(name) && !SORT_TARGETS.has(name)) found = true;
      return undefined;
    }
    if (n.type === "JSXExpressionContainer" && n.parent?.type !== "JSXAttribute") {
      if (!onlyElements(n.expression)) found = true;
      return false;
    }
    if (n.type === "JSXAttribute") return false;
    return undefined;
  });
  return found;
}

/**
 * Whether any header cell in the table sets `aria-sort`, or may through a spread.
 * @param {any} table
 * @param {Record<string, readonly string[]>} keys
 */
function tableSetsAriaSort(table, keys) {
  let found = false;
  walk(table, keys, (n) => {
    if (found) return false;
    if (n.type === "JSXElement" && HEADERS.has(nameOf(n))) {
      if (getAttribute(n.openingElement, "aria-sort") || hasSpread(n.openingElement)) found = true;
    }
    return undefined;
  });
  return found;
}

/** Whether an element sits in a table body. @param {any} element */
function inBody(element) {
  for (let el = parentElement(element); el; el = parentElement(el)) {
    const name = nameOf(el);
    if (name === "TableBody" || name === "tbody") return true;
    if (TABLES.has(name)) return false;
  }
  return false;
}

/** The nearest element that is a header cell, through `div`s and `span`s only. @param {any} element */
function headerThroughWrappers(element) {
  for (let el = parentElement(element); el; el = parentElement(el)) {
    const name = nameOf(el);
    if (HEADERS.has(name))
      return attributeValue(getAttribute(el.openingElement, "scope")) === "row" || inBody(el) ? undefined : el;
    if (name !== "div" && name !== "span") return undefined;
  }
  return undefined;
}

export default defineRule({
  id: "TBL-002",
  level: "rule",
  verdict: "Requirement",
  description:
    "A sort handler or tabIndex on a table header cell, aria-sort on a button, and a TanStack sort button with no order in code.",
  messages: {
    pointerOnly:
      "this header cell has a {{handler}} handler and no button or link inside it, so a keyboard cannot reach it. If it sorts the table, put a Button inside the TableHead with the heading as its text and move the handler there.",
    pointerInside:
      "this {{name}} inside a header cell has a {{handler}} handler, and the cell has no button or link, so a keyboard cannot reach it. If it sorts the table, make it a Button with the heading as its text.",
    cellAsButton:
      "this header cell is given {{what}} to make it a control, so it stops being a column header. Keep the cell a plain TableHead and put a Button inside it for the sort.",
    ariaSortOnButton:
      "aria-sort is on the {{name}}, where it does not say anything. Put aria-sort on the TableHead of the sorted column instead.",
    orderNotInCode:
      'this header sorts with TanStack Table, but no header cell in the table sets aria-sort, so the order shows only as an arrow. Set aria-sort on the TableHead from header.column.getIsSorted(): "ascending" for asc, "descending" for desc, none when false.',
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;
    /** Local names imported from icon libraries in this file. */
    const icons = new Set();
    /** @param {string} name */
    const isIcon = (name) => /Icon$/.test(name) || icons.has(name) || icons.has(name.split(".")[0]);
    return {
      ImportDeclaration(node) {
        if (!ICON_SOURCES.test(String(node.source.value))) return;
        for (const s of node.specifiers) icons.add(s.local.name);
      },
      JSXOpeningElement(node) {
        const name = elementName(node) ?? "";
        const element = node.parent;

        if (SORT_TARGETS.has(name)) {
          const ariaSort = getAttribute(node, "aria-sort");
          if (ariaSort) context.report({ node: ariaSort, messageId: "ariaSortOnButton", data: { name } });
          return;
        }

        if (HEADERS.has(name)) {
          // A row header in the body does not sort a column.
          if (attributeValue(getAttribute(node, "scope")) === "row" || inBody(element)) return;
          const role = getAttribute(node, "role");
          const tabIndex = getAttribute(node, "tabIndex");
          const tab = attributeValue(tabIndex);
          if (attributeValue(role) === "button")
            context.report({ node: role, messageId: "cellAsButton", data: { what: 'role="button"' } });
          else if (typeof tab === "number" && tab >= 0)
            context.report({ node: tabIndex, messageId: "cellAsButton", data: { what: `tabIndex={${tab}}` } });
          else if (typeof tab === "string" && /^\d+$/.test(tab))
            context.report({ node: tabIndex, messageId: "cellAsButton", data: { what: `tabIndex="${tab}"` } });

          const handler = pointerHandler(node);
          if (handler && !holdsControl(element, keys, isIcon)) {
            context.report({ node: handler, messageId: "pointerOnly", data: { handler: handler.name.name } });
            return;
          }
          if (!handler) checkTanStack(element);
          return;
        }

        if (name === "div" || name === "span") {
          const handler = pointerHandler(node);
          if (!handler || getAttribute(node, "role") || getAttribute(node, "tabIndex")) return;
          const header = headerThroughWrappers(element);
          if (!header || pointerHandler(header.openingElement) || holdsControl(header, keys, isIcon)) return;
          context.report({ node: handler, messageId: "pointerInside", data: { name, handler: handler.name.name } });
        }
      },
    };

    /** The TanStack case, on a TableHead with no handler of its own. @param {any} header */
    function checkTanStack(header) {
      if (nameOf(header) !== "TableHead") return;
      let control;
      walk(header, keys, (n) => {
        if (control) return false;
        if (n.type !== "JSXElement" || !SORT_TARGETS.has(nameOf(n))) return undefined;
        const handler = getAttribute(n.openingElement, "onClick");
        if (handler?.value?.type === "JSXExpressionContainer" && sortsWithTanStack(handler.value.expression, keys))
          control = n;
        return undefined;
      });
      if (!control) return;
      let table;
      for (let el = parentElement(header); el; el = parentElement(el)) {
        if (TABLES.has(nameOf(el))) {
          table = el;
          break;
        }
      }
      if (!table || tableSetsAriaSort(table, keys) || maySayOrder(header, keys, isIcon)) return;
      context.report({ node: header.openingElement, messageId: "orderNotInCode" });
    }
  },
});
