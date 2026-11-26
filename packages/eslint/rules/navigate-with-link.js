/**
 * justified/navigate-with-link, for ACT-009a (a guideline): a control not
 * shown as a link that only takes people to another address is a link in
 * code, not a button that changes the address by script.
 *
 * Flags:
 *   - A `Button` without `asChild` and not `variant="link"`, or a native
 *     `button`, whose `onClick` does nothing but `router.push` or
 *     `replace`, `navigate()` from `useNavigate`, `window.open` or setting
 *     `window.location`. Page buttons that call `router.push("?page=3")`
 *     are caught here too.
 *   - A `DropdownMenuItem` or `SidebarMenuButton` without `asChild` whose
 *     `onSelect` or `onClick` does nothing but go to another address.
 *   - `Tabs` whose `onValueChange` does nothing but go to another path:
 *     tabs that are routes.
 *
 * Left alone:
 *   - `Button variant="link"` and an underlined `button`: being shown as a
 *     link makes them ACT-009's requirement, which
 *     justified/clickable-has-role reports.
 *   - Act, then move: a handler that does anything besides navigating,
 *     such as saving first; an address or label about signing out or
 *     searching; an address built from React state, an input's value or
 *     react-hook-form's values; a `type="submit"` button, and any button
 *     inside a form.
 *   - `router.back()`, `navigate(-1)`, `router.refresh()`, and `Tabs` that only change a
 *     search param or hash of the same page.
 *   - Handlers from props or other files, and routers the rule cannot
 *     trace. `CommandItem`, whose items cannot hold a link.
 */
import { defineRule } from "../lib/define-rule.js";
import { visibleText } from "../lib/button-label-helpers.js";
import { readClassList } from "../lib/class-token-helpers.js";
import { attributeValue, elementName, findAncestorElement, getAttribute, hasSpread } from "../lib/jsx.js";
import { ACT_THEN_MOVE, handlerReader, isOn } from "../lib/link-role-helpers.js";

const MENU_ITEMS = new Set(["DropdownMenuItem", "SidebarMenuButton"]);

export default defineRule({
  id: "ACT-009a",
  level: "guideline",
  verdict: "Insufficient evidence (1 of 3 judges spoke)",
  description:
    "A Button, button, DropdownMenuItem or SidebarMenuButton whose click only goes to another address by script, and Tabs whose change only goes to another path.",
  messages: {
    button:
      'this button only goes to another address by script. It is announced as a button, and people cannot open it in a new tab, copy its address or find it in the list of links. Make it a link that keeps the button look: `<Button asChild><Link href="...">...</Link></Button>`.',
    menuItem:
      'this {{what}} only goes to another page by script, so it cannot be opened in a new tab or copied. Wrap a real link with asChild: `<{{what}} asChild><Link href="...">...</Link></{{what}}>`.',
    tabs: 'these tabs go to another path when they change, so each tab is a page of its own but is not a link. Build route tabs as links, such as a `nav` of `Link`s marked with `aria-current="page"`. Tabs that only mirror the open tab in a search param of the same page are fine.',
  },
  create(context) {
    const reader = handlerReader(context);
    const text = (/** @type {any} */ node) => context.sourceCode.getText(node);

    /**
     * Whether a handler only goes somewhere, and not to sign out or with
     * what the person typed.
     * @param {any} attribute
     */
    const onlyGoes = (attribute) => {
      if (attribute?.value?.type !== "JSXExpressionContainer") return undefined;
      const targets = reader.onlyNavigates(attribute.value.expression);
      if (!targets) return undefined;
      if (targets.some((t) => !t || ACT_THEN_MOVE.test(text(t)) || reader.readsInput(t))) return undefined;
      return targets;
    };

    /** Whether the element's label is about signing out or searching. @param {any} element */
    const actLabel = (element) => {
      const label = visibleText(element, { ignoreSelfClosing: true });
      const named = attributeValue(getAttribute(element.openingElement, "aria-label"));
      return (
        (label !== undefined && ACT_THEN_MOVE.test(label)) || (typeof named === "string" && ACT_THEN_MOVE.test(named))
      );
    };

    return {
      JSXElement(element) {
        const opening = element.openingElement;
        const name = elementName(opening) ?? "";
        if (hasSpread(opening) || isOn(opening, "asChild")) return;

        if (name === "Tabs") {
          const change = getAttribute(opening, "onValueChange");
          const targets = onlyGoes(change);
          if (targets && targets.every((t) => !reader.sameView(t))) context.report({ node: change, messageId: "tabs" });
          return;
        }

        if (MENU_ITEMS.has(name)) {
          for (const handler of ["onSelect", "onClick"]) {
            const attribute = getAttribute(opening, handler);
            if (attribute && onlyGoes(attribute) && !actLabel(element)) {
              context.report({ node: attribute, messageId: "menuItem", data: { what: name } });
              return;
            }
          }
          return;
        }

        if (name !== "Button" && name !== "button") return;
        if (name === "Button" && attributeValue(getAttribute(opening, "variant")) === "link") return;
        if (getAttribute(opening, "role")) return;
        const type = attributeValue(getAttribute(opening, "type"));
        if (type === "submit") return;
        if (findAncestorElement(opening, (n) => n === "form" || n === "Form")) return;
        const onClick = getAttribute(opening, "onClick");
        if (!onlyGoes(onClick) || actLabel(element)) return;
        // An underlined native button is shown as a link: that is ACT-009.
        if (name === "button" && readClassList(context, opening)?.certain.includes("underline")) return;
        context.report({ node: onClick, messageId: "button" });
      },
    };
  },
});
