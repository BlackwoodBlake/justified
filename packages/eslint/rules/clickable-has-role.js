/**
 * justified/clickable-has-role, for ACT-009 (a rule): everything people
 * click to go somewhere or to act has a control role in code, and
 * something shown as a link that only goes somewhere is a link.
 *
 * Flags, for shadcn components that a plain-HTML linter cannot see into:
 *   - `onClick` on a shadcn `Card` (or one of its parts), `Badge` or
 *     `Avatar`, or on an icon component such as lucide's `Star`, with no
 *     `role`.
 *   - `PaginationLink`, `PaginationPrevious`, `PaginationNext` or
 *     `BreadcrumbLink` with `onClick` and no `href`: they render an `<a>`,
 *     which has no role without an address.
 *   - A link-looking control that only goes somewhere by script:
 *     `Button variant="link"` without `asChild`, or a native `button` with
 *     the `underline` class, whose `onClick` does nothing but
 *     `router.push`, `navigate()` from `useNavigate`, `window.open` or
 *     setting `window.location`.
 *   - A `DialogTrigger`, `AlertDialogTrigger`, `SheetTrigger`,
 *     `DrawerTrigger`, `DropdownMenuTrigger`, `PopoverTrigger` or
 *     `CollapsibleTrigger` with `asChild` around a `div`, `span`, `Avatar`
 *     or `Badge`.
 *
 * Left alone:
 *   - Native `div`, `span`, `li`, `img`, `svg` and `<a>` without `href`
 *     with `onClick`: eslint-plugin-jsx-a11y's no-static-element-interactions
 *     and click-events-have-key-events already report them, so this rule
 *     does not report them twice.
 *   - A pointer shortcut: a card or badge that holds a link, a button or
 *     another component that may render one, and an icon inside a control.
 *     A handler that only stops propagation.
 *   - Anything with `role`, spread props or `asChild`, and a trigger's
 *     `div` or `span` that holds a button or link, whose clicks it only
 *     passes on.
 *   - Act, then move: a handler that does anything besides navigating, an
 *     address or label about signing out or searching, an address built
 *     from React state or an input's value, and a button inside a form.
 *   - Handlers from props or other files, and routers the rule cannot trace.
 */
import { defineRule } from "../lib/define-rule.js";
import { visibleText } from "../lib/button-label-helpers.js";
import { readClassList } from "../lib/class-token-helpers.js";
import { attributeValue, elementName, findAncestorElement, getAttribute, hasSpread, unwrap, walk } from "../lib/jsx.js";
import { ACT_THEN_MOVE, TRIGGERS, handlerReader, isOn, onlyChild, propertyName } from "../lib/link-role-helpers.js";
import { iconImports, isIcon } from "../lib/name-helpers.js";

/** Whether an element holds a button or a link below it. @param {any} element @param {any} keys */
function holdsControl(element, keys) {
  let found = false;
  walk(element, keys, (n) => {
    if (found) return false;
    if (n !== element && n.type === "JSXElement" && /^(a|button|Button|Link)$/.test(elementName(n.openingElement) ?? ""))
      found = true;
    return undefined;
  });
  return found;
}

const CARD_PARTS = new Set([
  "Card",
  "CardHeader",
  "CardTitle",
  "CardDescription",
  "CardContent",
  "CardFooter",
  "CardAction",
]);
const DISPLAY = new Set([...CARD_PARTS, "Badge", "Avatar", "AvatarImage", "AvatarFallback"]);
const ANCHOR_PARTS = new Set(["PaginationLink", "PaginationPrevious", "PaginationNext", "BreadcrumbLink"]);
const CONTROL_NAMES =
  /^(a|button|input|select|textarea|summary|label)$|Link$|Button$|Trigger$|Item$|^(Checkbox|Switch|Select|Input|Textarea|Slider|Toggle)$/;
const FUNCTIONS = new Set(["FunctionExpression", "ArrowFunctionExpression", "FunctionDeclaration"]);

/** Whether an element name is an intrinsic HTML element. @param {string} name */
const intrinsic = (name) => /^[a-z]/.test(name);

export default defineRule({
  id: "ACT-009",
  level: "rule",
  verdict: "Requirement",
  description:
    "A clickable shadcn Card, Badge, Avatar or icon with no role, a pagination or breadcrumb link with no href, a link-looking button that navigates by script, or a trigger around a div, span, Avatar or Badge.",
  messages: {
    noRole:
      "this {{what}} has onClick but no control role, so a screen reader reads it as text and leaves it out of its lists of links and buttons. Put a real link (`<Link href>`) or a `Button` inside it for the action. A click on the whole {{what}} may stay as a shortcut for that control.",
    noHref:
      "this {{what}} renders an `<a>` with onClick and no href, which has no role and takes no focus. Give it the address of the page as href, or use a `Button` if the click does not go to another address.",
    scriptedLink:
      'this looks like a link and only goes to another address, but it is a button that navigates by script, so a screen reader calls it a button and it is missing from the list of links. Render a real link: `<Button variant="link" asChild><Link href="...">...</Link></Button>`.',
    triggerChild:
      "{{trigger}} with asChild hands its button role to this {{child}}, which has none, so the trigger loses its role and keyboard use. Put a `Button` inside instead, or drop asChild so the trigger renders its own button.",
  },
  create,
});

