/**
 * justified/active-link-aria-current, for NAV-002a (a rule): when a menu
 * shows the current page, the code or the text says so on that item.
 *
 * Flags:
 *   - A shadcn `SidebarMenuButton` or `SidebarMenuSubButton` with `asChild`
 *     and `isActive` whose one child is a plain link (`a href`, or `Link`
 *     imported from `next/link`, `react-router`, `react-router-dom` or
 *     `@remix-run/react`) with no `aria-current`. `isActive` sets only
 *     `data-active`, which styles the highlight.
 *   - A `SidebarMenuSubButton` without `asChild` (it renders an `a`) with
 *     `isActive` and `href`, and no `aria-current`.
 *   - `aria-current="page"` or `"true"` on an `li`, `SidebarMenuItem` or
 *     `SidebarMenuSubItem` around a plain link, when no link inside has
 *     its own `aria-current`. Conditional values count only when every
 *     branch is written out, such as `active ? "page" : undefined`.
 *
 * Left alone:
 *   - `aria-current` on the button itself: with `asChild` it lands on the
 *     link. Spread props on the button or the link, which may carry it.
 *   - Visually hidden text such as "(current page)" in the link (`sr-only`,
 *     a `VisuallyHidden` component, or text with "current").
 *   - React Router's `NavLink`, TanStack Router's `Link` and any link
 *     component the rule does not know, since they may set it themselves.
 *   - `SidebarMenuButton` without `asChild`, which renders a button.
 *   - Links whose current state is only a class, `NavigationMenuLink`
 *     without `active`, `aria-selected` on native links (jsx-a11y covers
 *     it), and "page" on two items at once: which class means current, and
 *     what matches at run time, take judgement or show only when it runs.
 *   - Pagination, where "page" marks the current page of results.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, findAncestorElement, getAttribute, hasSpread, unwrap, walk } from "../lib/jsx.js";

const SIDEBAR_BUTTONS = new Set(["SidebarMenuButton", "SidebarMenuSubButton"]);
const ITEM_WRAPPERS = new Set(["li", "SidebarMenuItem", "SidebarMenuSubItem"]);
/** Link components that never set aria-current by themselves. */
const PLAIN_LINK_SOURCES = new Set(["next/link", "react-router", "react-router-dom", "@remix-run/react"]);
/** Signs of visually hidden text that says the item is current. */
const HIDDEN_TEXT = /sr-only|visually-hidden|VisuallyHidden|ScreenReaderOnly|\bcurrent\b/i;
const CURRENT_VALUES = new Set(["page", "true", true]);

/** Whether an attribute is there and not written as `false` or `undefined`. @param {any} attribute */
function isOn(attribute) {
  if (!attribute) return false;
  if (attributeValue(attribute) === false) return false;
  const expression = attribute.value?.type === "JSXExpressionContainer" ? unwrap(attribute.value.expression) : null;
  return !(expression?.type === "Identifier" && expression.name === "undefined");
}

/** The one element child, ignoring whitespace and comments, or undefined. @param {any} element A JSXElement. */
function onlyChild(element) {
  const children = element.children.filter(
    (c) =>
      !(c.type === "JSXText" && c.value.trim() === "") &&
      !(c.type === "JSXExpressionContainer" && c.expression.type === "JSXEmptyExpression"),
  );
  return children.length === 1 && children[0].type === "JSXElement" ? children[0] : undefined;
}

/**
 * The values an `aria-current` can take for certain, or undefined when any
 * branch is computed. `undefined`, `null` and `false` stand for "not set".
 * @param {any} attribute
 * @returns {unknown[] | undefined}
 */
function currentValues(attribute) {
  if (attribute.value === null || attribute.value.type === "Literal") return [attributeValue(attribute)];
  if (attribute.value.type !== "JSXExpressionContainer") return undefined;
  /** @param {any} node @returns {unknown[] | undefined} */
  const values = (node) => {
    const n = unwrap(node);
    if (!n) return undefined;
    if (n.type === "Literal") return [n.value];
    if (n.type === "TemplateLiteral" && n.expressions.length === 0) return [n.quasis[0].value.cooked];
    if (n.type === "Identifier" && n.name === "undefined") return [undefined];
    if (n.type === "ConditionalExpression") {
      const a = values(n.consequent);
      const b = values(n.alternate);
      return a && b ? [...a, ...b] : undefined;
    }
    if (n.type === "LogicalExpression" && n.operator === "&&") {
      const b = values(n.right);
      return b ? [false, ...b] : undefined;
    }
    return undefined;
  };
  return values(attribute.value.expression);
}

