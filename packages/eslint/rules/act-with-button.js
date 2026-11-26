/**
 * justified/act-with-button, for ACT-009b (a guideline): a control that
 * acts where the person is, such as saving, switching something or opening
 * a dialog or menu, is a button in code, also when it looks like a link.
 *
 * Flags:
 *   - An `<a>` or `Link` with `href="#"`, `href=""` or a `javascript:`
 *     address and an `onClick`.
 *   - An `<a href>` or `Link` whose `onClick` always calls
 *     `preventDefault()` and then only sets state (`setX(...)`), toggles
 *     something (`toggleX()`) or calls `open()`, `close()`, `show()` or
 *     `hide()`, never going to the address.
 *   - A `DialogTrigger`, `AlertDialogTrigger`, `SheetTrigger`,
 *     `DrawerTrigger`, `DropdownMenuTrigger`, `PopoverTrigger` or
 *     `CollapsibleTrigger` with `asChild` around an `<a>` or `Link`.
 *
 * Left alone:
 *   - `href="#section"` and `href="#top"`, which jump on the same page, and
 *     an `href="#"` handler that only scrolls.
 *   - A handler that navigates anywhere (`router.push(href)` and the like),
 *     reads a modifier key or the mouse button, scrolls, calls
 *     `preventDefault()` only under a condition, or calls anything the
 *     rule cannot tell acts in place, such as a tracking call. A link with
 *     a real address that also records the click stays a link.
 *   - An `<a>` with no `href` at all: that is ACT-009, and
 *     eslint-plugin-jsx-a11y already reports it.
 *   - Spread props, which may bring the address or the handler.
 */
import { defineRule } from "../lib/define-rule.js";
import { attributeValue, elementName, getAttribute, hasSpread, unwrap, walk } from "../lib/jsx.js";
import { TRIGGERS, handlerReader, isOn, onlyChild, propertyName } from "../lib/link-role-helpers.js";

const LINKS = new Set(["a", "Link"]);
const SCROLL = /^(scrollTo|scroll|scrollBy|scrollIntoView)$/;
const MODIFIERS = new Set(["metaKey", "ctrlKey", "shiftKey", "altKey", "button", "buttons"]);
/** Calls that only change something in place. */
const IN_PLACE = /^(set[A-Z]\w*|toggle\w*|open|close|show|hide|preventDefault|stopPropagation)$/;
const FUNCTIONS = new Set(["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"]);

/** Whether an address goes nowhere: "#", "" or a `javascript:` address. @param {unknown} href */
const goesNowhere = (href) =>
  typeof href === "string" && (href === "#" || href === "" || /^\s*javascript:/i.test(href));

export default defineRule({
  id: "ACT-009b",
  level: "guideline",
  verdict: "Insufficient evidence (1 of 3 judges spoke)",
  description:
    'A link to "#", "" or javascript: with onClick, a link whose click is cancelled to act in place, or a trigger with asChild around a link.',
  messages: {
    fakeHref:
      'this link has the address {{href}} and acts on click, so a screen reader says "link" though it goes nowhere, and a middle click or Copy link gives nothing useful. Use a `Button` instead, with `variant="link"` if it should look like a link.',
    cancelled:
      'this link cancels its own address and acts in place instead, so people hear "link" and expect to go there. Use a `Button` for the action, with `variant="link"` if it should look like a link, or let the link go to its address.',
    triggerLink:
      '{{trigger}} with asChild turns this {{child}} into the control that opens it, so it is announced as a link and loses the button\'s Space key. Put a `Button` inside instead, with `variant="link"` if it should look like a link.',
  },
  create(context) {
    const reader = handlerReader(context);
    const keys = context.sourceCode.visitorKeys;

    /**
     * What a handler does, read from its body: whether it only scrolls,
     * and whether it cancels the address and then only acts in place.
     * @param {any} expression
     */
    const readHandler = (expression) => {
      const fn = reader.functionOf(expression);
      if (!fn) return undefined;
      const statements = fn.body.type === "BlockStatement" ? fn.body.body : [fn.body];
      const cancels = statements.some((/** @type {any} */ s) => reader.isPreventDefault(s));
      let scrolls = false;
      let other = false;
      let inPlace = false;
      walk(fn.body, keys, (n) => {
        if (n !== fn.body && FUNCTIONS.has(n.type)) {
          other = true;
          return false;
        }
        if (n.type === "MemberExpression" && MODIFIERS.has(propertyName(n) ?? "")) other = true;
        if (n.type === "AssignmentExpression" && reader.navigationIn(n)) other = true;
        if (n.type !== "CallExpression") return undefined;
        if (reader.navigator(n.callee)) {
          other = true;
          return undefined;
        }
        const callee = unwrap(n.callee);
        const name = callee?.type === "Identifier" ? callee.name : (propertyName(callee) ?? "");
        if (SCROLL.test(name)) scrolls = true;
        else if (IN_PLACE.test(name)) {
          if (!/^(preventDefault|stopPropagation)$/.test(name)) inPlace = true;
        } else other = true;
        return undefined;
      });
      return { onlyScrolls: scrolls && !other && !inPlace, actsInPlace: cancels && inPlace && !scrolls && !other };
    };

    return {
      JSXElement(element) {
        const opening = element.openingElement;
        const name = elementName(opening) ?? "";
        if (hasSpread(opening)) return;

        if (TRIGGERS.has(name) && isOn(opening, "asChild")) {
          const child = onlyChild(element);
          const childName = child ? (elementName(child.openingElement) ?? "") : "";
          if (child && LINKS.has(childName) && !getAttribute(child.openingElement, "role"))
            context.report({
              node: child.openingElement,
              messageId: "triggerLink",
              data: { trigger: name, child: childName === "a" ? "<a>" : childName },
            });
          return;
        }

        if (!LINKS.has(name) || getAttribute(opening, "role")) return;
        const hrefAttribute = getAttribute(opening, "href");
        const onClick = getAttribute(opening, "onClick");
        if (!hrefAttribute || !onClick || onClick.value?.type !== "JSXExpressionContainer") return;
        const href = attributeValue(hrefAttribute);
        const handler = readHandler(onClick.value.expression);

        if (goesNowhere(href)) {
          if (handler?.onlyScrolls) return;
          if (!handler) {
            // A handler passed in by name may be the scroll to the top the rule allows.
            const n = unwrap(onClick.value.expression);
            if (/scroll|top/i.test(context.sourceCode.getText(n))) return;
          }
          context.report({ node: hrefAttribute, messageId: "fakeHref", data: { href: `"${href}"` } });
          return;
        }

        // A jump on the same page may do more on click; leave it.
        if (typeof href === "string" && href.startsWith("#")) return;
        if (handler?.actsInPlace) context.report({ node: onClick, messageId: "cancelled" });
      },
    };
  },
});