/** @param {import("eslint").Rule.RuleContext} context */
function create(context) {
  const reader = handlerReader(context);
  /** @type {Set<string>} */
  let icons = new Set();

  /** Whether an element holds something that is, or may render, a control. @param {any} element */
  const holdsControl = (element) => {
    let found = false;
    walk(element, reader.keys, (n) => {
      if (found) return false;
      if (n === element || n === element.openingElement) return n === element ? undefined : false;
      if (FUNCTIONS.has(n.type)) return undefined;
      if (n.type === "JSXOpeningElement") {
        const name = elementName(n) ?? "";
        if (CONTROL_NAMES.test(name)) found = true;
        else if (!intrinsic(name) && !DISPLAY.has(name) && !isIcon({ openingElement: n }, icons)) found = true;
        else if (getAttribute(n, "href") || getAttribute(n, "role") || getAttribute(n, "onClick") || hasSpread(n))
          found = true;
      }
      return undefined;
    });
    return found;
  };

  /** Whether a handler only stops the event from going further. @param {any} expression */
  const onlyStops = (expression) => {
    const fn = reader.functionOf(expression);
    if (!fn) return false;
    const statements = fn.body.type === "BlockStatement" ? fn.body.body : [fn.body];
    return (
      statements.length > 0 &&
      statements.every((/** @type {any} */ s) => {
        const n = unwrap(s.type === "ExpressionStatement" ? s.expression : s);
        return (
          n?.type === "CallExpression" &&
          /^(stopPropagation|preventDefault)$/.test(propertyName(unwrap(n.callee)) ?? "")
        );
      })
    );
  };

  /**
   * Whether a link-looking control's handler only goes somewhere, and not
   * as the end of acting first.
   * @param {any} element A JSXElement.
   * @param {any} handler The onClick attribute.
   */
  const onlyGoesSomewhere = (element, handler) => {
    if (handler.value?.type !== "JSXExpressionContainer") return false;
    const targets = reader.onlyNavigates(handler.value.expression);
    if (!targets) return false;
    if (targets.some((t) => !t || ACT_THEN_MOVE.test(context.sourceCode.getText(t)) || reader.readsInput(t)))
      return false;
    const label = visibleText(element, { ignoreSelfClosing: true });
    if (label === undefined || ACT_THEN_MOVE.test(label)) return false;
    if (findAncestorElement(element.openingElement, (n) => n === "form" || n === "Form")) return false;
    return true;
  };

  return {
    Program(program) {
      icons = iconImports(program);
    },
    JSXElement(element) {
      const opening = element.openingElement;
      const name = elementName(opening) ?? "";
      if (hasSpread(opening) || getAttribute(opening, "role")) return;
      const onClick = getAttribute(opening, "onClick");

      // A trigger with asChild around something that has no role, and that holds no button or link whose clicks it
      // only passes on.
      if (TRIGGERS.has(name) && isOn(opening, "asChild")) {
        const child = onlyChild(element);
        const childName = child ? (elementName(child.openingElement) ?? "") : "";
        if (
          child &&
          /^(div|span|Avatar|Badge)$/.test(childName) &&
          !hasSpread(child.openingElement) &&
          !getAttribute(child.openingElement, "role") &&
          !isOn(child.openingElement, "asChild") &&
          !holdsControl(child, context.sourceCode.visitorKeys)
        )
          context.report({
            node: child.openingElement,
            messageId: "triggerChild",
            data: { trigger: name, child: childName },
          });
        return;
      }

      if (!onClick || isOn(opening, "asChild")) return;

      // A shadcn part that renders an <a> with no address.
      if (ANCHOR_PARTS.has(name)) {
        if (!getAttribute(opening, "href"))
          context.report({ node: opening, messageId: "noHref", data: { what: name } });
        return;
      }

      // A card, badge, avatar or icon with a click handler.
      const icon = !intrinsic(name) && isIcon(element, icons);
      if (DISPLAY.has(name) || icon) {
        if (onClick.value?.type === "JSXExpressionContainer" && onlyStops(onClick.value.expression)) return;
        if (icon) {
          const inControl = findAncestorElement(opening, (n) => CONTROL_NAMES.test(n));
          if (inControl) return;
        } else if (holdsControl(element)) return;
        context.report({ node: onClick, messageId: "noRole", data: { what: icon ? "icon" : name } });
        return;
      }

      // Shown as a link, goes somewhere by script.
      const linkButton = name === "Button" && attributeValue(getAttribute(opening, "variant")) === "link";
      let underlined = false;
      if (name === "button") {
        const list = readClassList(context, opening);
        underlined = Boolean(list?.certain.includes("underline"));
      }
      if ((linkButton || underlined) && onlyGoesSomewhere(element, onClick))
        context.report({ node: onClick, messageId: "scriptedLink" });
    },
  };
}