export default defineRule({
  id: "NAV-002a",
  level: "rule",
  verdict: "Requirement",
  description:
    "A sidebar item shown as current with isActive, or a list item with aria-current, whose link has no aria-current.",
  messages: {
    activeWithoutCurrent:
      'this item is shown as the current page through isActive, which only sets data-active for the highlight, so a screen reader hears no current page. Add aria-current={active ? "page" : undefined} to the link, from the same condition as isActive.',
    currentOnWrapper:
      "aria-current is on the {{wrapper}} around the link, not on the link, so a screen reader that reaches the link does not hear that it is the current page. Move aria-current to the link.",
  },
  create(context) {
    const keys = context.sourceCode.visitorKeys;
    /** Local names of link components that never set aria-current. */
    const plainLinks = new Set();

    /** Whether an element is a plain link: `a href` or a known plain `Link`. @param {any} opening */
    const isPlainLink = (opening) => {
      const name = elementName(opening);
      if (name === "a") return Boolean(getAttribute(opening, "href"));
      return Boolean(name && plainLinks.has(name));
    };

    /** Whether the link or its contents say it is current. @param {any} element A JSXElement. */
    const saysCurrent = (element) =>
      Boolean(getAttribute(element.openingElement, "aria-current")) ||
      hasSpread(element.openingElement) ||
      HIDDEN_TEXT.test(context.sourceCode.getText(element).replace(/aria-current/g, ""));

    return {
      Program(node) {
        for (const statement of node.body) {
          if (statement.type !== "ImportDeclaration" || !PLAIN_LINK_SOURCES.has(String(statement.source.value)))
            continue;
          for (const s of statement.specifiers) {
            const imported =
              s.type === "ImportSpecifier"
                ? s.imported.type === "Identifier"
                  ? s.imported.name
                  : s.imported.value
                : null;
            // next/link exports Link as its default; the routers export it by name.
            if (s.type === "ImportDefaultSpecifier" && statement.source.value === "next/link")
              plainLinks.add(s.local.name);
            if (imported === "Link") plainLinks.add(s.local.name);
          }
        }
      },
      JSXElement(element) {
        const opening = element.openingElement;
        const name = elementName(opening);
        if (!name) return;

        if (SIDEBAR_BUTTONS.has(name)) {
          if (!isOn(getAttribute(opening, "isActive"))) return;
          // With asChild, Slot passes the button's own props, aria-current too, to the link.
          if (getAttribute(opening, "aria-current") || hasSpread(opening)) return;
          if (isOn(getAttribute(opening, "asChild"))) {
            const link = onlyChild(element);
            if (!link || !isPlainLink(link.openingElement) || saysCurrent(link)) return;
            context.report({ node: getAttribute(opening, "isActive"), messageId: "activeWithoutCurrent" });
          } else if (name === "SidebarMenuSubButton" && getAttribute(opening, "href") && !saysCurrent(element)) {
            context.report({ node: getAttribute(opening, "isActive"), messageId: "activeWithoutCurrent" });
          }
          return;
        }

        if (ITEM_WRAPPERS.has(name)) {
          const attribute = getAttribute(opening, "aria-current");
          if (!attribute) return;
          const values = currentValues(attribute);
          if (!values || !values.some((v) => CURRENT_VALUES.has(/** @type {any} */ (v)))) return;
          if (
            !values.every(
              (v) => CURRENT_VALUES.has(/** @type {any} */ (v)) || v === undefined || v === null || v === false,
            )
          )
            return;
          if (findAncestorElement(element, (n) => /^Pagination/.test(n))) return;
          let plain = false;
          let other = false;
          walk(element, keys, (n) => {
            if (n === element || n.type !== "JSXElement") return undefined;
            const o = n.openingElement;
            const childName = elementName(o) ?? "";
            const linkish = childName === "a" || /Link$/.test(childName) || SIDEBAR_BUTTONS.has(childName);
            if (!linkish) return undefined;
            // A link that has its own mark, may get one through a spread, or may set one itself.
            if (getAttribute(o, "aria-current") || hasSpread(o)) other = true;
            else if (isPlainLink(o)) plain = true;
            else if (!SIDEBAR_BUTTONS.has(childName)) other = true;
            return undefined;
          });
          if (!plain || other) return;
          context.report({
            node: attribute,
            messageId: "currentOnWrapper",
            data: { wrapper: name === "li" ? "li" : name },
          });
        }
      },
    };
  },
});
